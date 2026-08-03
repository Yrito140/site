import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Activity, ArrowRight, LineChart, UtensilsCrossed } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/Button'

const FEATURES = [
  {
    icon: Activity,
    title: 'Расчёт под ваши данные',
    text: 'Миффлин — Сан Жеор, коэффициент активности, безопасный дефицит. Без «съешьте 1200 ккал» всем подряд.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Меню на неделю',
    text: 'Блюда подбираются под калорийность и БЖУ. Не нравится позиция — заменяется на равнозначную в один клик.',
  },
  {
    icon: LineChart,
    title: 'Прогресс, а не самочувствие',
    text: 'Вес, замеры, тренировки и выполненные приёмы пищи на одном графике.',
  },
]

export default async function LandingPage() {
  const session = await auth()
  if (session?.user) redirect('/dashboard')

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-[1120px] items-center justify-between px-5 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="text" size="sm">
              Войти
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Начать</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1120px] px-5">
        <section className="py-16 sm:py-24">
          <p className="text-sm font-medium text-accent">Питание и тренировки</p>
          <h1 className="mt-3 max-w-[15ch] text-4xl font-semibold leading-[1.1] tracking-tight sm:text-[56px]">
            Норма калорий, меню и прогресс в одном месте
          </h1>
          <p className="mt-5 max-w-[52ch] text-lg text-muted">
            Считает вашу норму по формулам, а не на глаз. Собирает меню под цель и показывает,
            что реально меняется неделя к неделе.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register">
              <Button size="lg">
                Создать аккаунт
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                У меня есть аккаунт
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 pb-20 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-[var(--radius-card)] border border-line bg-surface-high p-6 shadow-e1"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-accent-container text-on-accent-container">
                <Icon className="size-5" aria-hidden />
              </span>
              <h2 className="mt-4 font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-line py-8">
        <p className="mx-auto max-w-[1120px] px-5 text-sm text-muted">
          Расчёты носят справочный характер и не заменяют консультацию врача.
        </p>
      </footer>
    </div>
  )
}
