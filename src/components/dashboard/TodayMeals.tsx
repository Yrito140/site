'use client'

import { useOptimistic, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import { toggleMealCompletion } from '@/app/actions/actions'
import { cn } from '@/lib/cn'
import { useToast } from '@/components/ui/Toast'

export type TodayEntry = {
  mealId: string
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
  name: string
  nameEn: string | null
  calories: number
  scale: number
  eaten: boolean
}

/** Чек-лист приёмов пищи на сегодня. Оптимистичный отклик — без ожидания сервера. */
export function TodayMeals({ entries, date }: { entries: TodayEntry[]; date: string }) {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const toast = useToast()
  const [, startTransition] = useTransition()

  const [optimistic, setOptimistic] = useOptimistic(
    entries,
    (state, { mealId, eaten }: { mealId: string; eaten: boolean }) =>
      state.map((e) => (e.mealId === mealId ? { ...e, eaten } : e)),
  )

  function toggle(entry: TodayEntry) {
    startTransition(async () => {
      setOptimistic({ mealId: entry.mealId, eaten: !entry.eaten })
      const result = await toggleMealCompletion({
        date,
        mealId: entry.mealId,
        mealType: entry.mealType,
        eaten: !entry.eaten,
      })
      if (!result.ok) {
        toast('error', t('common.error'))
        return
      }
      router.refresh()
    })
  }

  if (entries.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">{t('menu.empty')}</p>
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {optimistic.map((entry) => (
        <li key={`${entry.mealType}-${entry.mealId}`}>
          <button
            type="button"
            onClick={() => toggle(entry)}
            className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-surface-low"
            aria-pressed={entry.eaten}
          >
            <span
              className={cn(
                'grid size-5 shrink-0 place-items-center rounded-md border transition-colors',
                entry.eaten ? 'border-accent bg-accent text-on-accent' : 'border-line',
              )}
              aria-hidden
            >
              {entry.eaten ? <Check className="size-3.5" strokeWidth={3} /> : null}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-xs text-muted">{t(`meals.${entry.mealType}`)}</span>
              <span
                className={cn(
                  'block truncate text-sm',
                  entry.eaten ? 'text-muted line-through' : 'text-on-surface',
                )}
              >
                {locale === 'ru' ? entry.name : entry.nameEn || entry.name}
              </span>
            </span>

            <span className="shrink-0 text-sm text-muted tabular-nums">
              {Math.round(entry.calories * entry.scale)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
