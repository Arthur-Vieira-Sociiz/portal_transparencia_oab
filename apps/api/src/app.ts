import { HealthResponseSchema } from '@oab-transparencia/contracts/health'
import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'

export function createApp(): Express {
  const app = express()
  const allowedOrigins = new Set(
    (process.env.WEB_ORIGIN ?? 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  )

  app.disable('x-powered-by')
  app.use(helmet())
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true)
          return
        }

        callback(new Error('Origem não autorizada pelo CORS.'))
      },
    }),
  )
  app.use(express.json())

  app.get('/api/health', (_request, response) => {
    const body = HealthResponseSchema.parse({
      status: 'ok',
      service: 'portal-transparencia-api',
    })

    response.json(body)
  })

  return app
}

// A Vercel detecta este export como uma aplicação Express e a empacota em uma Function.
export default createApp()
