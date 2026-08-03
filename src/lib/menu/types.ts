export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'

export interface MealCandidate {
  id: string
  type: MealType
  calories: number
  proteinG: number
  fatG: number
  carbsG: number
  tags: string[]
}

export interface GeneratedEntry {
  dayOfWeek: number
  mealType: MealType
  mealId: string
  /** Множитель порции — приводит блюдо к целевой калорийности слота. */
  scale: number
}

export interface GenerateMenuParams {
  targetCalories: number
  targetProteinG: number
  dietaryTags: string[]
  meals: MealCandidate[]
  /** Строка-семя: одинаковое семя даёт одинаковое меню. */
  seed: string
  days?: number
}

export class NotEnoughMealsError extends Error {
  constructor(readonly mealType: MealType) {
    super(`Недостаточно блюд для слота ${mealType} под выбранные ограничения`)
    this.name = 'NotEnoughMealsError'
  }
}
