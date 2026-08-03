/**
 * Готовит фото и рецепты к деплою: раскладывает картинки в public/meals
 * и генерирует prisma/seed-assets.ts, который использует seed.
 *
 * Зачем: public/uploads в .gitignore и на Vercel не появится, а имена там
 * зависели от Meal.id — при новом seed id другие, ссылки бьются. Здесь имя
 * файла считается от названия блюда, поэтому переживает любой пересев.
 *
 * Запуск (локально, после правок recipes.md или фото):
 *   npx tsx scripts/build-seed-assets.ts
 */

import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const RECIPES_MD = path.resolve('photos/recipes.md')
const MANIFEST = path.resolve('photos/manifest.csv')
const PHOTOS_DIR = path.resolve('photos')
const TARGET_DIR = path.resolve('public/meals')
const OUT_FILE = path.resolve('prisma/seed-assets.ts')
const PUBLIC_PREFIX = '/meals'

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

function slugify(text: string) {
  const out = [...text.toLowerCase()].map((ch) => TRANSLIT[ch] ?? ch).join('')
  return out.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
}

type Recipe = { ingredients: string | null; steps: string[] }

/** Разбор recipes.md: заголовок, состав строкой, нумерованные шаги. */
function parseRecipes(markdown: string): Map<string, Recipe> {
  const map = new Map<string, Recipe>()
  for (const chunk of markdown.split(/^### /m).slice(1)) {
    const head = chunk.match(/^\d+\.\s*(.+?)\s*$/m)
    if (!head) continue
    const name = head[1].trim()

    const ing = chunk.match(/\*\*Ингредиенты:\*\*\s*(.+?)\s*$/m)
    const steps: string[] = []
    const inline = chunk.match(/\*\*Приготовление:\*\*[ \t]+(\S.+?)\s*$/m)
    if (inline) {
      steps.push(inline[1].trim())
    } else {
      const body = chunk.split(/\*\*Приготовление:\*\*/)[1] ?? ''
      for (const line of body.split(/\r?\n/)) {
        const m = line.match(/^\s*\d+\.\s+(.+?)\s*$/)
        if (m) steps.push(m[1].trim())
        else if (/^\s*(---|##)/.test(line)) break
      }
    }
    map.set(name, { ingredients: ing ? ing[1].trim() : null, steps })
  }
  return map
}

/** Первое фото каждого блюда из manifest.csv (разделитель ';'). */
function parseManifest(csv: string): Map<string, string> {
  const first = new Map<string, string>()
  for (const line of csv.replace(/^﻿/, '').split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue
    const cells = line.split(';')
    if (cells.length < 4) continue
    const name = cells[2].trim()
    if (!first.has(name)) first.set(name, cells[3].trim())
  }
  return first
}

async function main() {
  const recipes = parseRecipes(await readFile(RECIPES_MD, 'utf8'))
  const photos = parseManifest(await readFile(MANIFEST, 'utf8'))
  const available = new Set(await readdir(PHOTOS_DIR))

  await mkdir(TARGET_DIR, { recursive: true })

  const names = [...new Set([...recipes.keys(), ...photos.keys()])].sort()
  const rows: string[] = []
  let copied = 0
  const noPhoto: string[] = []

  for (const name of names) {
    const slug = slugify(name)
    const source = photos.get(name)
    let photoUrl: string | null = null

    if (source && available.has(source)) {
      const target = `${slug}${path.extname(source)}`
      await copyFile(path.join(PHOTOS_DIR, source), path.join(TARGET_DIR, target))
      photoUrl = `${PUBLIC_PREFIX}/${target}`
      copied += 1
    } else {
      noPhoto.push(name)
    }

    const r = recipes.get(name)
    const j = JSON.stringify
    rows.push(
      `  ${j(name)}: {\n` +
        `    photoUrl: ${photoUrl ? j(photoUrl) : 'null'},\n` +
        `    recipeIngredients: ${r?.ingredients ? j(r.ingredients) : 'null'},\n` +
        `    recipeSteps: ${j(r?.steps ?? [])},\n` +
        `  },`,
    )
  }

  const file =
    '// Файл сгенерирован: npx tsx scripts/build-seed-assets.ts\n' +
    '// Правьте photos/recipes.md и manifest.csv, а не этот файл.\n\n' +
    'export interface MealAsset {\n' +
    '  photoUrl: string | null\n' +
    '  recipeIngredients: string | null\n' +
    '  recipeSteps: string[]\n' +
    '}\n\n' +
    'export const mealAssets: Record<string, MealAsset> = {\n' +
    rows.join('\n') +
    '\n}\n'

  await writeFile(OUT_FILE, file, 'utf8')

  console.log(`блюд в наборе : ${names.length}`)
  console.log(`фото скопировано: ${copied} -> public/meals`)
  console.log(`рецептов        : ${[...recipes.values()].filter((r) => r.steps.length).length}`)
  if (noPhoto.length) {
    console.log(`без фото        : ${noPhoto.length}`)
    for (const n of noPhoto) console.log(`    - ${n}`)
  }
  console.log(`записано        : ${path.relative(process.cwd(), OUT_FILE)}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
