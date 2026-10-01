import { expect, test } from '@playwright/test'
import type { IOperationResult } from '@microsoft/power-apps/data'
import type { Ale_navioses } from '../src/generated/models/Ale_naviosesModel'
import { createDataverseShipService, type DataverseShipClient } from '../src/services/dataverseShipService'
import { hasValidPosition } from '../src/types/ship'

function record(overrides: Partial<Ale_navioses> = {}): Ale_navioses {
  return { ale_naviosid: 'persisted-id', ale_nomedonavio: 'Navio real', ale_latitude: '-13,5', ale_longitude: '-38.2', statecode: 0, ownerid: 'owner-id', ...overrides }
}
function ok<T>(data: T, skipToken?: string): IOperationResult<T> { return { success: true, data, skipToken } }
function failed<T>(): IOperationResult<T> { return { success: false, data: undefined as T, error: new Error('Forbidden') } }
function client(): DataverseShipClient {
  return {
    get: async id => ok(record({ ale_naviosid: id })),
    getAll: async () => ok([record()]),
    create: async input => ok(record({ ...input, ale_naviosid: 'server-created-id' })),
    update: async (id, input) => ok(record({ ...input, ale_naviosid: id })),
    remove: async () => ok(undefined),
  }
}

test('Dataverse: carrega todas as páginas, preserva IDs e converte coordenadas de texto', async () => {
  const api = client()
  const tokens: (string | undefined)[] = []
  api.getAll = async options => {
    tokens.push(options?.skipToken)
    expect(options?.select).toEqual(['ale_naviosid', 'ale_nomedonavio', 'ale_latitude', 'ale_longitude', 'statecode'])
    return options?.skipToken ? ok([record({ ale_naviosid: 'second-id', ale_latitude: '0', ale_longitude: '0' })]) : ok([record()], 'page-2')
  }
  const ships = await createDataverseShipService(api).list()
  expect(tokens).toEqual([undefined, 'page-2'])
  expect(ships).toEqual([
    { stateCode: 0, id: 'persisted-id', name: 'Navio real', latitude: -13.5, longitude: -38.2 },
    { stateCode: 0, id: 'second-id', name: 'Navio real', latitude: 0, longitude: 0 },
  ])
})

test('Dataverse: coordenadas vazias, inválidas ou fora do intervalo não viram posições falsas', async () => {
  const api = client()
  api.getAll = async () => ok([
    record({ ale_latitude: undefined, ale_longitude: undefined }),
    record({ ale_naviosid: 'invalid-id', ale_latitude: '91', ale_longitude: 'abc' }),
    record({ ale_naviosid: 'limits-id', ale_latitude: '-90', ale_longitude: '180' }),
    record({ ale_naviosid: 'blank-id', ale_latitude: ' ', ale_longitude: '' }),
  ])
  const ships = await createDataverseShipService(api).list()
  expect(ships).toHaveLength(4)
  expect(ships.map(hasValidPosition)).toEqual([false, false, true, false])
  expect(ships[0].latitude).toBeNull()
  expect(ships[1].longitude).toBeNull()
})

test('Dataverse: cadastro e edição validam os campos, mantêm o ID e preservam colunas não editadas', async () => {
  const api = client()
  const creates: unknown[] = []
  const updates: unknown[] = []
  api.create = async input => { creates.push(input); return ok(record({ ...input, ale_naviosid: 'server-created-id' })) }
  // Um PATCH bem-sucedido também pode voltar sem conteúdo.
  api.update = async (id, input) => { updates.push({ id, input }); return ok(undefined as unknown as Ale_navioses) }
  const service = createDataverseShipService(api)
  const input = { name: '  Novo navio  ', latitude: -13.5, longitude: 0 }
  const ship = await service.create(input)
  expect(ship.id).toBe('server-created-id')
  expect(creates).toEqual([{ ale_nomedonavio: 'Novo navio', ale_latitude: '-13.5', ale_longitude: '0', statecode: 0 }])
  const updated = await service.update(ship.id, { ...input, name: 'Atualizado' })
  expect(updated.id).toBe(ship.id)
  expect(updates).toEqual([{ id: ship.id, input: { ale_nomedonavio: 'Atualizado', ale_latitude: '-13.5', ale_longitude: '0' } }])
  await expect(service.create({ ...input, latitude: 91 })).rejects.toThrow()
  await expect(service.update(ship.id, { ...input, longitude: NaN })).rejects.toThrow()
  expect(creates).toHaveLength(1)
  expect(updates).toHaveLength(1)
})

