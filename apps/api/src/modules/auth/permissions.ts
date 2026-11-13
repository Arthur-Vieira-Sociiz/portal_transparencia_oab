import type { UserRole } from '@oab-transparencia/contracts/auth'

export type Permission =
  'CONTENT_READ' | 'CONTENT_WRITE' | 'CONTENT_PUBLISH' | 'USERS_MANAGE'

export const permissionsByRole = {
  ADMIN: ['CONTENT_READ', 'CONTENT_WRITE', 'CONTENT_PUBLISH', 'USERS_MANAGE'],
  EDITOR: ['CONTENT_READ', 'CONTENT_WRITE'],
  REVIEWER: ['CONTENT_READ', 'CONTENT_PUBLISH'],
} as const satisfies Record<UserRole, readonly Permission[]>

export function roleHasPermission(role: UserRole, permission: Permission) {
  return (permissionsByRole[role] as readonly Permission[]).includes(permission)
}
