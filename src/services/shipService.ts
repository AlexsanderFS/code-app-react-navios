import type { Ship, ShipInput } from '../types/ship'

// O adaptador Dataverse futuro implementará este contrato usando os serviços gerados pelo Power Apps.
export interface ShipService {
  list(): Promise<Ship[]>
  create(input: ShipInput): Promise<Ship>
  update(id: string, input: ShipInput): Promise<Ship>
  remove(id: string): Promise<void>
}

