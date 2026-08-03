import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { ingredients as seedIngredients, meals as seedMeals } from './seed-data'
import { mealAssets } from './seed-assets'

const prisma = new PrismaClient()

const INGREDIENT_KEYS = new Set(seedIngredients.map((i) => i.key))

// ---- Проверки целостности seed-данных: несоответствие ломает заливку. ----

for (const meal of seedMeals) {
  const missing = meal.ingredients
    .map((i) => i.key)
    .filter((key) => !INGREDIENT_KEYS.has(key))
  if (missing.length > 0) {
    throw new Error(`Блюдо «${meal.name}» ссылается на отсутствующие ингредиенты: ${missing.join(', ')}`)
  }
  if (meal.tags.includes('vegan') && !meal.tags.includes('vegetarian')) {
    throw new Error(`Блюдо «${meal.name}» отмечено vegan, но не vegetarian`)
  }
}

const round1 = (n: number) => Math.round(n * 10) / 10

/** Калорийность блюда = сумма калорий ингредиентов с их граммовками. */
function computeNutrition(meal: (typeof seedMeals)[number]) {
  let calories = 0
  let proteinG = 0
  let fatG = 0
  let carbsG = 0
  let gramsPerServing = 0

  for (const item of meal.ingredients) {
    const ingredient = seedIngredients.find((i) => i.key === item.key)!
    const factor = item.grams / 100
    calories += ingredient.kcalPer100g * factor
    proteinG += ingredient.proteinPer100g * factor
    fatG += ingredient.fatPer100g * factor
    carbsG += ingredient.carbsPer100g * factor
    gramsPerServing += item.grams
  }

  return {
    calories: Math.round(calories),
    proteinG: round1(proteinG),
    fatG: round1(fatG),
    carbsG: round1(carbsG),
    gramsPerServing,
  }
}

function summary() {
  const perType: Record<string, number> = { BREAKFAST: 0, LUNCH: 0, DINNER: 0, SNACK: 0 }
  let vegan = 0
  let glutenFree = 0

  for (const m of seedMeals) {
    perType[m.type] += 1
    if (m.tags.includes('vegan')) vegan += 1
    if (m.tags.includes('gluten-free')) glutenFree += 1
  }

  const calories = seedMeals.map((m) => computeNutrition(m).calories)
  return {
    perType,
    vegan,
    glutenFree,
    ranges: `calories: ${Math.min(...calories)}–${Math.max(...calories)}`,
  }
}

async function main() {
  const s = summary()
  console.log('[seed] блюд:', seedMeals.length, JSON.stringify(s.perType), '| vegan:', s.vegan, '| gluten-free:', s.glutenFree, '|', s.ranges)

  // Очистка сносит и пользовательские данные (меню, замеры, тренировки).
  // На боевой базе это делается только осознанно: SEED_ALLOW_WIPE=yes.
  const existingLogs = await prisma.weightLog.count()
  const existingMenus = await prisma.weeklyMenu.count()
  if ((existingLogs > 0 || existingMenus > 0) && process.env.SEED_ALLOW_WIPE !== 'yes') {
    console.error(
      `\n[seed] ОСТАНОВЛЕНО: в базе есть пользовательские данные ` +
        `(замеров веса: ${existingLogs}, меню: ${existingMenus}).\n` +
        `Seed удалит их. Если это то, что нужно — запустите с SEED_ALLOW_WIPE=yes.\n`,
    )
    process.exit(1)
  }

  console.log('[seed] очистка старых данных...')
  await prisma.$transaction([
    prisma.mealCompletion.deleteMany(),
    prisma.menuEntry.deleteMany(),
    prisma.weeklyMenu.deleteMany(),
    prisma.weightLog.deleteMany(),
    prisma.workoutLog.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.mealIngredient.deleteMany(),
    prisma.ingredient.deleteMany(),
    prisma.meal.deleteMany(),
  ])

  console.log('[seed] ингредиенты...')
  await prisma.ingredient.createMany({
    data: seedIngredients,
    skipDuplicates: true,
  })
  const ingredientRows = await prisma.ingredient.findMany({ select: { key: true, id: true } })
  const ingredientIdByKey = new Map(ingredientRows.map((r) => [r.key, r.id]))

  console.log('[seed] блюда...')
  for (const meal of seedMeals) {
    const nutrition = computeNutrition(meal)
    const assets = mealAssets[meal.name]
    if (!assets) console.warn(`[seed] нет фото/рецепта для «${meal.name}»`)
    await prisma.meal.create({
      data: {
        name: meal.name,
        nameEn: meal.nameEn,
        description: meal.description,
        type: meal.type,
        calories: nutrition.calories,
        proteinG: nutrition.proteinG,
        fatG: nutrition.fatG,
        carbsG: nutrition.carbsG,
        gramsPerServing: nutrition.gramsPerServing,
        prepTimeMinutes: meal.prepTimeMinutes,
        tags: meal.tags,
        photoUrl: assets?.photoUrl ?? null,
        recipeIngredients: assets?.recipeIngredients ?? null,
        recipeSteps: assets?.recipeSteps ?? [],
        ingredients: {
          create: meal.ingredients.map((item) => ({
            ingredientId: ingredientIdByKey.get(item.key)!,
            grams: item.grams,
          })),
        },
      },
    })
  }

  // Администратор из env, с дефолтом для локальной разработки.
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin12345'
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existing) {
    console.log('[seed] создание администратора...')
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        name: 'Администратор',
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    })
  }

  console.log('[seed] демо-пользователь demo@marafon.dev / demo12345...')
  await prisma.user.upsert({
    where: { email: 'demo@marafon.dev' },
    update: {},
    create: {
      email: 'demo@marafon.dev',
      passwordHash: await bcrypt.hash('demo12345', 12),
      name: 'Демо',
      emailVerified: new Date(),
    },
  })

  console.log('[seed] готово')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
