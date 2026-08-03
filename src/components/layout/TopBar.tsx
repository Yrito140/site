'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { LocaleSwitcher } from './LocaleSwitcher'
import { ThemeToggle } from './ThemeToggle'

/** Верхняя панель для мобильных: заголовок раздела + быстрые переключатели. */
export function TopBar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur-md lg:hidden">
      <h1 className="truncate text-base font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-0.5">
        <ThemeToggle collapsed />
        <LocaleSwitcher collapsed />
        <button
          type="button"
          onClick={() => signOut({ redirectTo: '/login' })}
          className="rounded-xl p-2.5 text-muted transition-colors hover:bg-surface-low hover:text-on-surface"
          aria-label="Выйти"
        >
          <LogOut className="size-[18px]" aria-hidden />
        </button>
      </div>
    </header>
  )
}
