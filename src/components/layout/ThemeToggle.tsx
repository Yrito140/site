'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/cn'

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // До гидратации тема неизвестна — иконку не рисуем, чтобы не мигала.
  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface-low hover:text-on-surface',
        collapsed ? 'justify-center' : 'w-full',
      )}
      aria-label={isDark ? 'Светлая тема' : 'Тёмная тема'}
    >
      {mounted && isDark ? (
        <Sun className="size-[18px] shrink-0" aria-hidden />
      ) : (
        <Moon className="size-[18px] shrink-0" aria-hidden />
      )}
      {collapsed ? null : <span>{mounted && isDark ? 'Светлая' : 'Тёмная'}</span>}
    </button>
  )
}
