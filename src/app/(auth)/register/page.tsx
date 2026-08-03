'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { registerUser } from '@/app/actions/actions'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'

export default function RegisterPage() {
  const t = useTranslations()
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(undefined)

    const form = new FormData(event.currentTarget)
    const payload = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
    }

    const result = await registerUser(payload)
    if (!result.ok) {
      setError(result.error ?? t('common.error'))
      setPending(false)
      return
    }

    // Сразу логиним — подтверждение email не блокирует вход.
    await signIn('credentials', {
      email: payload.email,
      password: payload.password,
      redirect: false,
    })
    router.push('/onboarding')
    router.refresh()
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{t('auth.signUp')}</h1>
      <p className="mt-1.5 mb-6 text-sm text-muted">{t('app.tagline')}</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field label={t('auth.name')} htmlFor="name" required>
          <Input id="name" name="name" autoComplete="name" required minLength={2} />
        </Field>
        <Field label={t('auth.email')} htmlFor="email" required>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field
          label={t('auth.password')}
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
          {t('auth.signUp')}
        </Button>
      </form>

      <p className="mt-5 text-sm text-muted">
        {t('auth.haveAccount')}{' '}
        <Link href="/login" className="text-accent hover:underline">
          {t('auth.signIn')}
        </Link>
      </p>
    </div>
  )
}
