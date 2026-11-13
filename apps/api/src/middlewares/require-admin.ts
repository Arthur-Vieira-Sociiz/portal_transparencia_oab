import type { RequirePermission } from './require-permission.js'
import type { RequireUser } from './require-user.js'

export function createRequireAdmin(
  requirePermission: RequirePermission,
): RequireUser {
  return async function requireAdmin(request) {
    return requirePermission(request, 'USERS_MANAGE')
  }
}
