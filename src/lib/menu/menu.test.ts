import { describe, expect, it } from 'vitest'
import { SLOT_ORDER, SLOT_SHARES, findAlternatives, generateWeeklyMenu, matchesDiet } from './generator'
import { createRng } from './random'
import { NotEnoughMealsError } from './types'
import type { MealCandidate, MealType } from './types'

function makeMeals(): MealCandidate[] {
  const meals: MealCandidate[] = []
  const perType = 12
  for (const type of SLOT_ORDER) {
    for (let i = 0; i < perType; i += 1) {
      const base = type === 'SNACK' ? 150 : 380
      const calories = base + i * 25
      meals.push({
        id: `${type}-${i}`,
        type,
        calories,
        proteinG: Math.round(calories * 0.08),
        fatG: Math.round(calories * 0.03),
        carbsG: Math.round(calories * 0.1),
        // Каждое третье — вегетарианское, каждое шестое — ещё и безглютеновое.
        tags: [...(i % 3 === 0 ? ['vegetarian'] : []), ...(i % 6 === 0 ? ['gluten-free'] : [])],
      })
    }
  }
  return meals
}

const baseParams = {
  targetCalories: 2000,
  targetProteinG: 140,
  dietaryTags: [] as string[],
  meals: makeMeals(),
  seed: 'user-1:2026-W31',
}

describe('createRng', () => {
  it('одно семя даёт одинаковую последовательность', () => {
    const a = createRng('seed')
    const b = createRng('seed')
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('разные семена расходятся', () => {
    expect(createRng('a')()).not.toBe(createRng('b')())
  })

  it('значения лежат в [0,1)', () => {
    const rng = createRng('range')
    for (let i = 0; i < 200; i += 1) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('SLOT_SHARES', () => {
  it('доли приёмов пищи дают 100% суток', () => {
    const sum = Object.values(SLOT_SHARES).reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(1, 5)
  })
})

describe('matchesDiet', () => {
  const meal: MealCandidate = {
    id: 'm',
    type: 'LUNCH',
    calories: 400,
    proteinG: 30,
    fatG: 12,
    carbsG: 40,
    tags: ['vegetarian', 'gluten-free'],
  }

  it('пропускает блюдо, покрывающее все ограничения', () => {
    expect(matchesDiet(meal, ['vegetarian'])).toBe(true)
    expect(matchesDiet(meal, ['vegetarian', 'gluten-free'])).toBe(true)
  })

  it('отсекает блюдо без нужного тега', () => {
    expect(matchesDiet(meal, ['vegan'])).toBe(false)
  })

  it('без ограничений подходит любое', () => {
    expect(matchesDiet({ ...meal, tags: [] }, [])).toBe(true)
  })
})

describe('generateWeeklyMenu', () => {
  it('заполняет 7 дней × 4 приёма пищи', () => {
    const entries = generateWeeklyMenu(baseParams)
    expect(entries).toHaveLength(28)
    for (let day = 0; day < 7; day += 1) {
      const slots = entries.filter((e) => e.dayOfWeek === day).map((e) => e.mealType)
      expect(new Set(slots)).toEqual(new Set(SLOT_ORDER))
    }
  })

  it('детерминирован по семени', () => {
    expect(generateWeeklyMenu(baseParams)).toEqual(generateWeeklyMenu(baseParams))
  })

  it('меняет рацион при смене семени', () => {
    const a = generateWeeklyMenu(baseParams)
    const b = generateWeeklyMenu({ ...baseParams, seed: 'user-1:2026-W32' })
    const differing = a.filter((entry, i) => entry.mealId !== b[i].mealId)
    expect(differing.length).toBeGreaterThan(5)
  })

  it('держит суточную калорийность в пределах ±15% от цели', () => {
    const byId = new Map(baseParams.meals.map((m) => [m.id, m]))
    const entries = generateWeeklyMenu(baseParams)

    for (let day = 0; day < 7; day += 1) {
      const total = entries
        .filter((e) => e.dayOfWeek === day)
        .reduce((sum, e) => sum + (byId.get(e.mealId)?.calories ?? 0) * e.scale, 0)
      expect(total).toBeGreaterThan(baseParams.targetCalories * 0.85)
      expect(total).toBeLessThan(baseParams.targetCalories * 1.15)
    }
  })

  it('соблюдает ограничения питания', () => {
    const byId = new Map(baseParams.meals.map((m) => [m.id, m]))
    const entries = generateWeeklyMenu({ ...baseParams, dietaryTags: ['vegetarian'] })
    for (const entry of entries) {
      expect(byId.get(entry.mealId)?.tags).toContain('vegetarian')
    }
  })

  it('не ставит одно блюдо чаще 3 раз в неделю при достаточном выборе', () => {
    const counts = new Map<string, number>()
    for (const entry of generateWeeklyMenu(baseParams)) {
      counts.set(entry.mealId, (counts.get(entry.mealId) ?? 0) + 1)
    }
    expect(Math.max(...counts.values())).toBeLessThanOrEqual(3)
  })

  it('держит масштаб порции в разумных границах', () => {
    for (const entry of generateWeeklyMenu(baseParams)) {
      expect(entry.scale).toBeGreaterThanOrEqual(0.7)
      expect(entry.scale).toBeLessThanOrEqual(1.5)
    }
  })

  it('падает понятной ошибкой, если под ограничения нет блюд', () => {
    expect(() => generateWeeklyMenu({ ...baseParams, dietaryTags: ['unicorn-free'] })).toThrow(
      NotEnoughMealsError,
    )
  })

  it('работает на коротком периоде', () => {
    expect(generateWeeklyMenu({ ...baseParams, days: 1 })).toHaveLength(4)
  })
})

describe('findAlternatives', () => {
  const meals = makeMeals()
  const current = meals.find((m) => m.type === 'LUNCH') as MealCandidate

  it('предлагает блюда того же слота без текущего', () => {
    const alts = findAlternatives({ current, currentScale: 1, meals, dietaryTags: [] })
    expect(alts.length).toBeGreaterThan(0)
    for (const { meal } of alts) {
      expect(meal.type).toBe<MealType>('LUNCH')
      expect(meal.id).not.toBe(current.id)
    }
  })

  it('держится в калорийной группе ±25%', () => {
    const alts = findAlternatives({ current, currentScale: 1, meals, dietaryTags: [] })
    for (const { meal } of alts) {
      expect(Math.abs(meal.calories - current.calories) / current.calories).toBeLessThanOrEqual(0.25)
    }
  })

  it('учитывает ограничения питания', () => {
    const alts = findAlternatives({
      current,
      currentScale: 1,
      meals,
      dietaryTags: ['vegetarian'],
    })
    for (const { meal } of alts) {
      expect(meal.tags).toContain('vegetarian')
    }
  })

  it('возвращает пустой список, когда замены нет', () => {
    const alts = findAlternatives({
      current,
      currentScale: 1,
      meals: [current],
      dietaryTags: [],
    })
    expect(alts).toEqual([])
  })
})
