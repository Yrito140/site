import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function StatCard({
  label,
  value,
  unit,
  hint,
  icon,
  tone = 'default',
}: {
  label: string
  value: ReactNode
  unit?: string
  hint?: ReactNode
  icon?: ReactNode
  tone?: 'default' | 'accent'
}) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border p-5 shadow-e1',
        tone === 'accent'
          ? 'border-transparent bg-accent text-on-accent'
          : 'border-line bg-surface-high',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={cn('text-sm', tone === 'accent' ? 'text-on-accent/85' : 'text-muted')}>
          {label}
        </p>
        {icon ? (
          <span className={tone === 'accent' ? 'text-on-accent/80' : 'text-muted'}>{icon}</span>
        ) : null}
      </div>
      <p className="mt-2 text-[28px] font-semibold leading-none tracking-tight tabular-nums">
        {value}
        {unit ? (
          <span
            className={cn(
              'ml-1.5 text-sm font-normal',
              tone === 'accent' ? 'text-on-accent/80' : 'text-muted',
            )}
          >
            {unit}
          </span>
        ) : null}
      </p>
      {hint ? (
        <p className={cn('mt-2 text-sm', tone === 'accent' ? 'text-on-accent/85' : 'text-muted')}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
