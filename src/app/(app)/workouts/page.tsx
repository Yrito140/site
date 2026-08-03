import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { Dumbbell } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfWeekUtc } from '@/lib/profile'
import { PageShell } from '@/components/layout/PageShell'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/dashboard/StatCard'
import { AddWorkoutDialog } from './AddWorkoutDialog'

export default async function WorkoutsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const t = await getTranslations()
  const weekStart = startOfWeekUtc(new Date())

  const [profile, logs, lastWeight] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.workoutLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      take: 60,
    }),
    prisma.weightLog.findFirst({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      select: { weightKg: true },
    }),
  ])

  if (!profile) redirect('/onboarding')

  const weekLogs = logs.filter((log) => log.date >= weekStart)
  const weekMinutes = weekLogs.reduce((sum, l) => sum + l.durationMinutes, 0)
  const weekBurned = weekLogs.reduce((sum, l) => sum + (l.caloriesBurned ?? 0), 0)

  return (
    <PageShell
      title={t('workouts.title')}
      action={<AddWorkoutDialog weightKg={lastWeight?.weightKg ?? profile.currentWeightKg} />}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t('workouts.weekTotal')}
          value={weekLogs.length}
          icon={<Dumbbell className="size-[18px]" aria-hidden />}
        />
        <StatCard label="Минут за неделю" value={weekMinutes} unit="мин" />
        <StatCard label={t('workouts.burned')} value={weekBurned} unit={t('metrics.kcal')} />
      </div>

      <Card className="mt-4 overflow-hidden !p-0">
        <div className="p-5 sm:p-6">
          <CardHeader title="Журнал" className="mb-0" />
        </div>

        {logs.length === 0 ? (
          <p className="px-5 pb-8 text-center text-sm text-muted">{t('workouts.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="border-y border-line bg-surface-low text-left text-muted">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Дата</th>
                  <th className="px-5 py-2.5 font-medium">{t('workouts.type')}</th>
                  <th className="px-5 py-2.5 font-medium">Название</th>
                  <th className="px-5 py-2.5 font-medium">{t('workouts.duration')}</th>
                  <th className="px-5 py-2.5 font-medium">{t('workouts.intensity')}</th>
                  <th className="px-5 py-2.5 font-medium">{t('workouts.burned')}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-2.5 tabular-nums">
                      {log.date.toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-5 py-2.5">{t(`workoutTypes.${log.type}`)}</td>
                    <td className="max-w-[200px] truncate px-5 py-2.5 text-muted">
                      {log.title || '—'}
                    </td>
                    <td className="px-5 py-2.5 tabular-nums">{log.durationMinutes} мин</td>
                    <td className="px-5 py-2.5 text-muted">{t(`intensity.${log.intensity}`)}</td>
                    <td className="px-5 py-2.5 tabular-nums">
                      {log.caloriesBurned ? `${log.caloriesBurned} ${t('metrics.kcal')}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageShell>
  )
}
