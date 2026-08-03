import { cn } from '@/lib/cn'

const BMI_SCALE = [
  { key: 'UNDERWEIGHT', max: 18.5, color: 'bg-chart-2' },
  { key: 'NORMAL', max: 25, color: 'bg-success' },
  { key: 'OVERWEIGHT', max: 30, color: 'bg-warning' },
  { key: 'OBESE_I', max: 40, color: 'bg-danger' },
] as const

/** Шкала ИМТ с маркером текущего значения. */
export function BmiScale({ bmi }: { bmi: number }) {
  // Визуальный диапазон 15–40: за его пределами маркер прижимается к краю.
  const position = Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100))

  return (
    <div>
      <div className="relative">
        <div className="flex h-2 overflow-hidden rounded-full">
          {BMI_SCALE.map(({ key, color }, i) => (
            <span
              key={key}
              className={cn(color, i === 0 ? 'flex-[3.5]' : i === 1 ? 'flex-[6.5]' : 'flex-[5]')}
            />
          ))}
        </div>
        <span
          className="absolute -top-1 size-4 -translate-x-1/2 rounded-full border-2 border-surface-high bg-on-surface shadow-e1"
          style={{ left: `${position}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted tabular-nums">
        <span>15</span>
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
        <span>40</span>
      </div>
    </div>
  )
}
