'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Check, ClipboardList, Copy, RefreshCcw } from 'lucide-react'
import { replaceMeal, regenerateMenu, toggleMealCompletion } from '@/app/actions/actions'
import { getMealAlternatives } from '@/app/actions/menu'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'
import { MealCard, type MealCardData } from './MealCard'
import { RecipeDialog } from './RecipeDialog'

export type Entry = {
  id: string
  dayOfWeek: number
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
  scale: number
  eaten: boolean
  meal: MealCardData
}

export type WeekData = {
  entries: Entry[]
  dayTotals: { day: number; calories: number; proteinG: number; fatG: number; carbsG: number }[]
}

const ORDER: Entry['mealType'][] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']
const DAYS = [0, 1, 2, 3, 4, 5, 6]
const DAY_MS = 24 * 60 * 60 * 1000

const DAY_SHORT = {
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
}

/**
 * Меню недели. На мобильных и по умолчанию — один день с переключателем,
 * на широких экранах доступен обзор всей недели.
 */
export function WeekGrid({
  week,
  weekStartISO,
  todayIndex,
  targetCalories,
}: {
  week: WeekData
  weekStartISO: string
  todayIndex: number | null
  targetCalories: number | null
}) {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const toast = useToast()

  const [view, setView] = useState<'day' | 'week'>('day')
  const [activeDay, setActiveDay] = useState(todayIndex ?? 0)
  const [replaceEntry, setReplaceEntry] = useState<Entry | null>(null)
  const [alternatives, setAlternatives] = useState<(MealCardData & { scale: number })[] | null>(null)
  const [loadingAlt, setLoadingAlt] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [showShopping, setShowShopping] = useState(false)
  const [pendingEat, setPendingEat] = useState<string | null>(null)
  const [recipe, setRecipe] = useState<{ meal: MealCardData; scale: number } | null>(null)

  const byDay = useMemo(() => {
    const map = new Map<number, Map<Entry['mealType'], Entry>>()
    for (const entry of week.entries) {
      if (!map.has(entry.dayOfWeek)) map.set(entry.dayOfWeek, new Map())
      map.get(entry.dayOfWeek)!.set(entry.mealType, entry)
    }
    return map
  }, [week.entries])

  const totals = useMemo(() => new Map(week.dayTotals.map((d) => [d.day, d])), [week.dayTotals])

  /** Ингредиенты всей недели, сложенные по названию. */
  const shopping = useMemo(() => {
    const sum = new Map<string, number>()
    for (const entry of week.entries) {
      for (const ing of entry.meal.ingredients ?? []) {
        const name = locale === 'ru' ? ing.name : ing.nameEn || ing.name
        sum.set(name, (sum.get(name) ?? 0) + ing.grams * entry.scale)
      }
    }
    return [...sum.entries()]
      .map(([name, grams]) => ({ name, grams: Math.round(grams) }))
      .sort((a, b) => b.grams - a.grams)
  }, [week.entries, locale])

  function dateForDay(day: number) {
    return new Date(new Date(weekStartISO).getTime() + day * DAY_MS).toISOString().slice(0, 10)
  }

  async function openReplace(entry: Entry) {
    setReplaceEntry(entry)
    setAlternatives(null)
    setLoadingAlt(true)
    const result = await getMealAlternatives(entry.id)
    setLoadingAlt(false)
    if (result.ok) {
      setAlternatives(result.alternatives)
    } else {
      toast('error', t('menu.notEnoughMeals'))
      setReplaceEntry(null)
    }
  }

  async function pickAlternative(alt: MealCardData & { scale: number }) {
    if (!replaceEntry) return
    const result = await replaceMeal({ entryId: replaceEntry.id, newMealId: alt.id, scale: alt.scale })
    if (!result.ok) {
      toast('error', result.error ?? t('common.error'))
      return
    }
    toast('success', t('menu.replace'))
    setReplaceEntry(null)
    router.refresh()
  }

  async function toggleEaten(entry: Entry) {
    setPendingEat(entry.id)
    const result = await toggleMealCompletion({
      date: dateForDay(entry.dayOfWeek),
      mealId: entry.meal.id,
      mealType: entry.mealType,
      eaten: !entry.eaten,
    })
    setPendingEat(null)
    if (!result.ok) {
      toast('error', result.error ?? t('common.error'))
      return
    }
    router.refresh()
  }

  async function regenerate() {
    setRegenerating(true)
    const result = await regenerateMenu()
    setRegenerating(false)
    if (!result.ok) {
      toast('error', result.error === 'notEnoughMeals' ? t('menu.notEnoughMeals') : t('common.error'))
      return
    }
    toast('success', t('menu.regenerate'))
    router.refresh()
  }

  async function copyShopping() {
    const text = shopping.map((i) => `${i.name} — ${formatGrams(i.grams)}`).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      toast('success', t('menu.copied'))
    } catch {
      toast('error', t('common.error'))
    }
  }

  const shortNames = DAY_SHORT[locale === 'ru' ? 'ru' : 'en']

  return (
    <div>
      {/* Панель управления: режим просмотра слева, действия справа. */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full border border-line bg-surface p-0.5">
          {(['day', 'week'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              aria-pressed={view === mode}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm transition-colors',
                view === mode
                  ? 'bg-accent text-on-accent'
                  : 'text-muted hover:text-on-surface',
              )}
            >
              {mode === 'day' ? t('menu.viewDay') : t('menu.viewWeek')}
            </button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShopping(true)}
            icon={<ClipboardList className="size-4" />}
          >
            {t('menu.shoppingList')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={regenerate}
            loading={regenerating}
            icon={<RefreshCcw className="size-4" />}
          >
            {t('menu.regenerate')}
          </Button>
        </div>
      </div>

      {view === 'day' ? (
        <DayView
          days={DAYS}
          shortNames={shortNames}
          activeDay={activeDay}
          onSelectDay={setActiveDay}
          todayIndex={todayIndex}
          byDay={byDay}
          totals={totals}
          targetCalories={targetCalories}
          pendingEat={pendingEat}
          onReplace={openReplace}
          onToggleEaten={toggleEaten}
          onOpenRecipe={(entry) => setRecipe({ meal: entry.meal, scale: entry.scale })}
        />
      ) : (
        <WeekView
          shortNames={shortNames}
          todayIndex={todayIndex}
          byDay={byDay}
          totals={totals}
          targetCalories={targetCalories}
          onReplace={openReplace}
          onSelectDay={(day) => {
            setActiveDay(day)
            setView('day')
          }}
        />
      )}

      {recipe ? (
        <RecipeDialog meal={recipe.meal} scale={recipe.scale} onClose={() => setRecipe(null)} />
      ) : null}

      <Dialog
        open={Boolean(replaceEntry)}
        onClose={() => setReplaceEntry(null)}
        title={t('menu.replaceTitle')}
        description={t('menu.replaceHint')}
        className="max-w-3xl"
      >
        {loadingAlt ? (
          <p className="py-6 text-center text-sm text-muted">{t('common.loading')}</p>
        ) : alternatives?.length ? (
          <div className="grid max-h-[65vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
            {alternatives.map((alt) => (
              <button
                key={alt.id}
                type="button"
                onClick={() => pickAlternative(alt)}
                className="group overflow-hidden rounded-[var(--radius-card)] text-left transition-transform focus-visible:outline-none active:scale-[0.99]"
              >
                <MealCard meal={alt} scale={alt.scale} />
                <span className="mt-2 flex items-center justify-center gap-2 rounded-full bg-accent-container py-2 text-sm font-medium text-on-accent-container">
                  <Check className="size-4" aria-hidden />
                  {t('menu.replace')}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted">{t('menu.notEnoughMeals')}</p>
        )}
      </Dialog>

      <Dialog
        open={showShopping}
        onClose={() => setShowShopping(false)}
        title={t('menu.shoppingList')}
        description={t('menu.title')}
      >
        <div className="max-h-[60vh] overflow-y-auto">
          <ul className="flex flex-col">
            {shopping.map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between gap-4 border-b border-line py-2.5 text-sm last:border-0"
              >
                <span className="min-w-0 truncate">{item.name}</span>
                <span className="shrink-0 text-muted tabular-nums">{formatGrams(item.grams)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={copyShopping} icon={<Copy className="size-4" />}>
            {t('menu.copyList')}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

/** Килограммы для крупных величин: «1.2 кг» читается лучше, чем «1200 г». */
function formatGrams(grams: number) {
  return grams >= 1000 ? `${(grams / 1000).toFixed(1)} кг` : `${grams} г`
}

function DayView({
  days,
  shortNames,
  activeDay,
  onSelectDay,
  todayIndex,
  byDay,
  totals,
  targetCalories,
  pendingEat,
  onReplace,
  onToggleEaten,
  onOpenRecipe,
}: {
  days: number[]
  shortNames: string[]
  activeDay: number
  onSelectDay: (day: number) => void
  todayIndex: number | null
  byDay: Map<number, Map<Entry['mealType'], Entry>>
  totals: Map<number, WeekData['dayTotals'][number]>
  targetCalories: number | null
  pendingEat: string | null
  onReplace: (entry: Entry) => void
  onToggleEaten: (entry: Entry) => void
  onOpenRecipe: (entry: Entry) => void
}) {
  const t = useTranslations()
  const dayMap = byDay.get(activeDay)
  const total = totals.get(activeDay)

  return (
    <div>
      {/* Дни недели: горизонтальная лента, активный день подсвечен. */}
      <div className="mb-5 grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const dayTotal = totals.get(day)
          const active = day === activeDay
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay(day)}
              aria-pressed={active}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl border px-1 py-2.5 transition-colors',
                active
                  ? 'border-accent bg-accent text-on-accent'
                  : 'border-line bg-surface text-muted hover:bg-surface-low hover:text-on-surface',
              )}
            >
              <span className="text-xs font-medium">{shortNames[day]}</span>
              <span className={cn('text-[11px] tabular-nums', active ? 'opacity-80' : 'opacity-70')}>
                {Math.round(dayTotal?.calories ?? 0)}
              </span>
              {day === todayIndex ? (
                <span
                  className={cn('size-1 rounded-full', active ? 'bg-on-accent' : 'bg-accent')}
                  aria-hidden
                />
              ) : null}
            </button>
          )
        })}
      </div>

      <DayTotals total={total} targetCalories={targetCalories} />

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ORDER.map((type) => {
          const entry = dayMap?.get(type)
          return (
            <div key={type} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2 px-0.5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {t(`meals.${type}`)}
                </p>
                {entry ? (
                  <button
                    type="button"
                    onClick={() => onToggleEaten(entry)}
                    disabled={pendingEat === entry.id}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors disabled:opacity-50',
                      entry.eaten
                        ? 'bg-accent-container text-on-accent-container'
                        : 'text-muted hover:bg-surface-low hover:text-on-surface',
                    )}
                    aria-pressed={entry.eaten}
                  >
                    <span
                      className={cn(
                        'grid size-4 place-items-center rounded-[5px] border transition-colors',
                        entry.eaten ? 'border-accent bg-accent text-on-accent' : 'border-line',
                      )}
                      aria-hidden
                    >
                      {entry.eaten ? <Check className="size-3" strokeWidth={3} /> : null}
                    </span>
                    {t('menu.eaten')}
                  </button>
                ) : null}
              </div>

              {entry ? (
                <div className={cn('h-full transition-opacity', entry.eaten && 'opacity-60')}>
                  <MealCard
                    meal={entry.meal}
                    scale={entry.scale}
                    showReplace
                    onReplace={() => onReplace(entry)}
                    onOpenRecipe={() => onOpenRecipe(entry)}
                  />
                </div>
              ) : (
                <div className="flex min-h-[180px] flex-1 items-center justify-center rounded-[var(--radius-card)] border border-dashed border-line text-xs text-muted">
                  {t('menu.noMeal')}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Итог дня: калории против цели + разбивка БЖУ. */
function DayTotals({
  total,
  targetCalories,
}: {
  total?: WeekData['dayTotals'][number]
  targetCalories: number | null
}) {
  const t = useTranslations()
  const calories = Math.round(total?.calories ?? 0)
  const over = targetCalories !== null && calories > targetCalories
  const percent = targetCalories ? Math.min(100, (calories / targetCalories) * 100) : 0

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface-high p-4 shadow-e1">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm font-medium">{t('menu.dayTotal')}</p>
        <p className="text-sm tabular-nums">
          <span className="text-lg font-semibold">{calories}</span>{' '}
          {targetCalories ? (
            <span className="text-muted">{t('menu.ofTarget', { target: targetCalories })}</span>
          ) : (
            <span className="text-muted">{t('metrics.kcal')}</span>
          )}
        </p>
      </div>

      {targetCalories ? (
        <>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-low">
            <div
              className={cn('h-full rounded-full transition-[width]', over ? 'bg-warning' : 'bg-accent')}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className={cn('mt-1.5 text-xs', over ? 'text-warning' : 'text-muted')}>
            {over
              ? t('menu.over', { kcal: calories - targetCalories })
              : t('menu.remaining', { kcal: targetCalories - calories })}
          </p>
        </>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-3 text-xs text-muted tabular-nums">
        <span>
          {t('metrics.protein')} <span className="text-on-surface">{Math.round(total?.proteinG ?? 0)} г</span>
        </span>
        <span>
          {t('metrics.fat')} <span className="text-on-surface">{Math.round(total?.fatG ?? 0)} г</span>
        </span>
        <span>
          {t('metrics.carbs')} <span className="text-on-surface">{Math.round(total?.carbsG ?? 0)} г</span>
        </span>
      </div>
    </div>
  )
}

/** Обзор недели: компактные строки без картинок — видно всю неделю сразу. */
function WeekView({
  shortNames,
  todayIndex,
  byDay,
  totals,
  targetCalories,
  onReplace,
  onSelectDay,
}: {
  shortNames: string[]
  todayIndex: number | null
  byDay: Map<number, Map<Entry['mealType'], Entry>>
  totals: Map<number, WeekData['dayTotals'][number]>
  targetCalories: number | null
  onReplace: (entry: Entry) => void
  onSelectDay: (day: number) => void
}) {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[880px] grid-cols-7 gap-3">
        {DAYS.map((day) => {
          const dayMap = byDay.get(day)
          const total = totals.get(day)
          const calories = Math.round(total?.calories ?? 0)
          const over = targetCalories !== null && calories > targetCalories

          return (
            <div key={day} className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onSelectDay(day)}
                className={cn(
                  'rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-surface-low',
                  day === todayIndex && 'bg-accent-container',
                )}
              >
                <span className="block text-xs font-semibold uppercase tracking-wide">
                  {shortNames[day]}
                </span>
                <span
                  className={cn(
                    'block text-[11px] tabular-nums',
                    over ? 'text-warning' : 'text-muted',
                  )}
                >
                  {calories} {t('metrics.kcal')}
                </span>
              </button>

              {ORDER.map((type) => {
                const entry = dayMap?.get(type)
                if (!entry) {
                  return (
                    <div
                      key={type}
                      className="rounded-xl border border-dashed border-line px-2.5 py-3 text-center text-[11px] text-muted"
                    >
                      —
                    </div>
                  )
                }
                const title =
                  locale === 'ru' ? entry.meal.name : entry.meal.nameEn || entry.meal.name
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onReplace(entry)}
                    title={`${t(`meals.${type}`)}: ${title}`}
                    className={cn(
                      'group rounded-xl border border-line bg-surface-high px-2.5 py-2 text-left transition-colors hover:border-accent',
                      entry.eaten && 'opacity-60',
                    )}
                  >
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted">
                      {entry.eaten ? <Check className="size-3 text-accent" aria-hidden /> : null}
                      {t(`meals.${type}`)}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-xs leading-snug">{title}</span>
                    <span className="mt-1 block text-[11px] text-muted tabular-nums">
                      {Math.round(entry.meal.calories * entry.scale)}
                    </span>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
