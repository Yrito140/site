'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Languages } from 'lucide-react'
import { setLocale } from '@/app/actions/locale'
import { cn } from '@/lib/cn'

export function LocaleSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter()
  const locale = useLocale()
  const [pending, startTransition] = useTransition()

  const next = locale === 'ru' ? 'en' : 'ru'

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setLocale(next)
          router.refresh()
        })
      }
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface-low hover:text-on-surface disabled:opacity-50',
        collapsed ? 'justify-center' : 'w-full',
      )}
      aria-label={`Switch language to ${next.toUpperCase()}`}
    >
      <Languages className="size-[18px] shrink-0" aria-hidden />
      {collapsed ? null : <span className="uppercase">{next}</span>}
    </button>
  )
}
