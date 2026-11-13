import { describe, expect, it } from 'vitest'
import { roleHasPermission } from './permissions.js'

describe('role permissions', () => {
  it('keeps administration unrestricted only for administrators', () => {
    expect(roleHasPermission('ADMIN', 'USERS_MANAGE')).toBe(true)
    expect(roleHasPermission('EDITOR', 'USERS_MANAGE')).toBe(false)
    expect(roleHasPermission('REVIEWER', 'USERS_MANAGE')).toBe(false)
  })

  it('separates editing from publishing', () => {
    expect(roleHasPermission('EDITOR', 'CONTENT_WRITE')).toBe(true)
    expect(roleHasPermission('EDITOR', 'CONTENT_PUBLISH')).toBe(false)
    expect(roleHasPermission('REVIEWER', 'CONTENT_WRITE')).toBe(false)
    expect(roleHasPermission('REVIEWER', 'CONTENT_PUBLISH')).toBe(true)
  })
})
