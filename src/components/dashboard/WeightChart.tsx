'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type WeightPoint = { date: string; label: string; weightKg: number }

/** Динамика веса. Целевой вес рисуется горизонтальной линией. */
export function WeightChart({
  data,
  targetWeightKg,
}: {
  data: WeightPoint[]
  targetWeightKg?: number | null
}) {
  const values = data.map((d) => d.weightKg)
  const min = Math.min(...values, targetWeightKg ?? Number.POSITIVE_INFINITY)
  const max = Math.max(...values, targetWeightKg ?? Number.NEGATIVE_INFINITY)
  const pad = Math.max(1, (max - min) * 0.15)

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-line)" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
            minTickGap={24}
          />
          <YAxis
            domain={[Math.floor(min - pad), Math.ceil(max + pad)]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface-high)',
              border: '1px solid var(--color-line)',
              borderRadius: 12,
              fontSize: 13,
              color: 'var(--color-on-surface)',
            }}
            labelStyle={{ color: 'var(--color-muted)' }}
            formatter={(value: number) => [`${value} кг`, 'Вес']}
          />
          {targetWeightKg ? (
            <ReferenceLine
              y={targetWeightKg}
              stroke="var(--color-accent)"
              strokeDasharray="4 4"
              label={{
                value: `цель ${targetWeightKg}`,
                fill: 'var(--color-accent)',
                fontSize: 12,
                position: 'insideTopRight',
              }}
            />
          ) : null}
          <Area
            type="monotone"
            dataKey="weightKg"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            fill="url(#weightFill)"
            dot={{ r: 3, fill: 'var(--color-chart-1)', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
