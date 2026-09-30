import { expect, test } from '@playwright/test'
import { createMockShipService } from '../src/services/mockShipService'
import { parseCoordinate, validateShip } from '../src/domain/shipValidation'

test('contrato do serviço: validação, isolamento dos dados e IDs estáveis no CRUD', async () => {
  const service = createMockShipService([])
  const latitude = parseCoordinate(' -13,123456 ')
  const ship = await service.create({ name: '  Navio de teste  ', latitude, longitude: -38.5 })
  expect(ship.id).toBeTruthy()
  expect(ship.name).toBe('Navio de teste')
  expect(ship.latitude).toBe(-13.123456)
  const list = await service.list()
  list[0].name = 'Alteração externa'
  expect((await service.list())[0].name).toBe('Navio de teste')
  const updated = await service.update(ship.id, { name: 'Revisado', latitude: 0, longitude: 0 })
  expect(updated.id).toBe(ship.id)
  expect((await service.list())[0]).toEqual(updated)
  await expect(service.create({ name: 'Inválido', latitude: 91, longitude: 0 })).rejects.toThrow()
  await expect(service.update(ship.id, { name: 'Inválido', latitude: 0, longitude: 181 })).rejects.toThrow()
  expect(validateShip({ name: ' ', latitude: NaN, longitude: Infinity })).toHaveProperty('name')
  expect(parseCoordinate('')).toBeNaN()
  expect(parseCoordinate('1,2,3')).toBeNaN()
  expect(validateShip({ name: 'Limites', latitude: -90, longitude: 180 })).toEqual({})
  await service.remove(ship.id)
  expect(await service.list()).toEqual([])
  await expect(service.update(ship.id, updated)).rejects.toThrow()
})
