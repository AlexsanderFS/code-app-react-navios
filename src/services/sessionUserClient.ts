import { getContext } from '@microsoft/power-apps/app'
import { Office365UsersService } from '../generated/services/Office365UsersService'
import { createSessionUserService } from './sessionUserService'

export const sessionUserService = createSessionUserService({
  getContext,
  getProfile: id => Office365UsersService.UserProfile_V2(id, 'displayName,mail,userPrincipalName'),
  getPhoto: id => Office365UsersService.UserPhoto_V2(id),
})