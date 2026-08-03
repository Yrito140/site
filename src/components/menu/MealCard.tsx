'use client'

import Image from 'next/image'
import { ChefHat, Clock, RefreshCcw } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { mealHue } from '@/lib/placeholder'

export interface MealIngredient {
  name: string
  nameEn?: string | null
  grams: number
}

export interface MealCardData {
  id: string
  name: string
  nameEn?: string | null
  description?: string | null
  calories: number
  proteinG: number
  fatG: number
  carbsG: number
  prepTimeMinutes: number
  photoUrl?: string | null
  ingredients?: MealIngredient[]
  recipeIngredients?: string | null
  recipeSteps?: string[]
}

/** Карточка блюда в сетке меню. Масштаб показывает фактическую порцию. */
export function MealCard({
  meal,
  scale = 1,
  showReplace = false,
  onReplace,
  onOpenRecipe,
}: {
  meal: MealCardData
  scale?: number
  showReplace?: boolean
  onReplace?: () => void
  onOpenRecipe?: () => void
}) {
  const locale = useLocale()
  const t = useTranslations()
  const title = locale === 'ru' ? meal.name : meal.nameEn || meal.name

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface-high shadow-e1 transition-shadow hover:shadow-e2">
      <div className="relative aspect-[16/9] shrink-0 overflow-hidden">
        {meal.photoUrl ? (
          <Image
            src={meal.photoUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 260px, 100vw"
            className="object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background: `linear-gradient(135deg, hsl(${mealHue(meal.id)} 55% 90%), hsl(${mealHue(meal.id)} 45% 80%))`,
            }}
            aria-hidden
          >
            <span className="text-4xl font-semibold tracking-tight text-black/30">
              {title.slice(0, 1)}
            </span>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-on-surface" title={title}>
            {title}
          </p>
          {meal.description ? (
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">{meal.description}</p>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <p className="shrink-0 text-sm text-on-surface tabular-nums">
            {Math.round(meal.calories * scale)}{' '}
            <span className="text-xs text-muted">{locale === 'ru' ? 'ккал' : 'kcal'}</span>
          </p>
          <p className="shrink-0 text-xs text-muted tabular-nums">
            Б {Math.round(meal.proteinG * scale)} · Ж {Math.round(meal.fatG * scale)} · У{' '}
            {Math.round(meal.carbsG * scale)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1 text-xs text-muted">
            <Clock className="size-3.5" aria-hidden />
            {meal.prepTimeMinutes} мин
          </p>
          {showReplace ? (
            <Button variant="text" size="sm" onClick={onReplace} icon={<RefreshCcw className="size-3.5" />}>
              Заменить
            </Button>
          ) : null}
        </div>

        {onOpenRecipe ? (
          <Button
            variant="tonal"
            size="sm"
            onClick={onOpenRecipe}
            icon={<ChefHat className="size-4" />}
            className="w-full"
          >
            {t('menu.howToCook')}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
