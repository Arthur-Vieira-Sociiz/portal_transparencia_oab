import {
  HealthResponseSchema,
  type HealthResponse,
} from '@oab-transparencia/contracts/health'
import {
  AuthSessionSchema,
  type AuthSession,
  type AuthenticatedUser,
} from '@oab-transparencia/contracts/auth'

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

export async function getApiHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiBaseUrl}/health`)

  if (!response.ok) {
    throw new Error('A API não respondeu corretamente.')
  }

  return HealthResponseSchema.parse(await response.json())
}

type ApiError = Error & { status?: number }

async function getApiError(response: Response): Promise<ApiError> {
  const payload = (await response.json().catch(() => null)) as {
    message?: string
  } | null
  const error = new Error(
    payload?.message ?? 'Não foi possível concluir a solicitação.',
  ) as ApiError
  error.status = response.status
  return error
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
  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw await getApiError(response)
  const payload = (await response.json()) as { user: AuthenticatedUser }
  return payload.user
}
