import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageShell } from '@/components/layout/PageShell'
import { Card, CardHeader } from '@/components/ui/Card'
import { WeightChart, type WeightPoint } from '@/components/dashboard/WeightChart'
import { AddWeightDialog } from './AddWeightDialog'

export default async function ProgressPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const t = await getTranslations()
  const [profile, logs] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.weightLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'asc' },
      take: 180,
    }),
  ])

  if (!profile) redirect('/onboarding')

  const points: WeightPoint[] = logs.map((log) => ({
    date: log.date.toISOString(),
    label: log.date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
    weightKg: log.weightKg,
  }))

  const first = logs[0]?.weightKg
  const last = logs.at(-1)?.weightKg
  const delta = first !== undefined && last !== undefined ? last - first : null

  return (
    <PageShell
      title={t('progress.title')}
      action={<AddWeightDialog defaultWeight={last ?? profile.currentWeightKg} />}
    >
      <Card>
        <CardHeader
          title={t('progress.weightChart')}
          description={
            delta === null
              ? undefined
              : `${t('progress.change')}: ${delta > 0 ? '+' : ''}${delta.toFixed(1)} кг за период`
          }
        />
        {points.length > 0 ? (
          <WeightChart data={points} targetWeightKg={profile.targetWeightKg} />
        ) : (
          <p className="py-12 text-center text-sm text-muted">{t('progress.noData')}</p>
        )}
      </Card>

      {logs.length > 0 ? (
        <Card className="mt-4 overflow-hidden !p-0">
          <div className="p-5 sm:p-6">
            <CardHeader title={t('progress.history')} className="mb-0" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="border-y border-line bg-surface-low text-left text-muted">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Дата</th>
                  <th className="px-5 py-2.5 font-medium">Вес</th>
                  <th className="px-5 py-2.5 font-medium">{t('progress.bodyFat')}</th>
                  <th className="px-5 py-2.5 font-medium">{t('progress.waist')}</th>
                  <th className="px-5 py-2.5 font-medium">{t('progress.notes')}</th>
                </tr>
              </thead>
              <tbody>
                {[...logs].reverse().map((log) => (
                  <tr key={log.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-2.5 tabular-nums">
                      {log.date.toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-5 py-2.5 tabular-nums">{log.weightKg} кг</td>
                    <td className="px-5 py-2.5 tabular-nums text-muted">
                      {log.bodyFatPct ? `${log.bodyFatPct}%` : '—'}
                    </td>
                    <td className="px-5 py-2.5 tabular-nums text-muted">
                      {log.waistCm ? `${log.waistCm} см` : '—'}
                    </td>
                    <td className="max-w-[260px] truncate px-5 py-2.5 text-muted">
                      {log.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </PageShell>
  )
}
