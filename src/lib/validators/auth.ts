import { z } from 'zod'

const email = z
  .string()
  .trim()
  .min(1, 'Введите email')
  .email('Некорректный email')
  .max(255)
  .transform((v) => v.toLowerCase())

// Требуем длину и смесь регистров/цифр — без экзотики, которую пользователь
// потом не вспомнит.
const password = z
  .string()
  .min(8, 'Минимум 8 символов')
  .max(72, 'Максимум 72 символа')
  .refine((v) => /[a-zа-яё]/i.test(v), 'Добавьте буквы')
  .refine((v) => /\d/.test(v), 'Добавьте хотя бы одну цифру')

export const credentialsSchema = z.object({
  email,
  password: z.string().min(1).max(72),
})

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Минимум 2 символа').max(80),
  email,
  password,
})

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password,
})

export type RegisterInput = z.infer<typeof registerSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
