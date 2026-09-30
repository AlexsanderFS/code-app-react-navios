import type { ShipInput } from '../types/ship'

export type ShipErrors = Partial<Record<keyof ShipInput, string>>
export function validateShip(input: ShipInput): ShipErrors {
  const errors: ShipErrors = {}
  if (!input.name.trim()) errors.name = 'Informe o nome do navio.'
  else if (input.name.trim().length > 80) errors.name = 'Use no máximo 80 caracteres.'
  if (!Number.isFinite(input.latitude) || input.latitude < -90 || input.latitude > 90) errors.latitude = 'Informe uma latitude entre -90 e 90.'
  if (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180) errors.longitude = 'Informe uma longitude entre -180 e 180.'
  return errors
}

export function normalizeShip(input: ShipInput): ShipInput {
  const errors = validateShip(input)
  if (Object.keys(errors).length) throw new Error(Object.values(errors).join(' '))
  return { ...input, name: input.name.trim() }
}

export function parseCoordinate(value: string): number {
  const trimmed = value.trim()
  // Aceita ponto ou vírgula decimal, sem separadores de milhar.
  return /^[-+]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(trimmed) ? Number(trimmed.replace(',', '.')) : NaN
}

export function formatCoordinate(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 6 })
}

