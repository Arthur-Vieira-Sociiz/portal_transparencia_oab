export function readBearerToken(authorization?: string) {
  const [scheme, token] = authorization?.split(' ') ?? []
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null
  return token
}
