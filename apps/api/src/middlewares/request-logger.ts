import { randomUUID } from 'node:crypto'
import type { Request, RequestHandler, Response } from 'express'
import { pinoHttp } from 'pino-http'
import { z } from 'zod'
import { readEnvironment } from '../environment.js'
import { createMutationAuditEvent } from './audit-event.js'
import { getRequestUser } from './require-user.js'

const RequestIdSchema = z.string().uuid()

export function createRequestLogger(): RequestHandler {
  const { nodeEnv } = readEnvironment()

  return pinoHttp<Request, Response>({
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
    customSuccessObject(request, response, loggableObject) {
      const audit = createMutationAuditEvent({
        method: request.method,
        path: request.originalUrl.split('?')[0] ?? request.path,
        statusCode: response.statusCode,
        user: getRequestUser(request),
      })

      return audit ? { ...loggableObject, audit } : loggableObject
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
