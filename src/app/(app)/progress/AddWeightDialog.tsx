'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'
import { upsertWeightLog } from '@/app/actions/actions'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'

export function AddWeightDialog({ defaultWeight }: { defaultWeight?: number }) {
  const t = useTranslations()
  const router = useRouter()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)

    const form = new FormData(event.currentTarget)
    const result = await upsertWeightLog({
      date: String(form.get('date') ?? today),
      weightKg: String(form.get('weightKg') ?? ''),
      bodyFatPct: String(form.get('bodyFatPct') ?? ''),
      waistCm: String(form.get('waistCm') ?? ''),
      notes: String(form.get('notes') ?? ''),
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
        {t('progress.addWeight')}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} title={t('progress.addWeight')}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Дата" htmlFor="date" required>
              <Input id="date" name="date" type="date" defaultValue={today} max={today} required />
            </Field>
            <Field label={t('profile.weight')} htmlFor="weightKg" required>
              <Input
                id="weightKg"
                name="weightKg"
                type="number"
                step="0.1"
                inputMode="decimal"
                defaultValue={defaultWeight}
                required
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('progress.bodyFat')} htmlFor="bodyFatPct" hint="Необязательно">
              <Input id="bodyFatPct" name="bodyFatPct" type="number" step="0.1" inputMode="decimal" />
            </Field>
            <Field label={t('progress.waist')} htmlFor="waistCm" hint="Необязательно">
              <Input id="waistCm" name="waistCm" type="number" step="0.5" inputMode="decimal" />
            </Field>
          </div>
          <Field label={t('progress.notes')} htmlFor="notes">
            <Textarea id="notes" name="notes" maxLength={500} />
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
