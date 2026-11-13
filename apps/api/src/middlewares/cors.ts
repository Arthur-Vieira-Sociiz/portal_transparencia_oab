import cors from 'cors'
import type { RequestHandler } from 'express'
import { readEnvironment } from '../environment.js'

export class CorsOriginError extends Error {
  constructor() {
    super('Origem não autorizada pelo CORS.')
    this.name = 'CorsOriginError'
  }
}

export function createCorsMiddleware(
  webOrigins: readonly string[] = readEnvironment().webOrigins,
): RequestHandler {
  const allowedOrigins = new Set(webOrigins)

  return cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true)
        return
      }

      callback(new CorsOriginError())
    },
  })
}
