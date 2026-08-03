import type { BmiCategory } from './types'

const round = (value: number, digits = 1) => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

/** ИМТ по классической формуле: вес / рост². */
export function calculateBmi(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) throw new Error('heightCm must be > 0')
  const heightM = heightCm / 100
  return round(weightKg / (heightM * heightM), 1)
}

/** Категории по классификации ВОЗ. */
export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'UNDERWEIGHT'
  if (bmi < 25) return 'NORMAL'
  if (bmi < 30) return 'OVERWEIGHT'
  if (bmi < 35) return 'OBESE_I'
  if (bmi < 40) return 'OBESE_II'
  return 'OBESE_III'
}

/** Диапазон веса, попадающий в нормальный ИМТ при данном росте. */
export function getHealthyWeightRange(heightCm: number): { minKg: number; maxKg: number } {
  const heightM = heightCm / 100
  const area = heightM * heightM
  return {
    minKg: round(18.5 * area, 1),
    maxKg: round(24.9 * area, 1),
  }
}
