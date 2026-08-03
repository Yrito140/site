import type { ActivityLevel, Goal, Sex } from './types'

/** Стандартные коэффициенты физической активности для TDEE. */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  HIGH: 1.725,
  VERY_HIGH: 1.9,
}

/** Множитель калорий от TDEE под цель. */
export const GOAL_CALORIE_FACTORS: Record<Goal, number> = {
  LOSE_WEIGHT: 0.8,
  MAINTAIN: 1,
  GAIN_MUSCLE: 1.1,
}

/**
 * Нижняя граница калорийности. Дефицит никогда не опускается ниже BMR
 * и ниже абсолютного минимума — иначе рацион перестаёт покрывать
 * потребность в микронутриентах.
 */
export const ABSOLUTE_CALORIE_FLOOR: Record<Sex, number> = {
  FEMALE: 1200,
  MALE: 1500,
}

/** Целевое распределение калорий по нутриентам, доли от суммы калорий. */
export const MACRO_SPLITS: Record<Goal, { protein: number; fat: number; carbs: number }> = {
  LOSE_WEIGHT: { protein: 0.3, fat: 0.3, carbs: 0.4 },
  MAINTAIN: { protein: 0.25, fat: 0.3, carbs: 0.45 },
  GAIN_MUSCLE: { protein: 0.25, fat: 0.25, carbs: 0.5 },
}

/**
 * Минимум белка на кг массы тела. В дефиците белок защищает мышечную
 * массу, поэтому порог выше — если процентовка даёт меньше, добираем
 * за счёт углеводов.
 */
export const MIN_PROTEIN_PER_KG: Record<Goal, number> = {
  LOSE_WEIGHT: 1.8,
  MAINTAIN: 1.4,
  GAIN_MUSCLE: 1.6,
}

/** Минимум жиров на кг массы тела — ниже страдает гормональный фон. */
export const MIN_FAT_PER_KG = 0.6

export const KCAL_PER_GRAM = {
  protein: 4,
  fat: 9,
  carbs: 4,
} as const

export const INPUT_LIMITS = {
  age: { min: 14, max: 100 },
  heightCm: { min: 120, max: 250 },
  weightKg: { min: 30, max: 300 },
} as const
