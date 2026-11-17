export function numberValue(value: unknown): number | undefined {
  if (typeof value !== 'number' && (typeof value !== 'string' || value.trim() === '')) return
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}
