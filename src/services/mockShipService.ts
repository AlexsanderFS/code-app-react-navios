import { mockShips } from '../data/mockShips'
import { normalizeShip } from '../domain/shipValidation'
import type { Ship } from '../types/ship'
import type { ShipService } from './shipService'

export function createMockShipService(seed: readonly Ship[] = mockShips): ShipService {
  let ships = seed.map(ship => ({ ...ship }))
  return {
    async list() { return ships.map(ship => ({ ...ship })) },
    async create(input) {
      const ship: Ship = { ...normalizeShip(input), stateCode: 0, id: crypto.randomUUID() }
      ships = [...ships, ship]
      return { ...ship }
    },
    async update(id, input) {
      if (!ships.some(ship => ship.id === id)) throw new Error('Este navio não foi encontrado. Atualize a lista.')
      const ship: Ship = { ...normalizeShip(input), id, stateCode: ships.find(ship => ship.id === id)!.stateCode }
      ships = ships.map(current => current.id === id ? ship : current)
      return { ...ship }
    },
    async setState(id, stateCode) {
      const current = ships.find(ship => ship.id === id)
      if (!current) throw new Error('Este navio não foi encontrado. Atualize a lista.')
      const ship = { ...current, stateCode }
      ships = ships.map(current => current.id === id ? ship : current)
      return { ...ship }
    },
    async remove(id) {
      if (!ships.some(ship => ship.id === id)) throw new Error('Este navio já foi excluído.')
      ships = ships.filter(ship => ship.id !== id)
    },
  }
}

