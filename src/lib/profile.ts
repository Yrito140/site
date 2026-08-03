import type { Profile } from '@prisma/client'
import { calculateNutrition } from '@/lib/nutrition'
import type { NutritionInput, NutritionResult } from '@/lib/nutrition'

/**
 * Профиль из БД -> вход расчётного модуля. Единственное место, где
 * currentWeightKg превращается в weightKg — иначе поля путаются.
 */
export function profileToNutritionInput(profile: {
  sex: Profile['sex']
  age: number
  heightCm: number
  currentWeightKg: number
  activityLevel: Profile['activityLevel']
  goal: Profile['goal']
}): NutritionInput {
  return {
    sex: profile.sex,
    age: profile.age,
    heightCm: profile.heightCm,
    weightKg: profile.currentWeightKg,
    activityLevel: profile.activityLevel,
    goal: profile.goal,
  }
}

export function nutritionForProfile(profile: Parameters<typeof profileToNutritionInput>[0]): NutritionResult {
  return calculateNutrition(profileToNutritionInput(profile))
}

/** Понедельник недели в UTC — ключ недельного меню. */
export function startOfWeekUtc(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = (d.getUTCDay() + 6) % 7 // пн = 0
  d.setUTCDate(d.getUTCDate() - day)
  return d
}

/** Дата без времени в UTC — ключ дневных логов. */
export function dateOnlyUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}
