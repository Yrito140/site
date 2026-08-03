import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors',
        active
          ? 'border-accent bg-accent-container text-on-accent-container'
          : 'border-line bg-surface text-on-surface hover:bg-surface-low',
      )}
    >
      {active ? <Check className="size-4" aria-hidden /> : null}
      {label}
    </button>
  )
}
