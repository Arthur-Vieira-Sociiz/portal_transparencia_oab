import { HealthResponseSchema } from '@oab-transparencia/contracts/health'
import type { RequestHandler } from 'express'

export const getHealth: RequestHandler = (_request, response) => {
  const body = HealthResponseSchema.parse({
    status: 'ok',
    service: 'portal-transparencia-api',
  })

  response.json(body)
}
