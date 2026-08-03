import Link from 'next/link'
import { verifyEmail } from '@/app/actions/actions'

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const result = token ? await verifyEmail(token) : { ok: false as const, error: 'Ссылка неполная' }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Подтверждение почты</h1>
      {result.ok ? (
        <p className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
          Почта подтверждена. Теперь можно войти.
        </p>
      ) : (
        <p className="rounded-xl bg-danger-container px-4 py-3 text-sm text-danger" role="alert">
          {result.error}
        </p>
      )}
      <p className="mt-5 text-sm text-muted">
        <Link href="/login" className="text-accent hover:underline">
          Вернуться ко входу
        </Link>
      </p>
    </div>
  )
}
