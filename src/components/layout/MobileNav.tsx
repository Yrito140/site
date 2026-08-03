'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Dumbbell, LayoutDashboard, LineChart, Settings2, UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/cn'

const NAV = [
  { href: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { href: '/menu', key: 'menu', icon: UtensilsCrossed },
  { href: '/progress', key: 'progress', icon: LineChart },
  { href: '/workouts', key: 'workouts', icon: Dumbbell },
  { href: '/profile', key: 'profile', icon: Settings2 },
] as const

/** Нижняя навигация — основной способ перемещения на телефоне. */
export function MobileNav() {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <nav className="sticky bottom-0 z-30 flex border-t border-line bg-surface/95 backdrop-blur-md lg:hidden">
      {NAV.map(({ href, key, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[11px] transition-colors',
              active ? 'text-accent' : 'text-muted',
            )}
          >
            <span
              className={cn(
                'grid h-7 w-12 place-items-center rounded-full transition-colors',
                active ? 'bg-accent-container' : 'bg-transparent',
              )}
            >
              <Icon className="size-[18px]" aria-hidden />
            </span>
            {t(key)}
          </Link>
        )
      })}
    </nav>
  )
}
