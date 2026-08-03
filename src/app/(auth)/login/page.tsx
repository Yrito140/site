'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'

export default function LoginPage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useSearchParams()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(undefined)

    const form = new FormData(event.currentTarget)
    const result = await signIn('credentials', {
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
      redirect: false,
    })

    setPending(false)
    if (result?.error) {
      setError(t('auth.invalidCredentials'))
      return
    }
    router.push(params.get('next') ?? '/dashboard')
    router.refresh()
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{t('auth.signIn')}</h1>
      <p className="mt-1.5 mb-6 text-sm text-muted">{t('app.tagline')}</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field label={t('auth.email')} htmlFor="email" required>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label={t('auth.password')} htmlFor="password" required>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>

        {error ? (
          <p className="rounded-xl bg-danger-container px-4 py-3 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" loading={pending} className="mt-1 w-full">
          {t('auth.signIn')}
        </Button>
      </form>

      <div className="mt-5 flex flex-col gap-1.5 text-sm">
        <Link href="/forgot-password" className="text-accent hover:underline">
          {t('auth.forgot')}
        </Link>
        <p className="text-muted">
          {t('auth.noAccount')}{' '}
          <Link href="/register" className="text-accent hover:underline">
            {t('auth.signUp')}
          </Link>
        </p>
      </div>
    </div>
  )
}
