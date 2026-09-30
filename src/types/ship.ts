export interface Ship {
  id: string
  name: string
  latitude: number
  longitude: number
}

export type ShipInput = Omit<Ship, 'id'>

