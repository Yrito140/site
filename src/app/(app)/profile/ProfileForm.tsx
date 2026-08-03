'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { RefreshCcw } from 'lucide-react'
import { saveProfile } from '@/app/actions/actions'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { Field, Input, Select } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { MacroBars } from '@/components/dashboard/MacroBars'
import { BmiScale } from '@/components/dashboard/BmiScale'
import { calculateNutrition } from '@/lib/nutrition'
import type { ActivityLevel, Goal, NutritionResult, Sex } from '@/lib/nutrition'
import { DIETARY_TAGS } from '@/lib/validators/profile'

type FormState = {
  sex: Sex
  age: string
  heightCm: string
  currentWeightKg: string
  targetWeightKg: string
  goal: Goal
  activityLevel: ActivityLevel
  dietaryTags: string[]
}

const GOALS: Goal[] = ['LOSE_WEIGHT', 'MAINTAIN', 'GAIN_MUSCLE']
const LEVELS: ActivityLevel[] = ['SEDENTARY', 'LIGHT', 'MODERATE', 'HIGH', 'VERY_HIGH']

export function ProfileForm({
  initial,
  initialNutrition,
}: {
  initial: FormState
  initialNutrition: NutritionResult
}) {
  const t = useTranslations()
  const router = useRouter()
  const toast = useToast()
  const [state, setState] = useState<FormState>(initial)
  const [pending, setPending] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }))

  // Пересчёт на клиенте тем же модулем — кнопка «пересчитать» не нужна для превью.
  const nutrition = useMemo(() => {
    try {
      return calculateNutrition({
        sex: state.sex,
        age: Number(state.age),
        heightCm: Number(state.heightCm),
        weightKg: Number(state.currentWeightKg),
        activityLevel: state.activityLevel,
        goal: state.goal,
      })
    } catch {
      return initialNutrition
    }
  }, [state, initialNutrition])

  async function submit() {
    setPending(true)
    const result = await saveProfile({
      sex: state.sex,
      age: state.age,
      heightCm: state.heightCm,
      currentWeightKg: state.currentWeightKg,
      targetWeightKg: state.targetWeightKg || undefined,
      goal: state.goal,
      activityLevel: state.activityLevel,
      dietaryTags: state.dietaryTags,
    })
    setPending(false)

    if (!result.ok) {
      toast('error', result.error ?? t('common.error'))
      return
    }
    toast('success', t('profile.saved'))
    router.refresh()
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
      <Card>
        <CardHeader title={t('nav.profile')} description="Изменения влияют на нормы и генерацию меню" />

        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('profile.sex')} htmlFor="sex" required>
              <Select id="sex" value={state.sex} onChange={(e) => set('sex', e.target.value as Sex)}>
                <option value="FEMALE">{t('profile.female')}</option>
                <option value="MALE">{t('profile.male')}</option>
              </Select>
            </Field>
            <Field label={t('profile.age')} htmlFor="age" required>
              <Input
                id="age"
                type="number"
                inputMode="numeric"
                value={state.age}
                onChange={(e) => set('age', e.target.value)}
                min={14}
                max={100}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t('profile.height')} htmlFor="height" required>
              <Input
                id="height"
                type="number"
                inputMode="decimal"
                value={state.heightCm}
                onChange={(e) => set('heightCm', e.target.value)}
                min={120}
                max={250}
              />
            </Field>
            <Field label={t('profile.weight')} htmlFor="weight" required>
              <Input
                id="weight"
                type="number"
                step="0.1"
                inputMode="decimal"
                value={state.currentWeightKg}
                onChange={(e) => set('currentWeightKg', e.target.value)}
                min={30}
                max={300}
              />
            </Field>
            <Field label={t('profile.targetWeight')} htmlFor="target">
              <Input
                id="target"
                type="number"
                step="0.1"
                inputMode="decimal"
                value={state.targetWeightKg}
                onChange={(e) => set('targetWeightKg', e.target.value)}
                min={30}
                max={300}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('profile.goal')} htmlFor="goal" required>
              <Select id="goal" value={state.goal} onChange={(e) => set('goal', e.target.value as Goal)}>
                {GOALS.map((goal) => (
                  <option key={goal} value={goal}>
                    {t(`goals.${goal}`)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('profile.activity')} htmlFor="activity" required>
              <Select
                id="activity"
                value={state.activityLevel}
                onChange={(e) => set('activityLevel', e.target.value as ActivityLevel)}
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {t(`activity.${level}`)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">{t('profile.diet')}</p>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAGS.map((tag) => (
                <Chip
                  key={tag}
                  label={t(`diet.${tag}`)}
                  active={state.dietaryTags.includes(tag)}
                  onClick={() =>
                    set(
                      'dietaryTags',
                      state.dietaryTags.includes(tag)
                        ? state.dietaryTags.filter((v) => v !== tag)
                        : [...state.dietaryTags, tag],
                    )
                  }
                />
              ))}
            </div>
          </div>

          <div className="mt-1 flex justify-end">
            <Button onClick={submit} loading={pending} icon={<RefreshCcw className="size-4" />}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader title={t('metrics.target')} description={t('metrics.perDay')} />
          <p className="text-[32px] font-semibold leading-none tracking-tight tabular-nums">
            {nutrition.targetCalories}
            <span className="ml-2 text-base font-normal text-muted">{t('metrics.kcal')}</span>
          </p>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">{t('metrics.bmr')}</dt>
              <dd className="tabular-nums">{nutrition.bmr}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t('metrics.tdee')}</dt>
              <dd className="tabular-nums">{nutrition.tdee}</dd>
            </div>
          </dl>
          {nutrition.calorieFloorApplied ? (
            <p className="mt-3 rounded-xl bg-accent-container px-3.5 py-2.5 text-sm text-on-accent-container">
              {t('metrics.floorApplied')}
            </p>
          ) : null}
        </Card>

        <Card>
          <CardHeader title="БЖУ" />
          <MacroBars
            target={nutrition.macros}
            labels={{
              protein: t('metrics.protein'),
              fat: t('metrics.fat'),
              carbs: t('metrics.carbs'),
            }}
          />
          <p className="mt-4 text-sm text-muted">
            {nutrition.macros.proteinPct}% / {nutrition.macros.fatPct}% / {nutrition.macros.carbsPct}%
            от калорийности
          </p>
        </Card>

        <Card>
          <CardHeader title={t('metrics.bmi')} description={t(`bmi.${nutrition.bmiCategory}`)} />
          <BmiScale bmi={nutrition.bmi} />
          <p className="mt-3 text-sm text-muted">
            {t('metrics.healthyRange', {
              min: nutrition.healthyWeightRange.minKg,
              max: nutrition.healthyWeightRange.maxKg,
            })}
          </p>
        </Card>
      </div>
    </div>
  )
}
