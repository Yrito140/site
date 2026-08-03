import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'

export default async function AdminUsersPage() {
  const t = await getTranslations('admin')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      profile: { select: { currentWeightKg: true, goal: true } },
      _count: { select: { weightLogs: true, workoutLogs: true, menus: true } },
    },
    take: 200,
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{t('users')}</h1>
      <Card className="overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line bg-surface-low text-left text-muted">
              <tr>
                <th className="px-5 py-2.5 font-medium">Пользователь</th>
                <th className="px-5 py-2.5 font-medium">Роль</th>
                <th className="px-5 py-2.5 font-medium">Профиль</th>
                <th className="px-5 py-2.5 font-medium">Вес</th>
                <th className="px-5 py-2.5 font-medium">Записей</th>
                <th className="px-5 py-2.5 font-medium">Регистрация</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-2.5">
                    <div className="font-medium">{user.name || '—'}</div>
                    <div className="text-xs text-muted">{user.email}</div>
                  </td>
                  <td className="px-5 py-2.5">
                    <span className="rounded-full bg-accent-container px-2 py-0.5 text-xs font-medium text-on-accent-container">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-muted">
                    {user.profile ? (user.profile.goal === 'LOSE_WEIGHT' ? 'Похудение' : user.profile.goal) : '—'}
                  </td>
                  <td className="px-5 py-2.5 tabular-nums text-muted">
                    {user.profile ? `${user.profile.currentWeightKg} кг` : '—'}
                  </td>
                  <td className="px-5 py-2.5 tabular-nums text-muted">
                    {user._count.weightLogs + user._count.workoutLogs + user._count.menus}
                  </td>
                  <td className="px-5 py-2.5 tabular-nums text-muted">
                    {user.createdAt.toLocaleDateString('ru-RU')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
