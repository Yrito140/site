'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'

const STORAGE_KEY = 'cookie-consent'

/** Уведомление о cookie — показывается один раз, пока пользователь не ответит. */
export function CookieBanner() {
  const t = useTranslations('cookie')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  if (!visible) return null

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, 'done')
    setVisible(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4 animate-rise sm:inset-x-auto sm:right-4 sm:max-w-sm sm:px-0">
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-high p-4 shadow-e2">
        <p className="text-sm text-on-surface">{t('text')}</p>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={dismiss}>
            {t('accept')}
          </Button>
          <Button size="sm" variant="text" onClick={dismiss}>
            {t('decline')}
          </Button>
        </div>
      </div>
    </div>
  )
}
