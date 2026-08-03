import { calculateBmi, getBmiCategory, getHealthyWeightRange } from './bmi'
import { INPUT_LIMITS } from './constants'
import { calculateEnergy } from './energy'
import { calculateMacros } from './macros'
import type { NutritionInput, NutritionResult } from './types'

export * from './types'
export * from './constants'
export { calculateBmi, getBmiCategory, getHealthyWeightRange } from './bmi'
export { calculateBmr, calculateTdee, calculateTargetCalories, calculateEnergy } from './energy'
export { calculateMacros, macrosToCalories } from './macros'

function assertRange(name: keyof typeof INPUT_LIMITS, value: number) {
  const { min, max } = INPUT_LIMITS[name]
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${name} must be between ${min} and ${max}, got ${value}`)
  }
}

/** Полный расчёт показателей профиля — единственная точка входа для UI. */
export function calculateNutrition(input: NutritionInput): NutritionResult {
  assertRange('age', input.age)
  assertRange('heightCm', input.heightCm)
  assertRange('weightKg', input.weightKg)

  const bmi = calculateBmi(input.weightKg, input.heightCm)
  const { bmr, tdee, targetCalories, floorApplied } = calculateEnergy(input)

  return {
    bmi,
    bmiCategory: getBmiCategory(bmi),
    healthyWeightRange: getHealthyWeightRange(input.heightCm),
    bmr,
    tdee,
    targetCalories,
    calorieFloorApplied: floorApplied,
    macros: calculateMacros({
      targetCalories,
      weightKg: input.weightKg,
      goal: input.goal,
    }),
  }
}
