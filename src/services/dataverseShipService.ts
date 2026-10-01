import type { IOperationResult } from '@microsoft/power-apps/data'
import type { Ale_navioses, Ale_naviosesBase } from '../generated/models/Ale_naviosesModel'
import type { IGetAllOptions, IGetOptions } from '../generated/models/CommonModels'
import { normalizeShip, parseCoordinate } from '../domain/shipValidation'
import type { Ship, ShipInput } from '../types/ship'
import type { ShipService } from './shipService'

type ShipRecordInput = Omit<Ale_naviosesBase, 'ale_naviosid'>

export interface DataverseShipClient {
  get(id: string, options?: IGetOptions): Promise<IOperationResult<Ale_navioses>>
  getAll(options?: IGetAllOptions): Promise<IOperationResult<Ale_navioses[]>>
  create(input: ShipRecordInput): Promise<IOperationResult<Ale_navioses>>
  update(id: string, input: Partial<ShipRecordInput>): Promise<IOperationResult<Ale_navioses>>
  remove(id: string): Promise<IOperationResult<void>>
}

function ensureSuccess<T>(result: IOperationResult<T>, message: string): T {
  if (!result.success || result.error) throw new Error(message + ' Verifique sua conexão e as permissões de acesso à tabela Navios.')
  return result.data
}

function coordinate(value: string | undefined, limit: number): number | null {
  const parsed = parseCoordinate(value ?? '')
  return Number.isFinite(parsed) && Math.abs(parsed) <= limit ? parsed : null
}

function toShip(record: Ale_navioses): Ship {
  if (!record.ale_naviosid) throw new Error('O Dataverse retornou um navio sem identificador. Atualize a lista.')
  return {
    stateCode: record.statecode,
    id: record.ale_naviosid,
    name: record.ale_nomedonavio?.trim() || 'Navio sem nome',
    latitude: coordinate(record.ale_latitude, 90),
    longitude: coordinate(record.ale_longitude, 180),
  }
}

function toFields(input: ShipInput) {
  const normalized = normalizeShip(input)
  return {
    ale_nomedonavio: normalized.name,
    ale_latitude: String(normalized.latitude),
    ale_longitude: String(normalized.longitude),
  }
}

export function createDataverseShipService(client: DataverseShipClient): ShipService {
  let pendingList: Promise<Ship[]> | undefined
  async function savedShip(id: string, record: Ale_navioses | undefined): Promise<Ship> {
    // PATCH pode retornar 204. Nesse caso, lemos o registro para preservar o estado e os dados canônicos.
    if (!record?.ale_naviosid || record.statecode === undefined || !record.ale_nomedonavio) {
      record = ensureSuccess(await client.get(id, {
        select: ['ale_naviosid', 'ale_nomedonavio', 'ale_latitude', 'ale_longitude', 'statecode'],
      }), 'A alteração foi salva, mas não foi possível ler o navio. Atualize a lista.')
    }
    return toShip(record)
  }
  async function loadAll(): Promise<Ship[]> {
    const ships: Ship[] = []
    const visitedTokens = new Set<string>()
    let skipToken: string | undefined
    do {
      const result = await client.getAll({
        select: ['ale_naviosid', 'ale_nomedonavio', 'ale_latitude', 'ale_longitude', 'statecode'],
        orderBy: ['ale_nomedonavio asc', 'ale_naviosid asc'],
        maxPageSize: 500,
        ...(skipToken ? { skipToken } : {}),
      })
      const records = ensureSuccess(result, 'Não foi possível carregar os navios.')
      if (!Array.isArray(records)) throw new Error('Não foi possível ler a lista de navios retornada pelo Dataverse.')
      ships.push(...records.map(toShip))
      skipToken = result.skipToken
      if (skipToken) {
        if (visitedTokens.has(skipToken)) throw new Error('Não foi possível concluir o carregamento da frota. Tente novamente.')
        visitedTokens.add(skipToken)
      }
    } while (skipToken)
    return ships
  }
  return {
    list() {
      // O StrictMode compartilha a consulta em andamento; recargas seguintes consultam o servidor.
      pendingList ??= loadAll().finally(() => { pendingList = undefined })
      return pendingList.then(ships => ships.map(ship => ({ ...ship })))
    },
    async create(input) {
      const fields = toFields(input)
      const record = ensureSuccess(await client.create({ ...fields, statecode: 0 }), 'Não foi possível cadastrar o navio.')
      if (!record?.ale_naviosid) throw new Error('O cadastro foi concluído, mas o identificador não foi retornado. Atualize a lista antes de tentar novamente.')
      return toShip({ ...record, ...fields, statecode: record.statecode ?? 0 })
    },
    async update(id, input) {
      const fields = toFields(input)
      const record = ensureSuccess(await client.update(id, fields), 'Não foi possível atualizar o navio.')
      return savedShip(id, record)
    },
    async setState(id, stateCode) {
      if (stateCode !== 0 && stateCode !== 1) throw new Error('Estado do navio inválido.')
      const record = ensureSuccess(await client.update(id, {
        statecode: stateCode,
      }), stateCode === 0 ? 'Não foi possível ativar o navio.' : 'Não foi possível desativar o navio.')
      return savedShip(id, record)
    },
    async remove(id) {
      ensureSuccess(await client.remove(id), 'Não foi possível excluir o navio.')
    },
  }
}
