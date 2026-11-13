import { describe, expect, it } from 'vitest'
import { createMutationAuditEvent } from './audit-event.js'

const user = { id: 'user-1', role: 'ADMIN' as const }

describe('createMutationAuditEvent', () => {
  it('records an attributable event for a successful mutation', () => {
    expect(
      createMutationAuditEvent({
        method: 'DELETE',
        path: '/api/admin/contracts/contract-1',
        statusCode: 204,
        user,
      }),
    ).toEqual({
      action: 'DELETE',
      actorRole: 'ADMIN',
      actorUserId: 'user-1',
      resource: '/api/admin/contracts/contract-1',
      statusCode: 204,
    })
  })

  it('ignores reads, failed mutations and anonymous requests', () => {
    expect(
      createMutationAuditEvent({
        method: 'GET',
        path: '/api/admin/contracts',
        statusCode: 200,
        user,
      }),
    ).toBeNull()
    expect(
      createMutationAuditEvent({
        method: 'PATCH',
        path: '/api/admin/contracts/contract-1',
        statusCode: 400,
        user,
      }),
    ).toBeNull()
    expect(
      createMutationAuditEvent({
        method: 'POST',
        path: '/api/auth/login',
        statusCode: 200,
        user: null,
      }),
    ).toBeNull()
  })
})
