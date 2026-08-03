'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'
import { createWorkoutLog } from '@/app/actions/actions'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Field, Input, Select } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { estimateCaloriesBurned } from '@/lib/workouts'
import type { WorkoutIntensity, WorkoutType } from '@/lib/workouts'

const TYPES: WorkoutType[] = ['CARDIO', 'STRENGTH', 'HIIT', 'YOGA', 'WALKING', 'OTHER']
const LEVELS: WorkoutIntensity[] = ['LOW', 'MEDIUM', 'HIGH']

export function AddWorkoutDialog({ weightKg }: { weightKg: number }) {
  const t = useTranslations()
  const router = useRouter()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const [type, setType] = useState<WorkoutType>('STRENGTH')
  const [intensity, setIntensity] = useState<WorkoutIntensity>('MEDIUM')
  const [duration, setDuration] = useState('45')

  const today = new Date().toISOString().slice(0, 10)

  // Подсказка обновляется на лету; пользователь может её переопределить.
  const estimate = useMemo(() => {
    const minutes = Number(duration)
    if (!minutes || minutes <= 0) return 0
    return estimateCaloriesBurned({ type, intensity, durationMinutes: minutes, weightKg })
  }, [type, intensity, duration, weightKg])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)

    const form = new FormData(event.currentTarget)
    const manual = String(form.get('caloriesBurned') ?? '').trim()
    const result = await createWorkoutLog({
      date: String(form.get('date') ?? today),
      type,
      intensity,
      title: String(form.get('title') ?? ''),
      durationMinutes: duration,
      caloriesBurned: manual === '' ? String(estimate) : manual,
    })

    setPending(false)
    if (!result.ok) {
      toast('error', result.error ?? t('common.error'))
      return
    }
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} icon={<Plus className="size-4" />}>
        {t('workouts.add')}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} title={t('workouts.add')}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Дата" htmlFor="date" required>
              <Input id="date" name="date" type="date" defaultValue={today} max={today} required />
            </Field>
            <Field label={t('workouts.type')} htmlFor="type" required>
              <Select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as WorkoutType)}
              >
                {TYPES.map((value) => (
                  <option key={value} value={value}>
                    {t(`workoutTypes.${value}`)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Название" htmlFor="title" hint="Необязательно">
            <Input id="title" name="title" maxLength={120} placeholder="Например: ноги + пресс" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('workouts.duration')} htmlFor="duration" required>
              <Input
                id="duration"
                type="number"
                inputMode="numeric"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min={1}
                max={600}
                required
              />
            </Field>
            <Field label={t('workouts.intensity')} htmlFor="intensity" required>
              <Select
                id="intensity"
                value={intensity}
                onChange={(e) => setIntensity(e.target.value as WorkoutIntensity)}
              >
                {LEVELS.map((value) => (
                  <option key={value} value={value}>
                    {t(`intensity.${value}`)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field
            label={t('workouts.burned')}
            htmlFor="caloriesBurned"
            hint={`${t('workouts.estimated')}: ${estimate} ${t('metrics.kcal')}`}
          >
            <Input
              id="caloriesBurned"
              name="caloriesBurned"
              type="number"
              inputMode="numeric"
              placeholder={String(estimate)}
              min={0}
              max={5000}
            />
          </Field>

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="text" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={pending}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
