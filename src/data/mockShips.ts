import type { Ship } from '../types/ship'

// Posições fictícias no mar, próximas a Recife, Salvador e Santos.
export const mockShips: readonly Ship[] = [
  { stateCode: 0, id: 'mock-atlantico', name: 'Atlântico', latitude: -8.23, longitude: -34.6 },
  { stateCode: 0, id: 'mock-aurora', name: 'Aurora', latitude: -13.08, longitude: -38.34 },
  { stateCode: 0, id: 'mock-horizonte', name: 'Horizonte', latitude: -24.15, longitude: -45.95 },
]

