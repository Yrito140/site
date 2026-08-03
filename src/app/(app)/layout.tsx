import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MobileNav } from '@/components/layout/MobileNav'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // Без профиля пользоваться нечем — гоним в онбординг.
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!profile) redirect('/onboarding')

  return (
    <div className="flex min-h-dvh">
      <Sidebar isAdmin={session.user.role === 'ADMIN'} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      <MobileNav />
    </div>
  )
}
