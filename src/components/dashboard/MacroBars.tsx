import { cn } from '@/lib/cn'

/** Полосы БЖУ: план и факт за день. */
export function MacroBars({
  target,
  actual,
  labels,
}: {
  target: { proteinG: number; fatG: number; carbsG: number }
  actual?: { proteinG: number; fatG: number; carbsG: number }
  labels: { protein: string; fat: string; carbs: string }
}) {
  const rows = [
    { key: 'protein', label: labels.protein, target: target.proteinG, actual: actual?.proteinG, color: 'bg-chart-1' },
    { key: 'fat', label: labels.fat, target: target.fatG, actual: actual?.fatG, color: 'bg-chart-3' },
    { key: 'carbs', label: labels.carbs, target: target.carbsG, actual: actual?.carbsG, color: 'bg-chart-2' },
  ] as const

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => {
        const filled = row.actual ?? 0
        const pct = row.target > 0 ? Math.min(100, (filled / row.target) * 100) : 0
        return (
          <div key={row.key}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
              <span className="text-muted">{row.label}</span>
              <span className="tabular-nums">
                {row.actual !== undefined ? (
                  <>
                    <span className="font-medium">{Math.round(filled)}</span>
                    <span className="text-muted"> / {Math.round(row.target)} г</span>
                  </>
                ) : (
                  <span className="font-medium">{Math.round(row.target)} г</span>
                )}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-low">
              <span
                className={cn('block h-full rounded-full transition-[width] duration-500', row.color)}
                style={{ width: `${row.actual !== undefined ? pct : 100}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
