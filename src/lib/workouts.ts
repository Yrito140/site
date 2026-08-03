export type WorkoutType = 'CARDIO' | 'STRENGTH' | 'HIIT' | 'YOGA' | 'WALKING' | 'OTHER'
export type WorkoutIntensity = 'LOW' | 'MEDIUM' | 'HIGH'

/**
 * MET (метаболический эквивалент) по типу и интенсивности.
 * Значения из компендиума Ainsworth, округлены до практичных.
 */
const MET_TABLE: Record<WorkoutType, Record<WorkoutIntensity, number>> = {
  CARDIO: { LOW: 5, MEDIUM: 7.5, HIGH: 10 },
  STRENGTH: { LOW: 3.5, MEDIUM: 5, HIGH: 6 },
  HIIT: { LOW: 6, MEDIUM: 8.5, HIGH: 11 },
  YOGA: { LOW: 2.5, MEDIUM: 3.5, HIGH: 5 },
  WALKING: { LOW: 2.8, MEDIUM: 3.8, HIGH: 5 },
  OTHER: { LOW: 3, MEDIUM: 4.5, HIGH: 6 },
}

/**
 * Расход калорий: MET × вес (кг) × часы. Оценка, а не измерение —
 * поэтому в UI подписана как расчётная и её можно переопределить вручную.
 */
export function estimateCaloriesBurned(params: {
  type: WorkoutType
  intensity: WorkoutIntensity
  durationMinutes: number
  weightKg: number
}): number {
  const met = MET_TABLE[params.type][params.intensity]
  return Math.round(met * params.weightKg * (params.durationMinutes / 60))
}

export function metFor(type: WorkoutType, intensity: WorkoutIntensity): number {
  return MET_TABLE[type][intensity]
}
