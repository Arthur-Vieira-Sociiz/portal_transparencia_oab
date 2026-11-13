/**
 * Mantém o shell administrativo reativo a logout, expiração e restauração pelo
 * histórico/bfcache, evitando que uma tela protegida permaneça visível.
 */
import { useEffect, useState } from 'react'
import type { AuthSession } from '@oab-transparencia/contracts/auth'
import { getStoredAuthSession, subscribeAuthSession } from './auth-session'

export function useAuthSession(): AuthSession | null {
  const [session, setSession] = useState(getStoredAuthSession)

  useEffect(
    () => subscribeAuthSession(() => setSession(getStoredAuthSession())),
    [],
  )

  return session
}
