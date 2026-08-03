import { describe, expect, it } from 'vitest'
import {
  ABSOLUTE_CALORIE_FLOOR,
  ACTIVITY_FACTORS,
  KCAL_PER_GRAM,
  MIN_FAT_PER_KG,
  MIN_PROTEIN_PER_KG,
  calculateBmi,
  calculateBmr,
  calculateMacros,
  calculateNutrition,
  calculateTargetCalories,
  calculateTdee,
  getBmiCategory,
  getHealthyWeightRange,
  macrosToCalories,
} from './index'
import type { NutritionInput } from './types'

describe('calculateBmi', () => {
  it('считает ИМТ по росту и весу', () => {
    expect(calculateBmi(70, 175)).toBe(22.9)
    expect(calculateBmi(60, 165)).toBe(22)
  })

  it('падает на нулевом росте вместо возврата Infinity', () => {
    expect(() => calculateBmi(70, 0)).toThrow()
  })
})

describe('getBmiCategory', () => {
  it.each([
    [17, 'UNDERWEIGHT'],
    [18.5, 'NORMAL'],
    [24.9, 'NORMAL'],
    [25, 'OVERWEIGHT'],
    [29.9, 'OVERWEIGHT'],
    [30, 'OBESE_I'],
    [35, 'OBESE_II'],
    [41, 'OBESE_III'],
  ])('ИМТ %s -> %s', (bmi, expected) => {
    expect(getBmiCategory(bmi)).toBe(expected)
  })
})

describe('getHealthyWeightRange', () => {
  it('возвращает диапазон нормального ИМТ для роста', () => {
    const { minKg, maxKg } = getHealthyWeightRange(175)
    expect(minKg).toBe(56.7)
    expect(maxKg).toBe(76.3)
    expect(getBmiCategory(calculateBmi(minKg, 175))).toBe('NORMAL')
    expect(getBmiCategory(calculateBmi(maxKg, 175))).toBe('NORMAL')
  })
})

describe('calculateBmr (Миффлин — Сан Жеор)', () => {
  it('мужчина 80 кг / 180 см / 30 лет', () => {
    // 10*80 + 6.25*180 − 5*30 + 5 = 1780
    expect(calculateBmr({ sex: 'MALE', age: 30, heightCm: 180, weightKg: 80 })).toBe(1780)
  })

  it('женщина 60 кг / 165 см / 25 лет', () => {
    // 10*60 + 6.25*165 − 5*25 − 161 = 1345.25 -> 1345
    expect(calculateBmr({ sex: 'FEMALE', age: 25, heightCm: 165, weightKg: 60 })).toBe(1345)
  })

  it('разница между полами при равных параметрах — 166 ккал', () => {
    const base = { age: 30, heightCm: 175, weightKg: 70 } as const
    const male = calculateBmr({ ...base, sex: 'MALE' })
    const female = calculateBmr({ ...base, sex: 'FEMALE' })
    expect(male - female).toBe(166)
  })
})

describe('calculateTdee', () => {
  it('умножает BMR на коэффициент активности', () => {
    expect(calculateTdee(1500, 'SEDENTARY')).toBe(1800)
    expect(calculateTdee(1500, 'MODERATE')).toBe(2325)
    expect(calculateTdee(1500, 'VERY_HIGH')).toBe(2850)
  })

  it('коэффициенты монотонно растут в диапазоне 1.2–1.9', () => {
    const values = Object.values(ACTIVITY_FACTORS)
    expect(values[0]).toBe(1.2)
    expect(values.at(-1)).toBe(1.9)
    for (let i = 1; i < values.length; i += 1) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })
})

describe('calculateTargetCalories', () => {
  it('дефицит 20% на похудении', () => {
    const { targetCalories, floorApplied } = calculateTargetCalories({
      tdee: 2500,
      bmr: 1700,
      goal: 'LOSE_WEIGHT',
      sex: 'MALE',
    })
    expect(targetCalories).toBe(2000)
    expect(floorApplied).toBe(false)
  })

  it('поддержание не меняет TDEE', () => {
    expect(
      calculateTargetCalories({ tdee: 2200, bmr: 1600, goal: 'MAINTAIN', sex: 'FEMALE' })
        .targetCalories,
    ).toBe(2200)
  })

  it('профицит 10% на массе', () => {
    expect(
      calculateTargetCalories({ tdee: 2800, bmr: 1900, goal: 'GAIN_MUSCLE', sex: 'MALE' })
        .targetCalories,
    ).toBe(3080)
  })

  it('не опускает калории ниже BMR при дефиците', () => {
    const { targetCalories, floorApplied } = calculateTargetCalories({
      tdee: 2000,
      bmr: 1800,
      goal: 'LOSE_WEIGHT',
      sex: 'MALE',
    })
    expect(targetCalories).toBe(1800)
    expect(floorApplied).toBe(true)
  })

  it('держит абсолютный минимум по полу при низком BMR', () => {
    const { targetCalories, floorApplied } = calculateTargetCalories({
      tdee: 1300,
      bmr: 1100,
      goal: 'LOSE_WEIGHT',
      sex: 'FEMALE',
    })
    expect(targetCalories).toBe(ABSOLUTE_CALORIE_FLOOR.FEMALE)
    expect(floorApplied).toBe(true)
  })
})

