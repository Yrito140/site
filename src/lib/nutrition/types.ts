/**
 * Типы модуля расчётов. Дублируют значения enum'ов Prisma намеренно:
 * модуль остаётся чистым и тестируется без сгенерированного клиента.
 */

export type Sex = 'MALE' | 'FEMALE'

export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'

export type Goal = 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE'

export type BmiCategory =
  | 'UNDERWEIGHT'
  | 'NORMAL'
  | 'OVERWEIGHT'
  | 'OBESE_I'
  | 'OBESE_II'
  | 'OBESE_III'

export interface NutritionInput {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  activityLevel: ActivityLevel
  goal: Goal
}

export interface MacroTargets {
  proteinG: number
  fatG: number
  carbsG: number
  proteinPct: number
  fatPct: number
  carbsPct: number
}

export interface NutritionResult {
  bmi: number
  bmiCategory: BmiCategory
  /** Диапазон веса при ИМТ 18.5–24.9 для текущего роста, кг */
  healthyWeightRange: { minKg: number; maxKg: number }
  bmr: number
  tdee: number
  targetCalories: number
  /** true, если расчётный дефицит был поднят до безопасного минимума */
  calorieFloorApplied: boolean
  macros: MacroTargets
}
