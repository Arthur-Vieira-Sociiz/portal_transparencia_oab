import {
  HealthResponseSchema,
  type HealthResponse,
} from '@oab-transparencia/contracts/health'
import {
  AuthSessionSchema,
  type AuthSession,
  type AuthenticatedUser,
} from '@oab-transparencia/contracts/auth'
import {
  CreateGeneralDataRequestSchema,
  GeneralDataSchema,
  type CreateGeneralDataRequest,
  type GeneralData,
  type UpdateGeneralDataRequest,
} from '@oab-transparencia/contracts/transparency'

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

async function authenticatedRequest<T>(
  token: string,
  path: string,
  init: RequestInit = {},
  parse: (payload: unknown) => T,
) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  })
  if (!response.ok) throw await getApiError(response)
  return parse(await response.json())
}

export async function listGeneralData(token: string): Promise<GeneralData[]> {
  const payload = await authenticatedRequest(
    token,
    '/admin/general-data',
    {},
    (value) => value as { records: unknown[] },
  )
  return payload.records.map((record) => GeneralDataSchema.parse(record))
}

export async function createGeneralData(
  token: string,
  input: CreateGeneralDataRequest,
): Promise<GeneralData> {
  const validInput = CreateGeneralDataRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/general-data',
    { body: JSON.stringify(validInput), method: 'POST' },
    (value) => GeneralDataSchema.parse(value),
  )
}

export async function updateGeneralData(
  token: string,
  id: string,
  input: UpdateGeneralDataRequest,
): Promise<GeneralData> {
  return authenticatedRequest(
    token,
    `/admin/general-data/${id}`,
    { body: JSON.stringify(input), method: 'PATCH' },
    (value) => GeneralDataSchema.parse(value),
  )
}

export async function publishGeneralData(
  token: string,
  id: string,
): Promise<GeneralData> {
  return authenticatedRequest(
    token,
    `/admin/general-data/${id}/publish`,
    { method: 'POST' },
    (value) => GeneralDataSchema.parse(value),
  )
}

export async function getPublicGeneralData(
  exercise?: number,
): Promise<GeneralData> {
  const query = exercise ? `?exercise=${exercise}` : ''
  const response = await fetch(`${apiBaseUrl}/public/general-data${query}`)
  if (!response.ok) throw await getApiError(response)
  return GeneralDataSchema.parse(await response.json())
}
