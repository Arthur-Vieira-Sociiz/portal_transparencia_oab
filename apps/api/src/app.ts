import { HealthResponseSchema } from '@oab-transparencia/contracts'
import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'

export function createApp(): Express {
  const app = express()

  app.disable('x-powered-by')
  app.use(helmet())
  app.use(
    cors({
      origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
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
