import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/dashboard')

  const t = await getTranslations('admin')

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-4 px-5 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-muted hover:text-on-surface"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t('title')}
          </Link>
          <nav className="ml-auto flex gap-1">
            <Link
              href="/admin/meals"
              className="rounded-full px-3.5 py-2 text-sm text-muted transition-colors hover:bg-surface-low hover:text-on-surface"
            >
              {t('meals')}
            </Link>
            <Link
              href="/admin/users"
              className="rounded-full px-3.5 py-2 text-sm text-muted transition-colors hover:bg-surface-low hover:text-on-surface"
            >
              {t('users')}
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1120px] px-5 py-8">{children}</main>
    </div>
  )
}
