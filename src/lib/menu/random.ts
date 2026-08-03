/**
 * Детерминированный ПСЧ. Меню недели должно быть стабильным: перезагрузка
 * страницы не меняет рацион, а кнопка «обновить» меняет семя.
 */
export function createRng(seed: string): () => number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }

  let state = h >>> 0
  return () => {
    state += 0x6d2b79f5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Взвешенный выбор: чем меньше вес, тем выше шанс (вес = штраф). */
export function pickWeighted<T>(items: { item: T; penalty: number }[], rng: () => number): T {
  const weights = items.map(({ penalty }) => 1 / (1 + penalty))
  const total = weights.reduce((sum, w) => sum + w, 0)
  let threshold = rng() * total

  for (let i = 0; i < items.length; i += 1) {
    threshold -= weights[i]
    if (threshold <= 0) return items[i].item
  }
  return items[items.length - 1].item
}
