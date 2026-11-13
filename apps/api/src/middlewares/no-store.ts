import type { RequestHandler } from 'express'

export const noStoreAuthenticatedResponses: RequestHandler = (
  request,
  response,
  next,
) => {
  if (
    request.path.startsWith('/api/admin') ||
    request.path === '/api/auth/me' ||
    request.path === '/api/auth/logout'
  ) {
    response.setHeader('Cache-Control', 'no-store')
  }
  next()
}
