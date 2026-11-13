import {
  AdminCreateUserRequestSchema,
  AdminCreatedUserResponseSchema,
  AdminUserSchema,
  AuthSessionSchema,
  AuthenticatedUserSchema,
  type AdminCreateUserRequest,
  type AdminCreatedUserResponse,
  type AdminUser,
  type AuthSession,
  type AuthenticatedUser,
} from '@oab-transparencia/contracts/auth'
import { apiBaseUrl, authenticatedRequest, getApiError } from '@/lib/api-client'

const currentAdminPageQuery = '?page=1&limit=100'

export async function login(input: {
  email: string
  password: string
}): Promise<AuthSession> {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  if (!response.ok) throw await getApiError(response)
  return AuthSessionSchema.parse(await response.json())
}

export async function logout(token: string) {
  const response = await fetch(`${apiBaseUrl}/auth/logout`, {
    headers: { Authorization: `Bearer ${token}` },
    method: 'POST',
  })
  if (!response.ok) throw await getApiError(response)
}

export async function getCurrentUser(
  token: string,
): Promise<AuthenticatedUser> {
  const payload = await authenticatedRequest(
    token,
    '/auth/me',
    {},
    (value) => value as { user: unknown },
  )
  return AuthenticatedUserSchema.parse(payload.user)
}

export async function listAdminUsers(token: string): Promise<AdminUser[]> {
  const payload = await authenticatedRequest(
    token,
    `/admin/users${currentAdminPageQuery}`,
    {},
    (value) => value as { users: unknown[] },
  )
  return payload.users.map((user) => AdminUserSchema.parse(user))
}

export async function createAdminUser(
  token: string,
  input: AdminCreateUserRequest,
): Promise<AdminCreatedUserResponse> {
  const valid = AdminCreateUserRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/users',
    { body: JSON.stringify(valid), method: 'POST' },
    (value) => AdminCreatedUserResponseSchema.parse(value),
  )
}
