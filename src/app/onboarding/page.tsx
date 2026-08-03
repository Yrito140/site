import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OnboardingWizard } from './OnboardingWizard'

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } })
  if (profile) redirect('/dashboard')

  return (
    <main className="mx-auto w-full max-w-[560px] px-4 py-10 sm:py-16">
      <OnboardingWizard />
    </main>
  )
}
