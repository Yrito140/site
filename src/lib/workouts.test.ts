import { describe, expect, it } from 'vitest'
import { estimateCaloriesBurned, metFor } from './workouts'
import type { WorkoutIntensity, WorkoutType } from './workouts'

describe('estimateCaloriesBurned', () => {
  it('считает по формуле MET × вес × часы', () => {
    // 7.5 × 70 × 1 = 525
    expect(
      estimateCaloriesBurned({ type: 'CARDIO', intensity: 'MEDIUM', durationMinutes: 60, weightKg: 70 }),
    ).toBe(525)
  })

  it('масштабируется линейно по времени', () => {
    const half = estimateCaloriesBurned({
      type: 'STRENGTH',
      intensity: 'MEDIUM',
      durationMinutes: 30,
      weightKg: 80,
    })
    const full = estimateCaloriesBurned({
      type: 'STRENGTH',
      intensity: 'MEDIUM',
      durationMinutes: 60,
      weightKg: 80,
    })
    expect(full).toBe(half * 2)
  })

  it('растёт с интенсивностью', () => {
    const base = { type: 'HIIT' as WorkoutType, durationMinutes: 45, weightKg: 75 }
    const low = estimateCaloriesBurned({ ...base, intensity: 'LOW' })
    const mid = estimateCaloriesBurned({ ...base, intensity: 'MEDIUM' })
    const high = estimateCaloriesBurned({ ...base, intensity: 'HIGH' })
    expect(low).toBeLessThan(mid)
    expect(mid).toBeLessThan(high)
  })

  it('на нулевой длительности даёт ноль', () => {
    expect(
      estimateCaloriesBurned({ type: 'YOGA', intensity: 'LOW', durationMinutes: 0, weightKg: 60 }),
    ).toBe(0)
  })

  it('покрывает все комбинации типа и интенсивности', () => {
    const types: WorkoutType[] = ['CARDIO', 'STRENGTH', 'HIIT', 'YOGA', 'WALKING', 'OTHER']
    const levels: WorkoutIntensity[] = ['LOW', 'MEDIUM', 'HIGH']
    for (const type of types) {
      for (const intensity of levels) {
        expect(metFor(type, intensity)).toBeGreaterThan(0)
      }
    }
  })

  it('йога расходует меньше интервальной при равных условиях', () => {
    const base = { intensity: 'MEDIUM' as WorkoutIntensity, durationMinutes: 40, weightKg: 70 }
    expect(estimateCaloriesBurned({ ...base, type: 'YOGA' })).toBeLessThan(
      estimateCaloriesBurned({ ...base, type: 'HIIT' }),
    )
  })
})