test('Dataverse: falhas de leitura, cadastro, edição e exclusão são exibidas como erro', async () => {
  const api = client()
  api.getAll = async () => failed()
  api.create = async () => failed()
  api.update = async () => failed()
  api.remove = async () => failed()
  const service = createDataverseShipService(api)
  const input = { name: 'Teste', latitude: 0, longitude: 0 }
  await expect(service.list()).rejects.toThrow('carregar os navios')
  await expect(service.create(input)).rejects.toThrow('cadastrar o navio')
  await expect(service.update('id', input)).rejects.toThrow('atualizar o navio')
  await expect(service.remove('id')).rejects.toThrow('excluir o navio')
})

test('Dataverse: compartilha consultas concorrentes e recarrega após sucesso ou falha', async () => {
  const api = client()
  let calls = 0
  api.getAll = async () => { calls++; return ok([record()]) }
  const service = createDataverseShipService(api)
  const [first, second] = await Promise.all([service.list(), service.list()])
  expect(calls).toBe(1)
  first[0].name = 'Mudança externa'
  expect(second[0].name).toBe('Navio real')
  await service.list()
  expect(calls).toBe(2)
  api.getAll = async () => failed()
  await expect(service.list()).rejects.toThrow()
  api.getAll = async () => ok([])
  expect(await service.list()).toEqual([])
})

test('Dataverse: exclusão usa o ID persistido e só termina depois da confirmação do servidor', async () => {
  const api = client()
  const removed: string[] = []
  api.remove = async id => { removed.push(id); return ok(undefined) }
  await createDataverseShipService(api).remove('server-created-id')
  expect(removed).toEqual(['server-created-id'])
})

test('Dataverse: paginação repetida e cadastro sem ID retornado não são aceitos silenciosamente', async () => {
  const api = client()
  api.getAll = async () => ok([record()], 'repeated')
  const service = createDataverseShipService(api)
  await expect(service.list()).rejects.toThrow('concluir o carregamento')
  api.create = async () => ok(undefined as unknown as Ale_navioses)
  await expect(service.create({ name: 'Teste', latitude: 0, longitude: 0 })).rejects.toThrow('Atualize a lista antes de tentar novamente')
})

test('Dataverse: ativação altera somente statecode e edição de inativo preserva seu estado', async () => {
  const api = client()
  let persisted = record({ statecode: 1, statuscode: 2, ale_mmsi: 'preservado' })
  const patches: unknown[] = []
  api.update = async (id, fields) => {
    patches.push(fields)
    persisted = { ...persisted, ...fields, ale_naviosid: id }
    return ok(undefined as unknown as Ale_navioses)
  }
  api.get = async () => ok(persisted)
  api.getAll = async () => ok([persisted])
  const service = createDataverseShipService(api)
  expect((await service.list())[0].stateCode).toBe(1)
  const edited = await service.update('persisted-id', { name: 'Revisado inativo', latitude: 0, longitude: 0 })
  expect(edited.stateCode).toBe(1)
  expect(edited.name).toBe('Revisado inativo')
  expect(await service.setState('persisted-id', 0)).toMatchObject({ stateCode: 0, name: 'Revisado inativo' })
  expect(patches[1]).toEqual({ statecode: 0 })
  expect(persisted.ale_mmsi).toBe('preservado')
  expect(persisted.statuscode).toBe(2)
  expect(await service.setState('persisted-id', 1)).toMatchObject({ stateCode: 1 })
  expect(patches[2]).toEqual({ statecode: 1 })
  api.update = async () => failed()
  await expect(service.setState('persisted-id', 0)).rejects.toThrow('ativar o navio')
  await expect(service.setState('persisted-id', 1)).rejects.toThrow('desativar o navio')
})