export type ClassValue = string | number | null | undefined | false | ClassValue[]

/** Минимальный аналог clsx — отдельная зависимость под это не нужна. */
export function cn(...values: ClassValue[]): string {
  const out: string[] = []
  const walk = (value: ClassValue) => {
    if (!value && value !== 0) return
    if (Array.isArray(value)) {
      value.forEach(walk)
      return
    }
    out.push(String(value))
  }
  values.forEach(walk)
  return out.join(' ')
}
