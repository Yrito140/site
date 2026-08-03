/**
 * Импорт рецептов из recipes.md в поля Meal.recipeIngredients / recipeSteps.
 *
 * Формат исходника (два варианта, оба поддержаны):
 *
 *   ### 3. Сырники запечённые
 *   **Ингредиенты:** творог 200 г, яйцо 1 шт, ...
 *   **Приготовление:**
 *   1. Творог размять...
 *   2. ...
 *
 *   ### 57. Яблоко с миндалём
 *   **Приготовление:** яблоко вымыть, нарезать дольками...   <- одной строкой
 *
 * Связь с базой — по названию блюда (совпадает с Meal.name один в один).
 *
 * Запуск:  npx tsx scripts/import-recipes.ts
 *          npx tsx scripts/import-recipes.ts --dry
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const SOURCE = path.resolve('photos/recipes.md')

type Parsed = { num: number; name: string; ingredients: string | null; steps: string[] }

function parse(markdown: string): Parsed[] {
  const out: Parsed[] = []
  // Режем по заголовкам блюд, каждый кусок разбираем отдельно.
  const chunks = markdown.split(/^### /m).slice(1)

  for (const chunk of chunks) {
    const head = chunk.match(/^(\d+)\.\s*(.+?)\s*$/m)
    if (!head) continue
    const num = Number(head[1])
    const name = head[2].trim()

    const ingMatch = chunk.match(/\*\*Ингредиенты:\*\*\s*(.+?)\s*$/m)
    const ingredients = ingMatch ? ingMatch[1].trim() : null

    const steps: string[] = []
    // Вариант «одной строкой»: **Приготовление:** текст...
    const inline = chunk.match(/\*\*Приготовление:\*\*[ \t]+(\S.+?)\s*$/m)
    if (inline) {
      steps.push(inline[1].trim())
    } else {
      // Вариант со списком: **Приготовление:** \n 1. ... 2. ...
      const body = chunk.split(/\*\*Приготовление:\*\*/)[1] ?? ''
      for (const line of body.split(/\r?\n/)) {
        const m = line.match(/^\s*\d+\.\s+(.+?)\s*$/)
        if (m) steps.push(m[1].trim())
        else if (/^\s*---\s*$/.test(line) || /^\s*##/.test(line)) break
      }
    }

    out.push({ num, name, ingredients, steps })
  }
  return out
}

async function main() {
  const dry = process.argv.includes('--dry')
  const parsed = parse(await readFile(SOURCE, 'utf8'))

  const meals = await prisma.meal.findMany({ select: { id: true, name: true } })
  const byName = new Map(meals.map((m) => [m.name, m.id]))

  let updated = 0
  const notInDb: string[] = []
  const noSteps: string[] = []

  for (const r of parsed) {
    if (r.steps.length === 0) noSteps.push(`${r.num}. ${r.name}`)

    const id = byName.get(r.name)
    if (!id) {
      notInDb.push(`${r.num}. ${r.name}`)
      continue
    }
    if (dry) {
      updated += 1
      continue
    }
    await prisma.meal.update({
      where: { id },
      data: { recipeIngredients: r.ingredients, recipeSteps: r.steps },
    })
    updated += 1
  }

  const covered = new Set(parsed.map((r) => r.name))
  const missing = meals.filter((m) => !covered.has(m.name)).map((m) => m.name)

  console.log('='.repeat(54))
  console.log(dry ? 'РЕЖИМ ПРОСМОТРА — ничего не записано' : 'Импорт завершён')
  console.log(`Разобрано в recipes.md : ${parsed.length}`)
  console.log(`Обновлено блюд         : ${updated} из ${meals.length}`)
  if (noSteps.length) {
    console.log(`Без шагов (проверь)    : ${noSteps.length}`)
    for (const n of noSteps) console.log(`    - ${n}`)
  }
  if (notInDb.length) {
    console.log(`Нет такого блюда в БД  : ${notInDb.length}`)
    for (const n of notInDb) console.log(`    - ${n}`)
  }
  if (missing.length) {
    console.log(`Блюда без рецепта      : ${missing.length}`)
    for (const n of missing) console.log(`    - ${n}`)
  }
  console.log('='.repeat(54))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
