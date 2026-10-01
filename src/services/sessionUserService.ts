export interface SessionUser {
  name: string
  email: string
  lookupId: string | null
}
export interface SessionUserService {
  getUser(): Promise<SessionUser>
  getPhoto(user: SessionUser): Promise<string | null>
}
export interface SessionUserClient {
  getContext(): Promise<{ user: { fullName?: string; objectId?: string; userPrincipalName?: string } }>
  getProfile(id: string): Promise<{ success: boolean; data?: { displayName?: string; mail?: string; userPrincipalName?: string } }>
  getPhoto(id: string): Promise<{ success: boolean; data?: string }>
}
function photoDataUrl(value: string | undefined): string | null {
  if (!value) return null
  const compact = value.replace(/\s/g, '')
  const encoded = compact.startsWith('data:') ? compact : `data:image/jpeg;base64,${compact}`
  return /^data:image\/(?:jpeg|png|gif|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(encoded) ? encoded : null
}
export function createSessionUserService(client: SessionUserClient): SessionUserService {
  let pendingUser: Promise<SessionUser> | undefined
  const photos = new Map<string, Promise<string | null>>()
  async function loadUser(): Promise<SessionUser> {
    const { user } = await client.getContext()
    const lookupId = user.objectId || user.userPrincipalName || null
    const result: SessionUser = { name: user.fullName || 'Usuário da sessão', email: user.userPrincipalName || '', lookupId }
    if (lookupId) {
      try {
        // Consultamos o usuário do host, nunca o proprietário da conexão.
        const profile = await client.getProfile(lookupId)
        if (profile.success && profile.data) {
          result.name = user.fullName || profile.data.displayName || result.name
          result.email = profile.data.mail || profile.data.userPrincipalName || result.email
        }
      } catch { /* O contexto continua disponível se o diretório não puder ser consultado. */ }
    }
    return result
  }
  return {
    getUser() {
      pendingUser ??= loadUser().catch(reason => { pendingUser = undefined; throw reason })
      return pendingUser.then(user => ({ ...user }))
    },
    getPhoto(user) {
      if (!user.lookupId) return Promise.resolve(null)
      const id = user.lookupId
      if (!photos.has(id)) photos.set(id, client.getPhoto(id)
        .then(result => result.success ? photoDataUrl(result.data) : null)
        .catch(() => null))
      return photos.get(id)!
    },
  }
}