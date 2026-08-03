import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nutritionForProfile } from '@/lib/profile'
import { PageShell } from '@/components/layout/PageShell'
import { ProfileForm } from './ProfileForm'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const t = await getTranslations()
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } })
  if (!profile) redirect('/onboarding')

  const nutrition = nutritionForProfile(profile)

  return (
    <PageShell title={t('nav.profile')}>
      <ProfileForm
        initial={{
          sex: profile.sex,
          age: String(profile.age),
          heightCm: String(profile.heightCm),
          currentWeightKg: String(profile.currentWeightKg),
          targetWeightKg: profile.targetWeightKg ? String(profile.targetWeightKg) : '',
          goal: profile.goal,
          activityLevel: profile.activityLevel,
          dietaryTags: profile.dietaryTags,
        }}
        initialNutrition={nutrition}
      />
    </PageShell>
  )
}
