import {
  KCAL_PER_GRAM,
  MACRO_SPLITS,
  MIN_FAT_PER_KG,
  MIN_PROTEIN_PER_KG,
} from './constants'
import type { Goal, MacroTargets } from './types'

const round = (value: number, digits = 1) => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

/**
 * БЖУ из целевой калорийности. Процентовка задаёт старт, затем белок и
 * жиры поднимаются до минимумов на кг веса, а углеводы забирают остаток.
 * Углеводы не уходят в минус: при жёстком дефиците лишнее снимается
 * с жиров до их собственного минимума.
 */
export function calculateMacros(params: {
  targetCalories: number
  weightKg: number
  goal: Goal
}): MacroTargets {
  const { targetCalories, weightKg, goal } = params
  const split = MACRO_SPLITS[goal]

  let proteinG = Math.max(
    (targetCalories * split.protein) / KCAL_PER_GRAM.protein,
    weightKg * MIN_PROTEIN_PER_KG[goal],
  )
  let fatG = Math.max(
    (targetCalories * split.fat) / KCAL_PER_GRAM.fat,
    weightKg * MIN_FAT_PER_KG,
  )

  const minFatG = weightKg * MIN_FAT_PER_KG
  let carbsKcal =
    targetCalories - proteinG * KCAL_PER_GRAM.protein - fatG * KCAL_PER_GRAM.fat

  if (carbsKcal < 0) {
    const reducibleFatG = Math.max(0, fatG - minFatG)
    const reduceFatG = Math.min(reducibleFatG, -carbsKcal / KCAL_PER_GRAM.fat)
    fatG -= reduceFatG
    carbsKcal += reduceFatG * KCAL_PER_GRAM.fat
  }

  if (carbsKcal < 0) {
    // Крайний случай: даже при минимуме жиров калорий не хватает на белок.
    const deficitG = -carbsKcal / KCAL_PER_GRAM.protein
    proteinG = Math.max(0, proteinG - deficitG)
    carbsKcal = 0
  }

  const carbsG = carbsKcal / KCAL_PER_GRAM.carbs
  const total =
    proteinG * KCAL_PER_GRAM.protein + fatG * KCAL_PER_GRAM.fat + carbsG * KCAL_PER_GRAM.carbs
  const pct = (grams: number, perGram: number) =>
    total > 0 ? round(((grams * perGram) / total) * 100, 0) : 0

  return {
    proteinG: Math.round(proteinG),
    fatG: Math.round(fatG),
    carbsG: Math.round(carbsG),
    proteinPct: pct(proteinG, KCAL_PER_GRAM.protein),
    fatPct: pct(fatG, KCAL_PER_GRAM.fat),
    carbsPct: pct(carbsG, KCAL_PER_GRAM.carbs),
  }
}

/** Калорийность набора БЖУ — для сверки блюд и дневных итогов. */
export function macrosToCalories(macros: {
  proteinG: number
  fatG: number
  carbsG: number
}): number {
  return Math.round(
    macros.proteinG * KCAL_PER_GRAM.protein +
      macros.fatG * KCAL_PER_GRAM.fat +
      macros.carbsG * KCAL_PER_GRAM.carbs,
  )
}
