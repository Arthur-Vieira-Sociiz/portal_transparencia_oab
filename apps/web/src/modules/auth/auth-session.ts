import {
  AuthSessionSchema,
  type AuthSession,
} from '@oab-transparencia/contracts/auth'
import { getCurrentUser } from './data/auth.api'
import { broadcastLogout, subscribeToForcedLogout } from './authSync'

const sessionKey = 'oab-transparencia.admin-session'
const sessionListeners = new Set<() => void>()

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
  notifySessionListeners()
}

export function clearAuthSession(options: { broadcast?: boolean } = {}) {
  getStorage()?.removeItem(sessionKey)
  notifySessionListeners()
  if (options.broadcast ?? true) broadcastLogout()
}

function notifySessionListeners() {
  for (const listener of sessionListeners) listener()
}

async function revalidateStoredSession() {
  const session = getStoredAuthSession()
  if (!session) {
    notifySessionListeners()
    return
  }

  try {
    const user = await getCurrentUser(session.token)
    const currentSession = getStoredAuthSession()
    if (currentSession?.token === session.token) {
      saveAuthSession({ ...currentSession, user })
    }
  } catch {
    // Respostas 401/429 disparam a invalidação centralizada em api-client.
    // Falhas transitórias de rede preservam a sessão para permitir nova tentativa.
  }
}

export function subscribeAuthSession(listener: () => void) {
  sessionListeners.add(listener)
  const handlePageRestore = () => void revalidateStoredSession()
  window.addEventListener('pageshow', handlePageRestore)
  window.addEventListener('popstate', handlePageRestore)
  const unsubscribeForcedLogout = subscribeToForcedLogout((broadcast) => {
    clearAuthSession({ broadcast })
  })

  return () => {
    sessionListeners.delete(listener)
    window.removeEventListener('pageshow', handlePageRestore)
    window.removeEventListener('popstate', handlePageRestore)
    unsubscribeForcedLogout()
  }
}
