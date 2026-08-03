'use server'

import bcrypt from 'bcryptjs'
import { randomBytes, createHash } from 'node:crypto'
import { addHours } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { sendPasswordResetEmail, sendVerificationEmail } from '@/lib/mailer'
import { generateWeeklyMenu } from '@/lib/menu/generator'
import { nutritionForProfile, startOfWeekUtc } from '@/lib/profile'
import { profileSchema, weightLogSchema, workoutLogSchema } from '@/lib/validators/profile'
import { registerSchema, resetPasswordSchema, forgotPasswordSchema } from '@/lib/validators/auth'
import type { MealType } from '@/lib/menu/types'

// ---------- Регистрация и сброс пароля ----------

export async function registerUser(input: unknown) {
  const data = registerSchema.safeParse(input)
  if (!data.success) return { ok: false as const, error: data.error.issues[0]?.message }

  const exists = await prisma.user.findUnique({ where: { email: data.data.email } })
  if (exists) return { ok: false as const, error: 'Этот email уже зарегистрирован' }

  const passwordHash = await bcrypt.hash(data.data.password, 12)
  const user = await prisma.user.create({
    data: {
      email: data.data.email,
      passwordHash,
      name: data.data.name,
    },
  })

  const token = randomBytes(32).toString('hex')
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      tokenHash: createHash('sha256').update(token).digest('hex'),
      expiresAt: addHours(new Date(), 24),
    },
  })
  await sendVerificationEmail(user.email, token)

  return { ok: true as const }
}

/** Подтверждение почты по одноразовому токену из письма. */
export async function verifyEmail(token: string) {
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const record = await prisma.verificationToken.findUnique({ where: { tokenHash } })

  if (!record || record.expiresAt < new Date() || record.usedAt) {
    return { ok: false as const, error: 'Ссылка недействительна или истекла' }
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } }),
    prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ])

  return { ok: true as const }
}

export async function requestPasswordReset(input: unknown) {
  const data = forgotPasswordSchema.safeParse(input)
  if (!data.success) return { ok: false as const, error: data.error.issues[0]?.message }

  const user = await prisma.user.findUnique({ where: { email: data.data.email } })
  // Не раскрываем существование аккаунта: ответ одинаковый в обоих случаях.
  if (!user) return { ok: true as const }

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })
  const token = randomBytes(32).toString('hex')
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: createHash('sha256').update(token).digest('hex'),
      expiresAt: addHours(new Date(), 1),
    },
  })
  await sendPasswordResetEmail(user.email, token)

  return { ok: true as const }
}

export async function resetPassword(input: unknown) {
  const data = resetPasswordSchema.safeParse(input)
  if (!data.success) return { ok: false as const, error: data.error.issues[0]?.message }

  const tokenHash = createHash('sha256').update(data.data.token).digest('hex')
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } })

  if (!record || record.expiresAt < new Date() || record.usedAt) {
    return { ok: false as const, error: 'Ссылка недействительна или истекла' }
  }

  const passwordHash = await bcrypt.hash(data.data.password, 12)
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ])

  return { ok: true as const }
}

// ---------- Профиль и онбординг ----------

export async function saveProfile(input: unknown) {
  const user = await requireUser()
  const data = profileSchema.safeParse(input)
  if (!data.success) return { ok: false as const, error: data.error.issues[0]?.message }

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: data.data,
    create: { userId: user.id, ...data.data },
  })

  return { ok: true as const }
}

/** Точка входа после онбординга: считаем нормы и сразу собираем меню. */
export async function completeOnboarding(input: unknown) {
  const user = await requireUser()
  const data = profileSchema.safeParse(input)
  if (!data.success) return { ok: false as const, error: data.error.issues[0]?.message }

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: data.data,
    create: { userId: user.id, ...data.data },
  })

  const weekStart = startOfWeekUtc(new Date())
  const existing = await prisma.weeklyMenu.findUnique({
    where: { userId_weekStart: { userId: user.id, weekStart } },
  })

  if (!existing) {
    const meals = await prisma.meal.findMany({
      where: { isPublished: true },
      select: { id: true, type: true, calories: true, proteinG: true, fatG: true, carbsG: true, tags: true },
    })
    const nutrition = nutritionForProfile(data.data)
    const entries = generateWeeklyMenu({
      targetCalories: nutrition.targetCalories,
      targetProteinG: nutrition.macros.proteinG,
      dietaryTags: data.data.dietaryTags,
      meals,
      seed: `${user.id}:${weekStart.toISOString()}`,
    })
    await prisma.weeklyMenu.create({
      data: {
        userId: user.id,
        weekStart,
        entries: {
          create: entries.map((e) => ({ ...e, mealId: e.mealId })),
        },
      },
    })
  }

  return { ok: true as const }
}

