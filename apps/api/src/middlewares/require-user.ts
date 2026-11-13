import type { AuthenticatedUser } from '@oab-transparencia/contracts/auth'
import type { Request } from 'express'
import {
  AuthenticationError,
  type AuthService,
} from '../features/auth/auth-service.js'
import { readBearerToken } from '../features/auth/bearer-token.js'

export type RequireUser = (request: Request) => Promise<AuthenticatedUser>

const authenticatedUsers = new WeakMap<Request, AuthenticatedUser>()

export function getRequestUser(request: Request) {
  return authenticatedUsers.get(request) ?? null
}

export function createRequireUser(
  getAuthService: () => AuthService,
): RequireUser {
  return async function requireUser(request) {
    const cachedUser = authenticatedUsers.get(request)
    if (cachedUser) return cachedUser

    const token = readBearerToken(request.headers.authorization)
    if (!token) throw new AuthenticationError('UNAUTHENTICATED')

    const user = await getAuthService().getAuthenticatedUser(token)
    authenticatedUsers.set(request, user)
    return user
  }
}
