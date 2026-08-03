import { createRng, pickWeighted } from './random'
import { NotEnoughMealsError } from './types'
import type { GenerateMenuParams, GeneratedEntry, MealCandidate, MealType } from './types'

/** Доли суточной калорийности по приёмам пищи. */
export const SLOT_SHARES: Record<MealType, number> = {
  BREAKFAST: 0.25,
  LUNCH: 0.35,
  DINNER: 0.3,
  SNACK: 0.1,
}

export const SLOT_ORDER: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']

/** Границы масштаба порции: за пределами блюдо перестаёт быть собой. */
const SCALE_MIN = 0.7
const SCALE_MAX = 1.5
const CANDIDATE_POOL = 6

const clampScale = (value: number) =>
  Math.round(Math.min(SCALE_MAX, Math.max(SCALE_MIN, value)) * 20) / 20

/** Блюдо подходит, если покрывает все ограничения пользователя. */
export function matchesDiet(meal: MealCandidate, dietaryTags: string[]): boolean {
  return dietaryTags.every((tag) => meal.tags.includes(tag))
}

function scoreMeal(meal: MealCandidate, slotCalories: number, slotProteinG: number) {
  const scale = clampScale(slotCalories / Math.max(meal.calories, 1))
  const calorieError = Math.abs(meal.calories * scale - slotCalories) / slotCalories
  // Недобор белка штрафуем, перебор — нет: белок в дефиците дороже.
  const proteinGap = Math.max(0, slotProteinG - meal.proteinG * scale) / Math.max(slotProteinG, 1)
  return { scale, penalty: calorieError * 2 + proteinGap }
}

/**
 * Недельное меню под целевые калории и БЖУ. Одно и то же семя даёт
 * идентичный результат, поэтому меню не «прыгает» между рендерами.
 */
export function generateWeeklyMenu(params: GenerateMenuParams): GeneratedEntry[] {
  const { targetCalories, targetProteinG, dietaryTags, meals, seed, days = 7 } = params
  const rng = createRng(seed)
  const entries: GeneratedEntry[] = []

  const pools = new Map<MealType, MealCandidate[]>()
  for (const slot of SLOT_ORDER) {
    const pool = meals.filter((m) => m.type === slot && matchesDiet(m, dietaryTags))
    if (pool.length === 0) throw new NotEnoughMealsError(slot)
    pools.set(slot, pool)
  }

  // Сколько раз блюдо уже попало в неделю — чтобы рацион не повторялся.
  const usage = new Map<string, number>()

  for (let day = 0; day < days; day += 1) {
    for (const slot of SLOT_ORDER) {
      const pool = pools.get(slot) as MealCandidate[]
      const slotCalories = targetCalories * SLOT_SHARES[slot]
      const slotProteinG = targetProteinG * SLOT_SHARES[slot]

      const ranked = pool
        .map((meal) => {
          const { scale, penalty } = scoreMeal(meal, slotCalories, slotProteinG)
          const repeats = usage.get(meal.id) ?? 0
          return { meal, scale, penalty: penalty + repeats * 1.5 }
        })
        .sort((a, b) => a.penalty - b.penalty)
        .slice(0, CANDIDATE_POOL)

      const chosen = pickWeighted(
        ranked.map(({ meal, scale, penalty }) => ({ item: { meal, scale }, penalty })),
        rng,
      )

      usage.set(chosen.meal.id, (usage.get(chosen.meal.id) ?? 0) + 1)
      entries.push({
        dayOfWeek: day,
        mealType: slot,
        mealId: chosen.meal.id,
        scale: chosen.scale,
      })
    }
  }

  return entries
}

/**
 * Альтернативы для замены блюда: тот же слот, та же калорийная группа (±25%),
 * ограничения соблюдены, текущее блюдо исключено.
 */
export function findAlternatives(params: {
  current: MealCandidate
  currentScale: number
  meals: MealCandidate[]
  dietaryTags: string[]
  limit?: number
}): { meal: MealCandidate; scale: number }[] {
  const { current, currentScale, meals, dietaryTags, limit = 8 } = params
  const slotCalories = current.calories * currentScale

  return meals
    .filter(
      (m) =>
        m.id !== current.id &&
        m.type === current.type &&
        matchesDiet(m, dietaryTags) &&
        Math.abs(m.calories - current.calories) / Math.max(current.calories, 1) <= 0.25,
    )
    .map((meal) => ({ meal, ...scoreMeal(meal, slotCalories, meal.proteinG) }))
    .sort((a, b) => a.penalty - b.penalty)
    .slice(0, limit)
    .map(({ meal, scale }) => ({ meal, scale }))
}
