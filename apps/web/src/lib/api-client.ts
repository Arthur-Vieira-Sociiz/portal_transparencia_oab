import { dispatchAuthenticationInvalidated } from './auth-events'

export const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api').replace(
  /\/$/,
  '',
)

export type ApiError = Error & { code?: string; status?: number }

export async function getApiError(response: Response): Promise<ApiError> {
  const payload = (await response.json().catch(() => null)) as {
    code?: string
    message?: string
  } | null
  const error = new Error(
    payload?.message ?? 'Não foi possível concluir a solicitação.',
  ) as ApiError
  error.status = response.status
  error.code = payload?.code
  return error
}

async function getAuthenticatedApiError(response: Response) {
  const error = await getApiError(response)
  if (
    response.status === 401 ||
    (response.status === 429 && error.code === 'SESSION_REVOKED_RATE_LIMIT')
  ) {
    dispatchAuthenticationInvalidated()
  }
  return error
}

export async function authenticatedRequest<T>(
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
  if (!response.ok) throw await getAuthenticatedApiError(response)
  if (response.status === 204) return parse(undefined)
  return parse(await response.json())
}
