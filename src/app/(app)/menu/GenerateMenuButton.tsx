'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { regenerateMenu } from '@/app/actions/actions'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export function GenerateMenuButton({ label }: { label: string }) {
  const t = useTranslations()
  const router = useRouter()
  const toast = useToast()
  const [pending, setPending] = useState(false)

  return (
    <Button
      loading={pending}
      onClick={async () => {
        setPending(true)
        const result = await regenerateMenu()
        setPending(false)
        if (!result.ok) {
          toast('error', result.error === 'notEnoughMeals' ? t('menu.notEnoughMeals') : t('common.error'))
          return
        }
        router.refresh()
      }}
    >
      {label}
    </Button>
  )
}
