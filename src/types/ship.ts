export interface Ship {
  stateCode: 0 | 1
  id: string
  name: string
  latitude: number | null
  longitude: number | null
}

export interface ShipInput {
  name: string
  latitude: number
  longitude: number
}

export type PositionedShip = Ship & { latitude: number; longitude: number }

export function hasValidPosition(ship: Ship): ship is PositionedShip {
  return ship.latitude !== null && ship.longitude !== null &&
    Number.isFinite(ship.latitude) && Math.abs(ship.latitude) <= 90 &&
    Number.isFinite(ship.longitude) && Math.abs(ship.longitude) <= 180
}
