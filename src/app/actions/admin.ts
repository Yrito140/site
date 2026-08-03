'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { storage } from '@/lib/storage'

const mealSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(160),
  nameEn: z.string().trim().max(160).optional().or(z.literal('').transform(() => undefined)),
  description: z.string().trim().max(500).optional().or(z.literal('').transform(() => undefined)),
  type: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
  prepTimeMinutes: z.coerce.number().int().min(1).max(600),
  tags: z.array(z.string().max(40)).max(12).default([]),
  isPublished: z.coerce.boolean().default(true),
  ingredients: z
    .array(z.object({ ingredientId: z.string().min(1), grams: z.coerce.number().min(1).max(2000) }))
    .min(1, 'Добавьте хотя бы один ингредиент')
    .max(20),
})

/** КБЖУ блюда всегда считается из ингредиентов — руками ввести нельзя. */
async function computeFromIngredients(items: { ingredientId: string; grams: number }[]) {
  const rows = await prisma.ingredient.findMany({
    where: { id: { in: items.map((i) => i.ingredientId) } },
  })
  const byId = new Map(rows.map((r) => [r.id, r]))

  let calories = 0
  let proteinG = 0
  let fatG = 0
  let carbsG = 0
  let gramsPerServing = 0

  for (const item of items) {
    const ing = byId.get(item.ingredientId)
    if (!ing) throw new Error('Ингредиент не найден')
    const f = item.grams / 100
    calories += ing.kcalPer100g * f
    proteinG += ing.proteinPer100g * f
    fatG += ing.fatPer100g * f
    carbsG += ing.carbsPer100g * f
    gramsPerServing += item.grams
  }

  const round1 = (n: number) => Math.round(n * 10) / 10
  return {
    calories: Math.round(calories),
    proteinG: round1(proteinG),
    fatG: round1(fatG),
    carbsG: round1(carbsG),
    gramsPerServing: Math.round(gramsPerServing),
  }
}

export async function saveMeal(input: unknown) {
  await requireAdmin()
  const parsed = mealSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message }

  const { id, ingredients, ...rest } = parsed.data
  const nutrition = await computeFromIngredients(ingredients)

  if (id) {
    await prisma.$transaction([
      prisma.mealIngredient.deleteMany({ where: { mealId: id } }),
      prisma.meal.update({
        where: { id },
        data: {
          ...rest,
          ...nutrition,
          ingredients: { create: ingredients },
        },
      }),
    ])
  } else {
    await prisma.meal.create({
      data: { ...rest, ...nutrition, ingredients: { create: ingredients } },
    })
  }

  revalidatePath('/admin/meals')
  return { ok: true as const }
}

export async function deleteMeal(id: string) {
  await requireAdmin()

  // Блюдо может стоять в чужих меню — сначала снимаем с публикации,
  // удаляем только если оно нигде не используется.
  const usage = await prisma.menuEntry.count({ where: { mealId: id } })
  if (usage > 0) {
    await prisma.meal.update({ where: { id }, data: { isPublished: false } })
    revalidatePath('/admin/meals')
    return { ok: true as const, unpublishedInstead: true }
  }

  const meal = await prisma.meal.findUnique({ where: { id }, select: { photoUrl: true } })
  await prisma.meal.delete({ where: { id } })
  if (meal?.photoUrl) await storage.remove(meal.photoUrl)

  revalidatePath('/admin/meals')
  return { ok: true as const, unpublishedInstead: false }
}

export async function togglePublished(id: string, isPublished: boolean) {
  await requireAdmin()
  await prisma.meal.update({ where: { id }, data: { isPublished } })
  revalidatePath('/admin/meals')
  return { ok: true as const }
}

export async function uploadMealPhoto(mealId: string, formData: FormData) {
  await requireAdmin()

  const file = formData.get('photo')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, error: 'Файл не выбран' }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await storage.put({ buffer, filename: file.name, contentType: file.type })

  const previous = await prisma.meal.findUnique({ where: { id: mealId }, select: { photoUrl: true } })
  await prisma.meal.update({ where: { id: mealId }, data: { photoUrl: url } })
  if (previous?.photoUrl) await storage.remove(previous.photoUrl)

  revalidatePath('/admin/meals')
  return { ok: true as const, url }
}
