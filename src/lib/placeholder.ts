/**
 * Детерминированный оттенок для блюда без фото. Работает и на клиенте,
 * поэтому без node:crypto.
 */
export function mealHue(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) % 100000
  }
  // Держимся тёплой части круга: еда в синеве выглядит несъедобно.
  return 20 + (h % 120)
}
