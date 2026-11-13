import { AuthenticationError } from '../features/auth/auth-service.js'
import type { RequireUser } from './require-user.js'

export function createRequireAdmin(requireUser: RequireUser): RequireUser {
  return async function requireAdmin(request) {
    const user = await requireUser(request)
    if (user.role !== 'ADMIN') throw new AuthenticationError('FORBIDDEN')

    return user
  }
}
