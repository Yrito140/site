import { ABSOLUTE_CALORIE_FLOOR, ACTIVITY_FACTORS, GOAL_CALORIE_FACTORS } from './constants'
import type { ActivityLevel, Goal, NutritionInput, Sex } from './types'

/**
 * Базовый метаболизм по Миффлину — Сан Жеору.
 * Мужчины: 10w + 6.25h − 5a + 5, женщины: те же члены − 161.
 */
export function calculateBmr(input: {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
}): number {
  const { sex, age, heightCm, weightKg } = input
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return Math.round(sex === 'MALE' ? base + 5 : base - 161)
}

/** Суточный расход = BMR × коэффициент активности. */
export function calculateTdee(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_FACTORS[activityLevel])
}

/**
 * Целевая калорийность под цель с защитой снизу: дефицит не уходит
 * ниже BMR и ниже абсолютного минимума по полу.
 */
export function calculateTargetCalories(params: {
  tdee: number
  bmr: number
  goal: Goal
  sex: Sex
}): { targetCalories: number; floorApplied: boolean } {
  const { tdee, bmr, goal, sex } = params
  const raw = Math.round(tdee * GOAL_CALORIE_FACTORS[goal])
  const floor = Math.max(bmr, ABSOLUTE_CALORIE_FLOOR[sex])

  if (goal === 'LOSE_WEIGHT' && raw < floor) {
    // Дефицит упёрся в физиологический минимум — остаток добирается активностью.
    return { targetCalories: Math.round(floor), floorApplied: true }
  }
  return { targetCalories: raw, floorApplied: false }
}

/** Энергетическая часть расчёта одним вызовом. */
export function calculateEnergy(input: NutritionInput) {
  const bmr = calculateBmr(input)
  const tdee = calculateTdee(bmr, input.activityLevel)
  const { targetCalories, floorApplied } = calculateTargetCalories({
    tdee,
    bmr,
    goal: input.goal,
    sex: input.sex,
  })
  return { bmr, tdee, targetCalories, floorApplied }
}
