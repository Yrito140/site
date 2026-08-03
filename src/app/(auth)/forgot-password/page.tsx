'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { requestPasswordReset } from '@/app/actions/actions'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'

export default function ForgotPasswordPage() {
  const t = useTranslations()
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string>()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(undefined)

    const form = new FormData(event.currentTarget)
    const result = await requestPasswordReset({ email: String(form.get('email') ?? '') })

    setPending(false)
    if (!result.ok) {
      setError(result.error ?? t('common.error'))
      return
    }
    setSent(true)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{t('auth.resetTitle')}</h1>

      {sent ? (
        <p className="mt-4 rounded-xl bg-accent-container px-4 py-3 text-sm text-on-accent-container">
          {t('auth.resetSent')}
        </p>
      ) : (
        <>
          <p className="mt-1.5 mb-6 text-sm text-muted">
            Пришлём ссылку для смены пароля. Она действует один час.
          </p>
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <Field label={t('auth.email')} htmlFor="email" required>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>

            {error ? (
              <p className="rounded-xl bg-danger-container px-4 py-3 text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" loading={pending} className="mt-1 w-full">
              Отправить ссылку
            </Button>
          </form>
        </>
      )}

      <p className="mt-5 text-sm text-muted">
        <Link href="/login" className="text-accent hover:underline">
          {t('auth.signIn')}
        </Link>
      </p>
    </div>
  )
}
