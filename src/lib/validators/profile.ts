import { z } from 'zod'
import { INPUT_LIMITS } from '@/lib/nutrition'

export const DIETARY_TAGS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'lactose-free',
  'nut-free',
] as const

const num = (min: number, max: number, label: string) =>
  z.coerce
    .number({ invalid_type_error: `Укажите ${label}` })
    .min(min, `${label}: не меньше ${min}`)
    .max(max, `${label}: не больше ${max}`)

export const profileSchema = z.object({
  sex: z.enum(['MALE', 'FEMALE'], { required_error: 'Выберите пол' }),
  age: num(INPUT_LIMITS.age.min, INPUT_LIMITS.age.max, 'возраст').int(),
  heightCm: num(INPUT_LIMITS.heightCm.min, INPUT_LIMITS.heightCm.max, 'рост'),
  currentWeightKg: num(INPUT_LIMITS.weightKg.min, INPUT_LIMITS.weightKg.max, 'вес'),
  targetWeightKg: num(INPUT_LIMITS.weightKg.min, INPUT_LIMITS.weightKg.max, 'целевой вес')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  goal: z.enum(['LOSE_WEIGHT', 'MAINTAIN', 'GAIN_MUSCLE'], { required_error: 'Выберите цель' }),
  activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'HIGH', 'VERY_HIGH'], {
    required_error: 'Выберите уровень активности',
  }),
  dietaryTags: z.array(z.enum(DIETARY_TAGS)).default([]),
})

export const weightLogSchema = z.object({
  date: z.coerce.date().max(new Date(Date.now() + 864e5), 'Дата не может быть в будущем'),
  weightKg: num(INPUT_LIMITS.weightKg.min, INPUT_LIMITS.weightKg.max, 'вес'),
  bodyFatPct: num(3, 70, 'процент жира').optional().or(z.literal('').transform(() => undefined)),
  waistCm: num(40, 200, 'обхват талии').optional().or(z.literal('').transform(() => undefined)),
  notes: z.string().trim().max(500).optional(),
})

export const workoutLogSchema = z.object({
  date: z.coerce.date().max(new Date(Date.now() + 864e5), 'Дата не может быть в будущем'),
  type: z.enum(['CARDIO', 'STRENGTH', 'HIIT', 'YOGA', 'WALKING', 'OTHER']),
  title: z.string().trim().max(120).optional(),
  durationMinutes: num(1, 600, 'длительность').int(),
  intensity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  caloriesBurned: num(0, 5000, 'расход калорий')
    .int()
    .optional()
    .or(z.literal('').transform(() => undefined)),
})

export type ProfileInput = z.infer<typeof profileSchema>
export type WeightLogInput = z.infer<typeof weightLogSchema>
export type WorkoutLogInput = z.infer<typeof workoutLogSchema>
