import cors from 'cors'
import type { RequestHandler } from 'express'

export function createCorsMiddleware(
  webOrigin = process.env.WEB_ORIGIN,
): RequestHandler {
  const allowedOrigins = new Set(
    (webOrigin ?? 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  )

  return cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('Origem não autorizada pelo CORS.'))
    },
  })
}
