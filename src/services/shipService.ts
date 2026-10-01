import type { Ship, ShipInput } from '../types/ship'

// Contrato compartilhado pelo adaptador Dataverse e pelos dados isolados de teste.
export interface ShipService {
  list(): Promise<Ship[]>
  create(input: ShipInput): Promise<Ship>
  update(id: string, input: ShipInput): Promise<Ship>
  setState(id: string, stateCode: Ship['stateCode']): Promise<Ship>
  remove(id: string): Promise<void>
}

