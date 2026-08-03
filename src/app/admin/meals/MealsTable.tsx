'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { deleteMeal, saveMeal, togglePublished } from '@/app/actions/admin'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'

type MealRow = {
  id: string
  name: string
  nameEn: string | null
  description: string | null
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
  calories: number
  proteinG: number
  fatG: number
  carbsG: number
  prepTimeMinutes: number
  tags: string[]
  isPublished: boolean
  photoUrl: string | null
  ingredients: { ingredientId: string; name: string; grams: number }[]
}

type IngredientOption = { id: string; name: string; kcalPer100g: number }

const TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const

export function MealsTable({
  meals,
  allIngredients,
}: {
  meals: MealRow[]
  allIngredients: IngredientOption[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const toast = useToast()
  const [editing, setEditing] = useState<MealRow | 'new' | null>(null)
  const [filter, setFilter] = useState('')

  const visible = meals.filter((m) =>
    filter ? m.name.toLowerCase().includes(filter.toLowerCase()) : true,
  )

  async function onDelete(meal: MealRow) {
    if (!confirm(t('admin.confirmDelete'))) return
    const result = await deleteMeal(meal.id)
    if (!result.ok) {
      toast('error', t('common.error'))
      return
    }
    toast(
      'info',
      result.unpublishedInstead
        ? 'Блюдо используется в меню — снято с публикации вместо удаления'
        : 'Блюдо удалено',
    )
    router.refresh()
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Поиск по названию"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
        />
        <Button
          size="sm"
          className="ml-auto"
          onClick={() => setEditing('new')}
          icon={<Plus className="size-4" />}
        >
          {t('admin.newMeal')}
        </Button>
      </div>

      <Card className="overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-line bg-surface-low text-left text-muted">
              <tr>
                <th className="px-5 py-2.5 font-medium">Название</th>
                <th className="px-5 py-2.5 font-medium">Тип</th>
                <th className="px-5 py-2.5 font-medium">Ккал</th>
                <th className="px-5 py-2.5 font-medium">Б / Ж / У</th>
                <th className="px-5 py-2.5 font-medium">Теги</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {visible.map((meal) => (
                <tr key={meal.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-2.5">
                    <span className={meal.isPublished ? '' : 'text-muted line-through'}>
                      {meal.name}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-muted">{t(`meals.${meal.type}`)}</td>
                  <td className="px-5 py-2.5 tabular-nums">{meal.calories}</td>
                  <td className="px-5 py-2.5 tabular-nums text-muted">
                    {Math.round(meal.proteinG)} / {Math.round(meal.fatG)} / {Math.round(meal.carbsG)}
                  </td>
                  <td className="max-w-[220px] truncate px-5 py-2.5 text-xs text-muted">
                    {meal.tags.join(', ') || '—'}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="text"
                        size="sm"
                        className="!px-2"
                        aria-label={meal.isPublished ? 'Снять с публикации' : 'Опубликовать'}
                        onClick={async () => {
                          await togglePublished(meal.id, !meal.isPublished)
                          router.refresh()
                        }}
                      >
                        {meal.isPublished ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </Button>
                      <Button
                        variant="text"
                        size="sm"
                        className="!px-2"
                        aria-label={t('admin.edit')}
                        onClick={() => setEditing(meal)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="text"
                        size="sm"
                        className="!px-2 text-danger"
                        aria-label={t('admin.delete')}
                        onClick={() => onDelete(meal)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editing ? (
        <MealDialog
          meal={editing === 'new' ? null : editing}
          allIngredients={allIngredients}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            router.refresh()
          }}
        />
      ) : null}
    </>
  )
}

function MealDialog({
  meal,
  allIngredients,
  onClose,
  onSaved,
}: {
  meal: MealRow | null
  allIngredients: IngredientOption[]
  onClose: () => void
  onSaved: () => void
}) {
  const t = useTranslations()
  const toast = useToast()
  const [pending, setPending] = useState(false)
  const [rows, setRows] = useState<{ ingredientId: string; grams: string }[]>(
    meal?.ingredients.map((i) => ({ ingredientId: i.ingredientId, grams: String(i.grams) })) ?? [
      { ingredientId: allIngredients[0]?.id ?? '', grams: '100' },
    ],
  )

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)

    const form = new FormData(event.currentTarget)
    const result = await saveMeal({
      id: meal?.id,
      name: String(form.get('name') ?? ''),
      nameEn: String(form.get('nameEn') ?? ''),
      description: String(form.get('description') ?? ''),
      type: String(form.get('type') ?? 'LUNCH'),
      prepTimeMinutes: String(form.get('prepTimeMinutes') ?? '15'),
      tags: String(form.get('tags') ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      isPublished: form.get('isPublished') === 'on',
      ingredients: rows
        .filter((r) => r.ingredientId && Number(r.grams) > 0)
        .map((r) => ({ ingredientId: r.ingredientId, grams: Number(r.grams) })),
    })

    setPending(false)
    if (!result.ok) {
      toast('error', result.error ?? t('common.error'))
      return
    }
    toast('success', 'Сохранено')
    onSaved()
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={meal ? t('admin.edit') : t('admin.newMeal')}
      className="max-w-2xl"
    >
      <form onSubmit={onSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Название" htmlFor="name" required>
            <Input id="name" name="name" defaultValue={meal?.name} required minLength={2} />
          </Field>
          <Field label="Название (EN)" htmlFor="nameEn">
            <Input id="nameEn" name="nameEn" defaultValue={meal?.nameEn ?? ''} />
          </Field>
        </div>

        <Field label="Описание" htmlFor="description">
          <Textarea id="description" name="description" defaultValue={meal?.description ?? ''} maxLength={500} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Приём пищи" htmlFor="type" required>
            <Select id="type" name="type" defaultValue={meal?.type ?? 'LUNCH'}>
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`meals.${type}`)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Время, мин" htmlFor="prepTimeMinutes" required>
            <Input
              id="prepTimeMinutes"
              name="prepTimeMinutes"
              type="number"
              defaultValue={meal?.prepTimeMinutes ?? 20}
              min={1}
              max={600}
              required
            />
          </Field>
          <Field label="Теги" htmlFor="tags" hint="Через запятую">
            <Input id="tags" name="tags" defaultValue={meal?.tags.join(', ')} />
          </Field>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Ингредиенты</p>
            <Button
              type="button"
              variant="text"
              size="sm"
              onClick={() =>
                setRows((prev) => [...prev, { ingredientId: allIngredients[0]?.id ?? '', grams: '100' }])
              }
            >
              Добавить
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {rows.map((row, index) => (
              <div key={index} className="flex gap-2">
                <Select
                  value={row.ingredientId}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((r, i) => (i === index ? { ...r, ingredientId: e.target.value } : r)),
                    )
                  }
                  className="flex-1"
                >
                  {allIngredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} · {ing.kcalPer100g} ккал/100г
                    </option>
                  ))}
                </Select>
                <Input
                  type="number"
                  value={row.grams}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((r, i) => (i === index ? { ...r, grams: e.target.value } : r)),
                    )
                  }
                  className="w-24"
                  min={1}
                  max={2000}
                  aria-label="Граммы"
                />
                <Button
                  type="button"
                  variant="text"
                  size="sm"
                  className="!px-2 text-danger"
                  aria-label="Убрать"
                  onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={meal?.isPublished ?? true}
            className="size-4 accent-[var(--color-accent)]"
          />
          {t('admin.published')}
        </label>

        <div className="sticky bottom-0 flex justify-end gap-2 bg-surface-high pt-2">
          <Button type="button" variant="text" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={pending}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
