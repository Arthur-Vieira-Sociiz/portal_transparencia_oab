import {
  AuthSessionSchema,
  type AuthSession,
} from '@oab-transparencia/contracts/auth'

const sessionKey = 'oab-transparencia.admin-session'

function getStorage() {
  return typeof window === 'undefined' ? null : window.sessionStorage
}

export function getStoredAuthSession(): AuthSession | null {
  const serializedSession = getStorage()?.getItem(sessionKey)
  if (!serializedSession) return null

  let storedValue: unknown
  try {
    storedValue = JSON.parse(serializedSession)
  } catch {
    getStorage()?.removeItem(sessionKey)
    return null
  }

  const parsed = AuthSessionSchema.safeParse(storedValue)
  if (!parsed.success || new Date(parsed.data.expiresAt) <= new Date()) {
    getStorage()?.removeItem(sessionKey)
    return null
  }
  return parsed.data
}

export function saveAuthSession(session: AuthSession) {
  getStorage()?.setItem(sessionKey, JSON.stringify(session))
}

export function clearAuthSession() {
  getStorage()?.removeItem(sessionKey)
}