// ---------- Трекинг ----------

export async function upsertWeightLog(input: unknown) {
  const user = await requireUser()
  const data = weightLogSchema.safeParse(input)
  if (!data.success) return { ok: false as const, error: data.error.issues[0]?.message }

  const { date, ...rest } = data.data
  await prisma.weightLog.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: rest,
    create: { userId: user.id, date, ...rest },
  })

  return { ok: true as const }
}

export async function createWorkoutLog(input: unknown) {
  const user = await requireUser()
  const data = workoutLogSchema.safeParse(input)
  if (!data.success) return { ok: false as const, error: data.error.issues[0]?.message }

  await prisma.workoutLog.create({ data: { userId: user.id, ...data.data } })
  return { ok: true as const }
}

/** Переключение отметки «съедено» для приёма пищи. */
export async function toggleMealCompletion(input: { date: string; mealId: string; mealType: MealType; eaten: boolean }) {
  const user = await requireUser()
  // Дата приходит строкой YYYY-MM-DD. Разбираем как UTC-полночь —
  // так же, как dateOnlyUtc и z.coerce.date() в остальных логах.
  const date = new Date(`${input.date}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return { ok: false as const, error: 'Некорректная дата' }

  const existing = await prisma.mealCompletion.findUnique({
    where: { userId_date_mealId_mealType: { userId: user.id, date, mealId: input.mealId, mealType: input.mealType } },
  })

  if (input.eaten && !existing) {
    await prisma.mealCompletion.create({ data: { userId: user.id, date, mealId: input.mealId, mealType: input.mealType } })
  } else if (!input.eaten && existing) {
    await prisma.mealCompletion.delete({ where: { id: existing.id } })
  }

  return { ok: true as const }
}

// ---------- Меню ----------

export async function regenerateMenu() {
  const user = await requireUser()
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
  if (!profile) return { ok: false as const, error: 'Сначала заполните профиль' }

  const weekStart = startOfWeekUtc(new Date())
  await prisma.weeklyMenu.deleteMany({ where: { userId: user.id, weekStart } })

  const meals = await prisma.meal.findMany({
    where: { isPublished: true },
    select: { id: true, type: true, calories: true, proteinG: true, fatG: true, carbsG: true, tags: true },
  })
  const nutrition = nutritionForProfile(profile)

  let entries: ReturnType<typeof generateWeeklyMenu> = []
  try {
    entries = generateWeeklyMenu({
      targetCalories: nutrition.targetCalories,
      targetProteinG: nutrition.macros.proteinG,
      dietaryTags: profile.dietaryTags,
      meals,
      seed: `${user.id}:${weekStart.toISOString()}:${Date.now().toString(36)}`,
    })
  } catch {
    return { ok: false as const, error: 'notEnoughMeals' }
  }

  await prisma.weeklyMenu.create({
    data: {
      userId: user.id,
      weekStart,
      entries: { create: entries.map((e) => ({ ...e })) },
    },
  })

  return { ok: true as const }
}

/** Замена одного блюда в меню на альтернативу. */
export async function replaceMeal(input: { entryId: string; newMealId: string; scale: number }) {
  const user = await requireUser()
  const entry = await prisma.menuEntry.findUnique({ where: { id: input.entryId } })
  if (!entry) return { ok: false as const, error: 'Запись не найдена' }

  const menu = await prisma.weeklyMenu.findUnique({ where: { id: entry.menuId } })
  if (!menu || menu.userId !== user.id) return { ok: false as const, error: 'FORBIDDEN' }

  await prisma.menuEntry.update({
    where: { id: entry.id },
    data: { mealId: input.newMealId, scale: input.scale },
  })

  return { ok: true as const }
}

