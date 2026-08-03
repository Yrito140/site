import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { MealsTable } from './MealsTable'

export default async function AdminMealsPage() {
  const t = await getTranslations('admin')

  const [meals, ingredients] = await Promise.all([
    prisma.meal.findMany({
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      include: {
        ingredients: {
          include: { ingredient: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, kcalPer100g: true },
    }),
  ])

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">{t('meals')}</h1>
      <p className="mb-6 text-sm text-muted">
        Всего блюд: {meals.length}. КБЖУ считается из ингредиентов автоматически.
      </p>
      <MealsTable
        meals={meals.map((m) => ({
          id: m.id,
          name: m.name,
          nameEn: m.nameEn,
          description: m.description,
          type: m.type,
          calories: m.calories,
          proteinG: m.proteinG,
          fatG: m.fatG,
          carbsG: m.carbsG,
          prepTimeMinutes: m.prepTimeMinutes,
          tags: m.tags,
          isPublished: m.isPublished,
          photoUrl: m.photoUrl,
          ingredients: m.ingredients.map((i) => ({
            ingredientId: i.ingredientId,
            name: i.ingredient.name,
            grams: i.grams,
          })),
        }))}
        allIngredients={ingredients}
      />
    </div>
  )
}
