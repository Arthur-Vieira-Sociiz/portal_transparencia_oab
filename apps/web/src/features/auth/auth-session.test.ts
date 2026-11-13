import { afterEach, describe, expect, it, vi } from 'vitest'
import { authenticationInvalidatedEvent } from '@/lib/auth-events'
import { listAdminUsers } from '@/lib/api'
import {
  clearAuthSession,
  getStoredAuthSession,
  saveAuthSession,
  subscribeAuthSession,
} from './auth-session'

const session = {
  token: 'session-token',
  expiresAt: '2030-01-01T00:00:00.000Z',
  user: {
    id: 'user-1',
    name: 'Equipe OAB',
    email: 'admin@oab-al.org.br',
    role: 'ADMIN' as const,
  },
}

afterEach(() => {
  clearAuthSession({ broadcast: false })
})

describe('auth session synchronization', () => {
  it('clears the current tab when the API invalidates authentication', () => {
    saveAuthSession(session)
    const listener = vi.fn()
    const unsubscribe = subscribeAuthSession(listener)

    window.dispatchEvent(new Event(authenticationInvalidatedEvent))

    expect(getStoredAuthSession()).toBeNull()
    expect(listener).toHaveBeenCalled()
    unsubscribe()
  })

  it('revalidates the stored session with the API when returning from history', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user: session.user }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    saveAuthSession(session)
    const listener = vi.fn()
    const unsubscribe = subscribeAuthSession(listener)

    window.dispatchEvent(
      new PageTransitionEvent('pageshow', { persisted: true }),
    )

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/me', {
      headers: { Authorization: `Bearer ${session.token}` },
    })
    await vi.waitFor(() => expect(listener).toHaveBeenCalled())
    expect(getStoredAuthSession()).toEqual(session)
    unsubscribe()
  })

  it('clears a revoked session restored from the browser history', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'Não autenticado.' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 401,
        }),
      ),
    )
    saveAuthSession(session)
    const unsubscribe = subscribeAuthSession(vi.fn())

    window.dispatchEvent(
      new PageTransitionEvent('pageshow', { persisted: true }),
    )

    await vi.waitFor(() => expect(getStoredAuthSession()).toBeNull())
    unsubscribe()
  })

  it('does not restore a session cleared while history revalidation is pending', async () => {
    let resolveRequest: ((response: Response) => void) | undefined
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        () =>
          new Promise<Response>((resolve) => {
            resolveRequest = resolve
          }),
      ),
    )
    saveAuthSession(session)
    const unsubscribe = subscribeAuthSession(vi.fn())

    window.dispatchEvent(
      new PageTransitionEvent('pageshow', { persisted: true }),
    )
    await vi.waitFor(() => expect(resolveRequest).toBeDefined())
    clearAuthSession({ broadcast: false })
    resolveRequest?.(
      new Response(JSON.stringify({ user: session.user }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
    )

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(getStoredAuthSession()).toBeNull()
    unsubscribe()
  })

  it('clears the session when the API reports rate-limit revocation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: 'SESSION_REVOKED_RATE_LIMIT',
            message: 'Sessão encerrada.',
          }),
          { headers: { 'Content-Type': 'application/json' }, status: 429 },
        ),
      ),
    )
    saveAuthSession(session)
    const unsubscribe = subscribeAuthSession(vi.fn())

    await expect(listAdminUsers(session.token)).rejects.toMatchObject({
      status: 429,
    })

    expect(getStoredAuthSession()).toBeNull()
    unsubscribe()
  })
})
