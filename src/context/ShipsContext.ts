import { createContext, useContext } from 'react'
import type { Ship, ShipInput } from '../types/ship'

interface ShipsState {
  ships: Ship[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  create: (input: ShipInput) => Promise<Ship>
  update: (id: string, input: ShipInput) => Promise<Ship>
  setState: (id: string, stateCode: Ship['stateCode']) => Promise<Ship>
  remove: (id: string) => Promise<void>
}

export const ShipsContext = createContext<ShipsState | null>(null)
export function useShips() {
  const context = useContext(ShipsContext)
  if (!context) throw new Error('useShips precisa de ShipsProvider.')
  return context
}

