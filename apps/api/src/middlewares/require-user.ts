import type { AuthenticatedUser } from '@oab-transparencia/contracts/auth'
import type { Request } from 'express'
import { AuthenticationError, type AuthService } from '../auth/auth-service.js'
import { readBearerToken } from '../auth/bearer-token.js'

export type RequireUser = (request: Request) => Promise<AuthenticatedUser>

export function createRequireUser(
  getAuthService: () => AuthService,
): RequireUser {
  return async function requireUser(request) {
    const token = readBearerToken(request.headers.authorization)
    if (!token) throw new AuthenticationError('UNAUTHENTICATED')

    return getAuthService().getAuthenticatedUser(token)
  }
}