describe('calculateMacros', () => {
  it('сумма БЖУ совпадает с целевой калорийностью', () => {
    const macros = calculateMacros({ targetCalories: 2000, weightKg: 70, goal: 'MAINTAIN' })
    expect(macrosToCalories(macros)).toBeGreaterThanOrEqual(1980)
    expect(macrosToCalories(macros)).toBeLessThanOrEqual(2020)
  })

  it('проценты в сумме дают ~100', () => {
    const { proteinPct, fatPct, carbsPct } = calculateMacros({
      targetCalories: 2200,
      weightKg: 75,
      goal: 'LOSE_WEIGHT',
    })
    expect(proteinPct + fatPct + carbsPct).toBeGreaterThanOrEqual(99)
    expect(proteinPct + fatPct + carbsPct).toBeLessThanOrEqual(101)
  })

  it('держит минимум белка на кг при дефиците', () => {
    const weightKg = 90
    const macros = calculateMacros({ targetCalories: 1600, weightKg, goal: 'LOSE_WEIGHT' })
    expect(macros.proteinG).toBeGreaterThanOrEqual(
      Math.round(weightKg * MIN_PROTEIN_PER_KG.LOSE_WEIGHT) - 1,
    )
  })

  it('держит минимум жиров на кг', () => {
    const weightKg = 80
    const macros = calculateMacros({ targetCalories: 1500, weightKg, goal: 'LOSE_WEIGHT' })
    expect(macros.fatG).toBeGreaterThanOrEqual(Math.round(weightKg * MIN_FAT_PER_KG) - 1)
  })

  it('не уводит углеводы в минус при жёстком дефиците', () => {
    const macros = calculateMacros({ targetCalories: 1200, weightKg: 110, goal: 'LOSE_WEIGHT' })
    expect(macros.carbsG).toBeGreaterThanOrEqual(0)
    expect(macros.proteinG).toBeGreaterThan(0)
    expect(macros.fatG).toBeGreaterThan(0)
  })

  it('на массе углеводов больше, чем на похудении', () => {
    const lose = calculateMacros({ targetCalories: 2400, weightKg: 80, goal: 'LOSE_WEIGHT' })
    const gain = calculateMacros({ targetCalories: 2400, weightKg: 80, goal: 'GAIN_MUSCLE' })
    expect(gain.carbsG).toBeGreaterThan(lose.carbsG)
  })
})

describe('calculateNutrition', () => {
  const input: NutritionInput = {
    sex: 'FEMALE',
    age: 28,
    heightCm: 168,
    weightKg: 72,
    activityLevel: 'LIGHT',
    goal: 'LOSE_WEIGHT',
  }

  it('собирает согласованный результат', () => {
    const r = calculateNutrition(input)
    expect(r.bmr).toBe(calculateBmr(input))
    expect(r.tdee).toBe(calculateTdee(r.bmr, 'LIGHT'))
    expect(r.targetCalories).toBeLessThan(r.tdee)
    expect(r.bmiCategory).toBe('OVERWEIGHT')
    expect(r.macros.proteinG).toBeGreaterThan(0)
    expect(macrosToCalories(r.macros)).toBeCloseTo(r.targetCalories, -2)
  })

  it('отвергает параметры вне допустимого диапазона', () => {
    expect(() => calculateNutrition({ ...input, age: 5 })).toThrow(/age/)
    expect(() => calculateNutrition({ ...input, heightCm: 90 })).toThrow(/heightCm/)
    expect(() => calculateNutrition({ ...input, weightKg: 500 })).toThrow(/weightKg/)
    expect(() => calculateNutrition({ ...input, weightKg: Number.NaN })).toThrow(/weightKg/)
  })

  it('калорийность растёт вместе с активностью', () => {
    const levels = Object.keys(ACTIVITY_FACTORS) as NutritionInput['activityLevel'][]
    const targets = levels.map(
      (activityLevel) => calculateNutrition({ ...input, activityLevel, goal: 'MAINTAIN' }).targetCalories,
    )
    for (let i = 1; i < targets.length; i += 1) {
      expect(targets[i]).toBeGreaterThan(targets[i - 1])
    }
  })

  it('грамм жира считается по 9 ккал, белка и углеводов — по 4', () => {
    expect(KCAL_PER_GRAM).toEqual({ protein: 4, fat: 9, carbs: 4 })
  })
})
