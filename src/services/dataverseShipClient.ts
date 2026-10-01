import { getClient } from '@microsoft/power-apps/data'
import { dataSourcesInfo } from '../../.power/schemas/appschemas/dataSourcesInfo'
import { Ale_naviosesService } from '../generated/services/Ale_naviosesService'
import type { DataverseShipClient } from './dataverseShipService'

const sdkClient = getClient(dataSourcesInfo)

export const dataverseShipClient: DataverseShipClient = {
  get: (id, options) => Ale_naviosesService.get(id, options),
  getAll: options => Ale_naviosesService.getAll(options),
  create: input => Ale_naviosesService.create(input),
  update: (id, fields) => Ale_naviosesService.update(id, fields),
  // O delete gerado retorna void e descarta success/error. Preservamos esse resultado pelo mesmo SDK.
  remove: id => sdkClient.deleteRecordAsync('ale_navioses', id),
}
