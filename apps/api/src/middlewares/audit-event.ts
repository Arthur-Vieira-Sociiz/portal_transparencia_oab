import type { AuthenticatedUser } from '@oab-transparencia/contracts/auth'

const mutationMethods = new Set(['DELETE', 'PATCH', 'POST', 'PUT'])

type MutationAuditEventInput = {
  method: string
  path: string
  statusCode: number
  user: Pick<AuthenticatedUser, 'id' | 'role'> | null
}

export function createMutationAuditEvent({
  method,
  path,
  statusCode,
  user,
}: MutationAuditEventInput) {
  if (!user || !mutationMethods.has(method) || statusCode >= 400) return null

  return {
    action: method,
    actorRole: user.role,
    actorUserId: user.id,
    resource: path,
    statusCode,
  }
}
