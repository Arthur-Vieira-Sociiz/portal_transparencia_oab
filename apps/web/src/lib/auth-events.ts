export const authenticationInvalidatedEvent =
  'oab-transparencia:authentication-invalidated'

export function dispatchAuthenticationInvalidated() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(authenticationInvalidatedEvent))
}
