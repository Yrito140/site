'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { completeOnboarding } from '@/app/actions/actions'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { Field, Input } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'
import { calculateNutrition } from '@/lib/nutrition'
import type { ActivityLevel, Goal, Sex } from '@/lib/nutrition'
import { DIETARY_TAGS } from '@/lib/validators/profile'

type Draft = {
  sex?: Sex
  age: string
  heightCm: string
  currentWeightKg: string
  targetWeightKg: string
  goal?: Goal
  activityLevel?: ActivityLevel
  dietaryTags: string[]
}

const GOALS: Goal[] = ['LOSE_WEIGHT', 'MAINTAIN', 'GAIN_MUSCLE']
const LEVELS: ActivityLevel[] = ['SEDENTARY', 'LIGHT', 'MODERATE', 'HIGH', 'VERY_HIGH']
const TOTAL_STEPS = 5

export function OnboardingWizard() {
  const t = useTranslations()
  const router = useRouter()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [pending, setPending] = useState(false)
  const [draft, setDraft] = useState<Draft>({
    age: '',
    heightCm: '',
    currentWeightKg: '',
    targetWeightKg: '',
    dietaryTags: [],
  })

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  const numbersReady =
    Number(draft.age) > 0 && Number(draft.heightCm) > 0 && Number(draft.currentWeightKg) > 0

  // Превью считается на клиенте — тот же чистый модуль, что и на сервере.
  const preview = useMemo(() => {
    if (!draft.sex || !draft.goal || !draft.activityLevel || !numbersReady) return null
    try {
      return calculateNutrition({
        sex: draft.sex,
        age: Number(draft.age),
        heightCm: Number(draft.heightCm),
        weightKg: Number(draft.currentWeightKg),
        activityLevel: draft.activityLevel,
        goal: draft.goal,
      })
    } catch {
      return null
    }
  }, [draft, numbersReady])

  const canAdvance = [
    Boolean(draft.sex),
    numbersReady,
    Boolean(draft.goal),
    Boolean(draft.activityLevel),
    true,
  ][step]

  async function submit() {
    setPending(true)
    const result = await completeOnboarding({
      sex: draft.sex,
      age: draft.age,
      heightCm: draft.heightCm,
      currentWeightKg: draft.currentWeightKg,
      targetWeightKg: draft.targetWeightKg || undefined,
      goal: draft.goal,
      activityLevel: draft.activityLevel,
      dietaryTags: draft.dietaryTags,
    })
    setPending(false)

    if (!result.ok) {
      toast('error', result.error ?? t('common.error'))
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="animate-rise">
      <p className="text-sm text-muted">{t('onboarding.step', { current: step + 1, total: TOTAL_STEPS })}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">{t('onboarding.title')}</h1>
      <p className="mt-1.5 text-sm text-muted">{t('onboarding.subtitle')}</p>

      <div className="mt-5 mb-6 flex gap-1.5" aria-hidden>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              i <= step ? 'bg-accent' : 'bg-line',
            )}
          />
        ))}
      </div>

      <Card>
        {step === 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">{t('profile.sex')}</p>
            <div className="grid grid-cols-2 gap-3">
              {(['FEMALE', 'MALE'] as Sex[]).map((sex) => (
                <button
                  key={sex}
                  type="button"
                  onClick={() => set('sex', sex)}
                  className={cn(
                    'rounded-xl border px-4 py-4 text-sm transition-colors',
                    draft.sex === sex
                      ? 'border-accent bg-accent-container text-on-accent-container'
                      : 'border-line hover:bg-surface-low',
                  )}
                >
                  {sex === 'FEMALE' ? t('profile.female') : t('profile.male')}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="flex flex-col gap-4">
            <Field label={t('profile.age')} htmlFor="age" required>
              <Input
                id="age"
                type="number"
                inputMode="numeric"
                value={draft.age}
                onChange={(e) => set('age', e.target.value)}
                min={14}
                max={100}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('profile.height')} htmlFor="height" required>
                <Input
                  id="height"
                  type="number"
                  inputMode="decimal"
                  value={draft.heightCm}
                  onChange={(e) => set('heightCm', e.target.value)}
                  min={120}
                  max={250}
                />
              </Field>
              <Field label={t('profile.weight')} htmlFor="weight" required>
                <Input
                  id="weight"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={draft.currentWeightKg}
                  onChange={(e) => set('currentWeightKg', e.target.value)}
                  min={30}
                  max={300}
                />
              </Field>
            </div>
            <Field label={t('profile.targetWeight')} htmlFor="target" hint="Необязательно">
              <Input
                id="target"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={draft.targetWeightKg}
                onChange={(e) => set('targetWeightKg', e.target.value)}
                min={30}
                max={300}
              />
            </Field>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">{t('profile.goal')}</p>
            {GOALS.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => set('goal', goal)}
                className={cn(
                  'rounded-xl border px-4 py-3.5 text-left text-sm transition-colors',
                  draft.goal === goal
                    ? 'border-accent bg-accent-container text-on-accent-container'
                    : 'border-line hover:bg-surface-low',
                )}
              >
                {t(`goals.${goal}`)}
              </button>
            ))}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">{t('profile.activity')}</p>
            {LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => set('activityLevel', level)}
                className={cn(
                  'rounded-xl border px-4 py-3 text-left transition-colors',
                  draft.activityLevel === level
                    ? 'border-accent bg-accent-container text-on-accent-container'
                    : 'border-line hover:bg-surface-low',
                )}
              >
                <span className="block text-sm">{t(`activity.${level}`)}</span>
                <span className="mt-0.5 block text-xs text-muted">{t(`activity.${level}_hint`)}</span>
              </button>
            ))}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium">{t('profile.diet')}</p>
              <p className="mt-1 text-sm text-muted">Влияет на подбор блюд. Можно пропустить.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAGS.map((tag) => (
                <Chip
                  key={tag}
                  label={t(`diet.${tag}`)}
                  active={draft.dietaryTags.includes(tag)}
                  onClick={() =>
                    set(
                      'dietaryTags',
                      draft.dietaryTags.includes(tag)
                        ? draft.dietaryTags.filter((v) => v !== tag)
                        : [...draft.dietaryTags, tag],
                    )
                  }
                />
              ))}
            </div>

            {preview ? (
              <div className="mt-1 rounded-xl bg-surface-low p-4">
                <p className="text-sm text-muted">{t('metrics.target')}</p>
                <p className="mt-0.5 text-2xl font-semibold tabular-nums">
                  {preview.targetCalories}{' '}
                  <span className="text-base font-normal text-muted">{t('metrics.kcal')}</span>
                </p>
                <p className="mt-2 text-sm text-muted">
                  Б {preview.macros.proteinG} г · Ж {preview.macros.fatG} г · У{' '}
                  {preview.macros.carbsG} г
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>

      <div className="mt-5 flex items-center justify-between gap-3">
        <Button
          variant="text"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || pending}
          icon={<ArrowLeft className="size-4" />}
        >
          {t('onboarding.back')}
        </Button>

        {step < TOTAL_STEPS - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance}>
            {t('onboarding.next')}
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={submit} loading={pending} icon={<Check className="size-4" />}>
            {t('onboarding.finish')}
          </Button>
        )}
      </div>
    </div>
  )
}
