import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { dateOnlyUtc, nutritionForProfile, startOfWeekUtc } from '@/lib/profile'
import { PageShell } from '@/components/layout/PageShell'
import { Card } from '@/components/ui/Card'
import { WeekGrid, type Entry } from '@/components/menu/WeekGrid'
import { GenerateMenuButton } from './GenerateMenuButton'

const DAY_MS = 24 * 60 * 60 * 1000

export default async function MenuPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const t = await getTranslations()
  const weekStart = startOfWeekUtc(new Date())
  const weekEnd = new Date(weekStart.getTime() + 7 * DAY_MS)

  const [menu, profile, completions] = await Promise.all([
    prisma.weeklyMenu.findUnique({
      where: { userId_weekStart: { userId: session.user.id, weekStart } },
      include: {
        entries: {
          include: {
            meal: {
              select: {
                id: true,
                name: true,
                nameEn: true,
                description: true,
                calories: true,
                proteinG: true,
                fatG: true,
                carbsG: true,
                prepTimeMinutes: true,
                photoUrl: true,
                tags: true,
                recipeIngredients: true,
                recipeSteps: true,
                ingredients: {
                  select: {
                    grams: true,
                    ingredient: { select: { name: true, nameEn: true } },
                  },
                },
              },
            },
          },
          orderBy: [{ dayOfWeek: 'asc' }],
        },
      },
    }),
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.mealCompletion.findMany({
      where: { userId: session.user.id, date: { gte: weekStart, lt: weekEnd } },
      select: { date: true, mealId: true, mealType: true },
    }),
  ])

  if (!menu || menu.entries.length === 0) {
    return (
      <PageShell title={t('menu.title')}>
        <Card className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-sm text-muted">{t('menu.empty')}</p>
          <GenerateMenuButton label={t('menu.generate')} />
        </Card>
      </PageShell>
    )
  }

  // Отметки «съедено» приходят датами — переводим в индекс дня недели,
  // чтобы клиент не считал даты повторно.
  const eaten = new Set(
    completions.map((c) => {
      const day = Math.round((c.date.getTime() - weekStart.getTime()) / DAY_MS)
      return `${day}:${c.mealType}:${c.mealId}`
    }),
  )

  const entries: Entry[] = menu.entries.map((e) => ({
    id: e.id,
    dayOfWeek: e.dayOfWeek,
    mealType: e.mealType,
    scale: e.scale,
    eaten: eaten.has(`${e.dayOfWeek}:${e.mealType}:${e.meal.id}`),
    meal: {
      ...e.meal,
      ingredients: e.meal.ingredients.map((i) => ({
        name: i.ingredient.name,
        nameEn: i.ingredient.nameEn,
        grams: i.grams,
      })),
    },
  }))

  const dayTotals = Array.from({ length: 7 }, (_, day) => {
    const dayEntries = entries.filter((e) => e.dayOfWeek === day)
    return {
      day,
      calories: dayEntries.reduce((sum, e) => sum + e.meal.calories * e.scale, 0),
      proteinG: dayEntries.reduce((sum, e) => sum + e.meal.proteinG * e.scale, 0),
      fatG: dayEntries.reduce((sum, e) => sum + e.meal.fatG * e.scale, 0),
      carbsG: dayEntries.reduce((sum, e) => sum + e.meal.carbsG * e.scale, 0),
    }
  })

  const today = dateOnlyUtc(new Date())
  const todayIndex = Math.round((today.getTime() - weekStart.getTime()) / DAY_MS)

  return (
    <PageShell title={t('menu.title')} description={t('menu.replaceHint')}>
      <WeekGrid
        week={{ entries, dayTotals }}
        weekStartISO={weekStart.toISOString()}
        todayIndex={todayIndex >= 0 && todayIndex <= 6 ? todayIndex : null}
        targetCalories={profile ? nutritionForProfile(profile).targetCalories : null}
      />
    </PageShell>
  )
}
