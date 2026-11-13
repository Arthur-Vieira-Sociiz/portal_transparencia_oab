/**
 * Sincroniza logout forçado entre abas. BroadcastChannel cobre navegadores
 * modernos; o evento de storage é o fallback e nunca contém o token.
 */
import { authenticationInvalidatedEvent } from '@/lib/auth-events'

const channelName = 'oab-transparencia:auth'
const logoutStorageKey = 'oab-transparencia:logout'

type ForcedLogoutListener = (broadcast: boolean) => void

const listeners = new Set<ForcedLogoutListener>()
let channel: BroadcastChannel | null = null
let stopListening: (() => void) | null = null

function notifyListeners(broadcast: boolean) {
  for (const listener of listeners) listener(broadcast)
}

function startListening() {
  if (typeof window === 'undefined' || stopListening) return

  const handleLocalInvalidation = () => notifyListeners(true)
  const handleStorage = (event: StorageEvent) => {
    if (event.key === logoutStorageKey && event.newValue) {
      notifyListeners(false)
    }
  }

  window.addEventListener(
    authenticationInvalidatedEvent,
    handleLocalInvalidation,
  )
  window.addEventListener('storage', handleStorage)

  if ('BroadcastChannel' in window) {
    channel = new BroadcastChannel(channelName)
    channel.addEventListener('message', () => notifyListeners(false))
  }

  stopListening = () => {
    window.removeEventListener(
      authenticationInvalidatedEvent,
      handleLocalInvalidation,
    )
    window.removeEventListener('storage', handleStorage)
    channel?.close()
    channel = null
    stopListening = null
  }
}

export function subscribeToForcedLogout(listener: ForcedLogoutListener) {
  listeners.add(listener)
  startListening()

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) stopListening?.()
  }
}

export function broadcastLogout() {
  if (typeof window === 'undefined') return

  channel?.postMessage({ type: 'LOGOUT' })
  window.localStorage.setItem(logoutStorageKey, String(Date.now()))
  window.localStorage.removeItem(logoutStorageKey)
}
