import {
  HealthResponseSchema,
  type HealthResponse,
} from '@oab-transparencia/contracts/health'
import {
  AuthSessionSchema,
  AuthenticatedUserSchema,
  AdminCreateUserRequestSchema,
  AdminCreatedUserResponseSchema,
  AdminUserSchema,
  type AuthSession,
  type AdminCreateUserRequest,
  type AdminCreatedUserResponse,
  type AdminUser,
  type AuthenticatedUser,
} from '@oab-transparencia/contracts/auth'
import {
  ReportsIndicatorSchema,
  CreateReportsIndicatorRequestSchema,
  UpdateReportsIndicatorRequestSchema,
  PublicReportsPageSchema,
  type ReportsIndicator,
  type CreateReportsIndicatorRequest,
  type UpdateReportsIndicatorRequest,
  type PublicReportsPage,
} from '@oab-transparencia/contracts/transparency'
import { apiBaseUrl, authenticatedRequest, getApiError } from './api-client'
const currentAdminPageQuery = '?page=1&limit=100'

export async function getApiHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiBaseUrl}/health`)

  if (!response.ok) {
    throw new Error('A API não respondeu corretamente.')
  }

  return HealthResponseSchema.parse(await response.json())
}

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

export async function listReportsIndicators(
  token: string,
): Promise<ReportsIndicator[]> {
  const payload = await authenticatedRequest(
    token,
    '/admin/reports',
    {},
    (value) => value as { indicators: unknown[] },
  )
  return payload.indicators.map((item) => ReportsIndicatorSchema.parse(item))
}
export async function createReportsIndicator(
  token: string,
  input: CreateReportsIndicatorRequest,
): Promise<ReportsIndicator> {
  const valid = CreateReportsIndicatorRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/reports',
    { body: JSON.stringify(valid), method: 'POST' },
    (value) => ReportsIndicatorSchema.parse(value),
  )
}
export async function updateReportsIndicator(
  token: string,
  id: string,
  input: UpdateReportsIndicatorRequest,
): Promise<ReportsIndicator> {
  const valid = UpdateReportsIndicatorRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    `/admin/reports/${id}`,
    { body: JSON.stringify(valid), method: 'PATCH' },
    (value) => ReportsIndicatorSchema.parse(value),
  )
}
export async function deleteReportsIndicator(
  token: string,
  id: string,
): Promise<void> {
  await authenticatedRequest(
    token,
    `/admin/reports/${id}`,
    { method: 'DELETE' },
    () => undefined,
  )
}
export async function publishReportsExercise(
  token: string,
  exercise: number,
): Promise<ReportsIndicator[]> {
  const payload = await authenticatedRequest(
    token,
    `/admin/reports/${exercise}/publish`,
    { method: 'POST' },
    (value) => value as unknown[],
  )
  return payload.map((item) => ReportsIndicatorSchema.parse(item))
}
export async function getPublicReportsPage(): Promise<PublicReportsPage> {
  const response = await fetch(`${apiBaseUrl}/public/reports`)
  if (!response.ok) throw await getApiError(response)
  return PublicReportsPageSchema.parse(await response.json())
}
