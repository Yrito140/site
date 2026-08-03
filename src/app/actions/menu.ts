'use server'

import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { findAlternatives } from '@/lib/menu/generator'

/** Альтернативы для замены блюда в конкретной записи меню. */
export async function getMealAlternatives(entryId: string) {
  const user = await requireUser()

  const entry = await prisma.menuEntry.findUnique({
    where: { id: entryId },
    include: {
      menu: { select: { userId: true } },
      meal: {
        select: { id: true, type: true, calories: true, proteinG: true, fatG: true, carbsG: true, tags: true },
      },
    },
  })

  if (!entry || entry.menu.userId !== user.id) {
    return { ok: false as const, error: 'FORBIDDEN' }
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { dietaryTags: true },
  })

  const candidates = await prisma.meal.findMany({
    where: { isPublished: true, type: entry.meal.type },
    select: {
      id: true,
      name: true,
      nameEn: true,
      type: true,
      calories: true,
      proteinG: true,
      fatG: true,
      carbsG: true,
      tags: true,
      prepTimeMinutes: true,
      photoUrl: true,
    },
  })

  const alternatives = findAlternatives({
    current: entry.meal,
    currentScale: entry.scale,
    meals: candidates,
    dietaryTags: profile?.dietaryTags ?? [],
  })

  // Возвращаем полные карточки: клиент рисует их без второго запроса.
  const byId = new Map(candidates.map((m) => [m.id, m]))
  return {
    ok: true as const,
    alternatives: alternatives.map(({ meal, scale }) => ({
      ...byId.get(meal.id)!,
      scale,
    })),
  }
}
