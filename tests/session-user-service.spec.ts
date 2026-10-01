import { expect, test } from '@playwright/test'
import { createSessionUserService, type SessionUserClient } from '../src/services/sessionUserService'

function client(): SessionUserClient {
  return {
    getContext: async () => ({ user: { fullName: 'Pessoa da sessão', userPrincipalName: 'login@example.invalid', objectId: 'session-user-id' } }),
    getProfile: async () => ({ success: true, data: { displayName: 'Nome do diretório', mail: 'email@example.invalid' } }),
    getPhoto: async () => ({ success: true, data: 'YWJj' }),
  }
}
test('perfil: identidade vem da sessão, e-mail do diretório e foto consultam o mesmo usuário', async () => {
  const api = client()
  const ids: string[] = []
  let contexts = 0
  api.getContext = async () => { contexts++; return { user: { fullName: 'Pessoa da sessão', objectId: 'session-user-id' } } }
  api.getProfile = async id => { ids.push(id); return { success: true, data: { mail: 'email@example.invalid' } } }
  api.getPhoto = async id => { ids.push(id); return { success: true, data: 'YWJj' } }
  const service = createSessionUserService(api)
  const [user, second] = await Promise.all([service.getUser(), service.getUser()])
  expect(contexts).toBe(1)
  expect(user).toEqual({ name: 'Pessoa da sessão', email: 'email@example.invalid', lookupId: 'session-user-id' })
  const photos = await Promise.all([service.getPhoto(user), service.getPhoto(second)])
  expect(photos).toEqual(['data:image/jpeg;base64,YWJj', 'data:image/jpeg;base64,YWJj'])
  expect(ids).toEqual(['session-user-id', 'session-user-id'])
  user.name = 'Mutação externa'
  expect((await service.getUser()).name).toBe('Pessoa da sessão')
})
test('perfil: falha no conector mantém contexto e ausência de foto retorna fallback', async () => {
  const api = client()
  api.getProfile = async () => { throw new Error('Sem acesso ao diretório') }
  api.getPhoto = async () => ({ success: false })
  const service = createSessionUserService(api)
  const user = await service.getUser()
  expect(user.name).toBe('Pessoa da sessão')
  expect(user.email).toBe('login@example.invalid')
  expect(await service.getPhoto(user)).toBeNull()
})
test('perfil: sem ID não consulta outro usuário e rejeita URLs externas ou SVG na foto', async () => {
  const api = client()
  api.getContext = async () => ({ user: {} })
  api.getProfile = async () => { throw new Error('Não deveria consultar') }
  api.getPhoto = async () => { throw new Error('Não deveria consultar') }
  const service = createSessionUserService(api)
  expect(await service.getPhoto(await service.getUser())).toBeNull()
  for (const value of ['https://example.invalid/photo', 'data:image/svg+xml;base64,YWJj', '', undefined]) {
    const api = client()
    api.getPhoto = async () => ({ success: true, data: value })
    const service = createSessionUserService(api)
    expect(await service.getPhoto(await service.getUser())).toBeNull()
  }
})
test('perfil: falha no contexto pode ser recuperada em consulta seguinte', async () => {
  const api = client()
  api.getContext = async () => { throw new Error('Host indisponível') }
  const service = createSessionUserService(api)
  await expect(service.getUser()).rejects.toThrow('Host indisponível')
  api.getContext = async () => ({ user: { fullName: 'Recuperado', userPrincipalName: 'email@example.invalid' } })
  expect((await service.getUser()).name).toBe('Recuperado')
})