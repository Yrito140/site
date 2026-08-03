import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Activity, Dumbbell, Flame, Scale, TrendingDown, UtensilsCrossed } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { dateOnlyUtc, nutritionForProfile, startOfWeekUtc } from '@/lib/profile'
import { Card, CardHeader } from '@/components/ui/Card'
import { PageShell } from '@/components/layout/PageShell'
import { BmiScale } from '@/components/dashboard/BmiScale'
import { MacroBars } from '@/components/dashboard/MacroBars'
import { StatCard } from '@/components/dashboard/StatCard'
import { TodayMeals, type TodayEntry } from '@/components/dashboard/TodayMeals'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const t = await getTranslations()
  const today = dateOnlyUtc(new Date())
  const weekStart = startOfWeekUtc(new Date())

  const [profile, lastWeights, todayCompletions, weekWorkouts, menu] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.weightLog.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 2 }),
    prisma.mealCompletion.findMany({
      where: { userId, date: today },
      include: { meal: { select: { calories: true, proteinG: true, fatG: true, carbsG: true } } },
    }),
    prisma.workoutLog.findMany({ where: { userId, date: { gte: weekStart } } }),
    prisma.weeklyMenu.findUnique({
      where: { userId_weekStart: { userId, weekStart } },
      include: {
        entries: {
          include: {
            meal: { select: { id: true, name: true, nameEn: true, calories: true } },
          },
        },
      },
    }),
  ])

  if (!profile) redirect('/onboarding')

  const nutrition = nutritionForProfile(profile)
  const eaten = todayCompletions.reduce(
    (acc, c) => ({
      calories: acc.calories + c.meal.calories,
      proteinG: acc.proteinG + c.meal.proteinG,
      fatG: acc.fatG + c.meal.fatG,
      carbsG: acc.carbsG + c.meal.carbsG,
    }),
    { calories: 0, proteinG: 0, fatG: 0, carbsG: 0 },
  )

  const burnedThisWeek = weekWorkouts.reduce((sum, w) => sum + (w.caloriesBurned ?? 0), 0)
  const currentWeight = lastWeights[0]?.weightKg ?? profile.currentWeightKg
  const weightDelta = lastWeights.length === 2 ? currentWeight - lastWeights[1].weightKg : null
  const toTarget = profile.targetWeightKg ? currentWeight - profile.targetWeightKg : null

  // День недели в том же формате, что и в меню: пн = 0.
  const todayIndex = (new Date().getUTCDay() + 6) % 7
  const eatenIds = new Set(todayCompletions.map((c) => c.mealId))
  const todayEntries: TodayEntry[] = (menu?.entries ?? [])
    .filter((e) => e.dayOfWeek === todayIndex)
    .sort(
      (a, b) =>
        ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].indexOf(a.mealType) -
        ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].indexOf(b.mealType),
    )
    .map((e) => ({
      mealId: e.meal.id,
      mealType: e.mealType,
      name: e.meal.name,
      nameEn: e.meal.nameEn,
      calories: e.meal.calories,
      scale: e.scale,
      eaten: eatenIds.has(e.meal.id),
    }))

  return (
    <PageShell title={t('nav.dashboard')} description={t('app.tagline')}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          tone="accent"
          label={t('metrics.target')}
          value={nutrition.targetCalories}
          unit={t('metrics.kcal')}
          icon={<Flame className="size-[18px]" aria-hidden />}
          hint={`${t('menu.eaten')}: ${Math.round(eaten.calories)} ${t('metrics.kcal')}`}
        />
        <StatCard
          label={t('metrics.bmi')}
          value={nutrition.bmi}
          icon={<Activity className="size-[18px]" aria-hidden />}
          hint={t(`bmi.${nutrition.bmiCategory}`)}
        />
        <StatCard
          label={t('progress.change')}
          value={currentWeight.toFixed(1)}
          unit="кг"
          icon={<Scale className="size-[18px]" aria-hidden />}
          hint={
            weightDelta === null
              ? t('progress.noData')
              : `${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)} кг с прошлого замера`
          }
        />
        <StatCard
          label={t('workouts.weekTotal')}
          value={weekWorkouts.length}
          icon={<Dumbbell className="size-[18px]" aria-hidden />}
          hint={burnedThisWeek > 0 ? `${burnedThisWeek} ${t('metrics.kcal')} израсходовано` : undefined}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader
              title={t('metrics.protein') + ' / ' + t('metrics.fat') + ' / ' + t('metrics.carbs')}
              description={`План на день против съеденного`}
            />
            <MacroBars
              target={nutrition.macros}
              actual={eaten}
              labels={{
                protein: t('metrics.protein'),
                fat: t('metrics.fat'),
                carbs: t('metrics.carbs'),
              }}
            />
            <Link
              href="/menu"
              className="mt-5 inline-flex items-center gap-2 text-sm text-accent hover:underline"
            >
              <UtensilsCrossed className="size-4" aria-hidden />
              {t('menu.title')}
            </Link>
          </Card>

          <Card>
            <CardHeader title={t('menu.title')} description={t('common.today')} />
            <TodayMeals entries={todayEntries} date={today.toISOString().slice(0, 10)} />
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title={t('metrics.bmi')} description={t(`bmi.${nutrition.bmiCategory}`)} />
            <BmiScale bmi={nutrition.bmi} />
            <p className="mt-3 text-sm text-muted">
              {t('metrics.healthyRange', {
                min: nutrition.healthyWeightRange.minKg,
                max: nutrition.healthyWeightRange.maxKg,
              })}
            </p>
          </Card>

          <Card>
            <CardHeader title={t('metrics.tdee')} />
            <dl className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t('metrics.bmr')}</dt>
                <dd className="tabular-nums">
                  {nutrition.bmr} {t('metrics.kcal')}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t('metrics.tdee')}</dt>
                <dd className="tabular-nums">
                  {nutrition.tdee} {t('metrics.kcal')}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-line pt-2.5 font-medium">
                <dt>{t('metrics.target')}</dt>
                <dd className="tabular-nums">
                  {nutrition.targetCalories} {t('metrics.kcal')}
                </dd>
              </div>
            </dl>
            {nutrition.calorieFloorApplied ? (
              <p className="mt-3 rounded-xl bg-accent-container px-3.5 py-2.5 text-sm text-on-accent-container">
                {t('metrics.floorApplied')}
              </p>
            ) : null}
            {toTarget !== null ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted">
                <TrendingDown className="size-4" aria-hidden />
                {t('progress.toTarget')}: {Math.abs(toTarget).toFixed(1)} кг
              </p>
            ) : null}
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
