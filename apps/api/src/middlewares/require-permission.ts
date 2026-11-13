import type { AuthenticatedUser } from '@oab-transparencia/contracts/auth'
import type { Request } from 'express'
import { AuthenticationError } from '../modules/auth/auth-service.js'
import {
  roleHasPermission,
  type Permission,
} from '../modules/auth/permissions.js'
import type { RequireUser } from './require-user.js'

export type RequirePermission = (
  request: Request,
  permission: Permission,
) => Promise<AuthenticatedUser>

export function createRequirePermission(
  requireUser: RequireUser,
): RequirePermission {
  return async function requirePermission(request, permission) {
    const user = await requireUser(request)
    if (!roleHasPermission(user.role, permission)) {
      throw new AuthenticationError('FORBIDDEN')
    }
    return user
  }
}
