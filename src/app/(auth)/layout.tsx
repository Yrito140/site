import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-6 py-5">
        <Link href="/" className="inline-flex">
          <Logo className="text-[15px]" />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[400px] animate-rise">{children}</div>
      </main>
    </div>
  )
}
