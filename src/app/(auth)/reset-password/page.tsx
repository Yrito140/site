'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { resetPassword } from '@/app/actions/actions'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'

function ResetPasswordForm() {
  const t = useTranslations()
  const router = useRouter()
  const token = useSearchParams().get('token') ?? ''
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(undefined)

    const form = new FormData(event.currentTarget)
    const result = await resetPassword({
      token,
      password: String(form.get('password') ?? ''),
    })

    setPending(false)
    if (!result.ok) {
      setError(result.error ?? t('common.error'))
      return
    }
    router.push('/login')
  }

  if (!token) {
    return (
      <p className="rounded-xl bg-danger-container px-4 py-3 text-sm text-danger">
        Ссылка неполная. Запросите восстановление пароля заново.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field
        label={t('auth.newPassword')}
        htmlFor="password"
        hint="Минимум 8 символов, буквы и хотя бы одна цифра"
        required
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Field>

      {error ? (
        <p className="rounded-xl bg-danger-container px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={pending} className="mt-1 w-full">
        {t('common.save')}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Новый пароль</h1>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
      <p className="mt-5 text-sm text-muted">
        <Link href="/login" className="text-accent hover:underline">
          Вернуться ко входу
        </Link>
      </p>
    </div>
  )
}
