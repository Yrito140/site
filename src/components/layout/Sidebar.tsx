'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import {
  Dumbbell,
  LayoutDashboard,
  LineChart,
  LogOut,
  Settings2,
  UtensilsCrossed,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'
import { LocaleSwitcher } from './LocaleSwitcher'
import { ThemeToggle } from './ThemeToggle'

const NAV = [
  { href: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { href: '/menu', key: 'menu', icon: UtensilsCrossed },
  { href: '/progress', key: 'progress', icon: LineChart },
  { href: '/workouts', key: 'workouts', icon: Dumbbell },
  { href: '/profile', key: 'profile', icon: Settings2 },
] as const

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
      <Link href="/dashboard" className="mb-7 flex px-2">
        <Logo />
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ href, key, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                active
                  ? 'bg-accent-container font-medium text-on-accent-container'
                  : 'text-muted hover:bg-surface-low hover:text-on-surface',
              )}
            >
              <Icon className="size-[18px] shrink-0" aria-hidden />
              {t(key)}
            </Link>
          )
        })}

        {isAdmin ? (
          <Link
            href="/admin/meals"
            className={cn(
              'mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-accent-container font-medium text-on-accent-container'
                : 'text-muted hover:bg-surface-low hover:text-on-surface',
            )}
          >
            <Settings2 className="size-[18px] shrink-0" aria-hidden />
            {t('admin')}
          </Link>
        ) : null}
      </nav>

      <div className="flex flex-col gap-1 border-t border-line pt-3">
        <ThemeToggle />
        <LocaleSwitcher />
        <button
          type="button"
          onClick={() => signOut({ redirectTo: '/login' })}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface-low hover:text-on-surface"
        >
          <LogOut className="size-[18px] shrink-0" aria-hidden />
          {t('signOut')}
        </button>
      </div>
    </aside>
  )
}
