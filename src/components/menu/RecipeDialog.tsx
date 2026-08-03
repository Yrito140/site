'use client'

import Image from 'next/image'
import { Clock, UtensilsCrossed } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Dialog } from '@/components/ui/Dialog'
import { mealHue } from '@/lib/placeholder'
import type { MealCardData } from './MealCard'

/** Рецепт блюда: состав одной строкой + нумерованные шаги. */
export function RecipeDialog({
  meal,
  scale = 1,
  onClose,
}: {
  meal: MealCardData
  scale?: number
  onClose: () => void
}) {
  const t = useTranslations()
  const locale = useLocale()
  const title = locale === 'ru' ? meal.name : meal.nameEn || meal.name
  const steps = meal.recipeSteps ?? []

  return (
    <Dialog open onClose={onClose} title={title} className="max-w-xl">
      <div className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-xl">
          {meal.photoUrl ? (
            <Image src={meal.photoUrl} alt={title} fill sizes="560px" className="object-cover" />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `linear-gradient(135deg, hsl(${mealHue(meal.id)} 55% 90%), hsl(${mealHue(meal.id)} 45% 80%))`,
              }}
              aria-hidden
            />
          )}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted tabular-nums">
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden />
            {meal.prepTimeMinutes} мин
          </span>
          <span>
            {Math.round(meal.calories * scale)}{' '}
            <span className="text-xs">{locale === 'ru' ? 'ккал' : 'kcal'}</span>
          </span>
          <span className="text-xs">
            Б {Math.round(meal.proteinG * scale)} · Ж {Math.round(meal.fatG * scale)} · У{' '}
            {Math.round(meal.carbsG * scale)}
          </span>
        </div>

        {meal.recipeIngredients ? (
          <section className="mb-5">
            <h3 className="mb-1.5 text-sm font-semibold">{t('menu.recipeIngredients')}</h3>
            <p className="text-sm leading-relaxed text-muted">{meal.recipeIngredients}</p>
          </section>
        ) : null}

        {steps.length > 0 ? (
          <section>
            <h3 className="mb-2.5 text-sm font-semibold">{t('menu.recipeSteps')}</h3>
            <ol className="flex flex-col gap-2.5">
              {steps.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm leading-relaxed">
                  <span
                    className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-container text-xs font-semibold text-on-accent-container tabular-nums"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <p className="flex items-center gap-2 py-4 text-sm text-muted">
            <UtensilsCrossed className="size-4" aria-hidden />
            {t('menu.noRecipe')}
          </p>
        )}
      </div>
    </Dialog>
  )
}
