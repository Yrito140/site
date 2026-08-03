/**
 * Раскладывает скачанные фото блюд в public/uploads и проставляет photoUrl.
 *
 * Связь «файл -> блюдо» берётся из photos/manifest.csv (колонки: №, приём
 * пищи, блюдо, файл, автор, страница). Название блюда в manifest совпадает
 * с Meal.name в базе — по нему и связываем, номер нужен только человеку.
 *
 * По умолчанию берётся первое фото каждого блюда (суффикс -1). Другой
 * вариант можно закрепить в PICK — например { 'Винегрет': 2 }.
 *
 * Запуск:  npx tsx scripts/apply-meal-photos.ts
 *          npx tsx scripts/apply-meal-photos.ts --dry   (только показать)
 */

import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PHOTOS_DIR = path.resolve('photos')
const MANIFEST = path.join(PHOTOS_DIR, 'manifest.csv')
const UPLOADS_DIR = path.resolve(process.env.STORAGE_LOCAL_DIR ?? './public/uploads')
const PUBLIC_PREFIX = process.env.STORAGE_PUBLIC_PREFIX ?? '/uploads'

/** Блюда, где лучше смотрится не первое фото. Ключ — имя как в базе. */
const PICK: Record<string, number> = {}

type Row = { num: string; name: string; file: string }

/** Разбор CSV с ';' и возможными кавычками. */
function parseCsv(text: string): Row[] {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim())
  const rows: Row[] = []

  for (const line of lines.slice(1)) {
    const cells: string[] = []
    let cur = ''
    let quoted = false
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i]
      if (ch === '"') {
        if (quoted && line[i + 1] === '"') {
          cur += '"'
          i += 1
        } else {
          quoted = !quoted
        }
      } else if (ch === ';' && !quoted) {
        cells.push(cur)
        cur = ''
      } else {
        cur += ch
      }
    }
    cells.push(cur)

    if (cells.length >= 4) {
      rows.push({ num: cells[0].trim(), name: cells[2].trim(), file: cells[3].trim() })
    }
  }
  return rows
}

async function main() {
  const dry = process.argv.includes('--dry')

  const rows = parseCsv(await readFile(MANIFEST, 'utf8'))
  const available = new Set(await readdir(PHOTOS_DIR))

  // Группируем файлы по блюду, сохраняя порядок из manifest.
  const byMeal = new Map<string, string[]>()
  for (const row of rows) {
    if (!available.has(row.file)) continue
    if (!byMeal.has(row.name)) byMeal.set(row.name, [])
    byMeal.get(row.name)!.push(row.file)
  }

  const meals = await prisma.meal.findMany({ select: { id: true, name: true, photoUrl: true } })
  const mealByName = new Map(meals.map((m) => [m.name, m]))

  if (!dry) await mkdir(UPLOADS_DIR, { recursive: true })

  let updated = 0
  const missingInDb: string[] = []
  const withoutPhoto: string[] = []

  for (const meal of meals) {
    const files = byMeal.get(meal.name)
    if (!files || files.length === 0) {
      withoutPhoto.push(meal.name)
      continue
    }

    const index = Math.min((PICK[meal.name] ?? 1) - 1, files.length - 1)
    const source = files[index]

    // Имя в uploads — стабильный хеш от id блюда: повторный запуск
    // перезаписывает тот же файл, мусор не копится.
    const hash = createHash('sha1').update(meal.id).digest('hex').slice(0, 16)
    const target = `${hash}${path.extname(source)}`
    const url = `${PUBLIC_PREFIX}/${target}`

    if (dry) {
      console.log(`${meal.name}\n    ${source} -> ${url}`)
      updated += 1
      continue
    }

    await copyFile(path.join(PHOTOS_DIR, source), path.join(UPLOADS_DIR, target))
    await prisma.meal.update({ where: { id: meal.id }, data: { photoUrl: url } })
    updated += 1
  }

  for (const name of byMeal.keys()) {
    if (!mealByName.has(name)) missingInDb.push(name)
  }

  console.log(`\n${'='.repeat(52)}`)
  console.log(dry ? 'РЕЖИМ ПРОСМОТРА — ничего не записано' : 'Готово')
  console.log(`Блюд с фото       : ${updated} из ${meals.length}`)
  if (withoutPhoto.length) {
    console.log(`Без фото          : ${withoutPhoto.length}`)
    for (const n of withoutPhoto) console.log(`    - ${n}`)
  }
  if (missingInDb.length) {
    console.log(`В manifest, но не в базе: ${missingInDb.length}`)
    for (const n of missingInDb) console.log(`    - ${n}`)
  }
  if (!dry) {
    console.log(`Файлы             : ${UPLOADS_DIR}`)
    console.log(`URL-префикс       : ${PUBLIC_PREFIX}`)
  }
  console.log('='.repeat(52))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
