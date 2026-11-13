import { randomUUID } from 'node:crypto'
import type { RequestHandler } from 'express'
import { pinoHttp } from 'pino-http'
import { z } from 'zod'
import { readEnvironment } from '../environment.js'

const RequestIdSchema = z.string().uuid()

export function createRequestLogger(): RequestHandler {
  const { nodeEnv } = readEnvironment()

  return pinoHttp({
    enabled: nodeEnv !== 'test',
    level: nodeEnv === 'production' ? 'info' : 'debug',
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie'],
      censor: '[REDACTED]',
    },
    genReqId(request, response) {
      const suppliedId = request.headers['x-request-id']
      const parsedId = RequestIdSchema.safeParse(suppliedId)
      const requestId = parsedId.success ? parsedId.data : randomUUID()
      response.setHeader('X-Request-Id', requestId)
      return requestId
    },
    serializers: {
      req(request) {
        return {
          id: request.id,
          method: request.method,
          url: request.url?.split('?')[0],
          remoteAddress: request.remoteAddress,
        }
      },
    },
  }) as RequestHandler
}
