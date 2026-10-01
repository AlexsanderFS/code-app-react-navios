import type { SessionUserService } from './sessionUserService'

// Identidade fictícia usada exclusivamente no build isolado de testes.
export const mockSessionUserService: SessionUserService = {
  getUser: async () => ({ name: 'Usuário de teste', email: 'usuario@example.invalid', lookupId: null }),
  getPhoto: async () => null,
}