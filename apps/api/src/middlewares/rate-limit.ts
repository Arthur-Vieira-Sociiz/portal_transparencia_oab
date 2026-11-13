import { createHash } from 'node:crypto'
import type { Request, RequestHandler } from 'express'
import {
  ipKeyGenerator,
  MemoryStore,
  rateLimit,
  type Store,
} from 'express-rate-limit'
import type { AuthService } from '../features/auth/auth-service.js'
import { readEnvironment } from '../environment.js'
import { PrismaRateLimitStore } from '../infrastructure/rate-limit/prisma-rate-limit-store.js'
import { getRequestUser, type RequireUser } from './require-user.js'

const AUTH_WINDOW_MS = 15 * 60 * 1000
const ADMIN_WINDOW_MS = 60 * 1000
const USER_BLOCK_MS = 15 * 60 * 1000

type RateLimitStoreFactory = (prefix: string, windowMs: number) => Store

function defaultStoreFactory(prefix: string, windowMs: number): Store {
  if (readEnvironment().nodeEnv === 'test') return new MemoryStore()
  return new PrismaRateLimitStore(prefix, windowMs)
}

function hashRateLimitKey(value: string) {
  return createHash('sha256').update(value).digest('base64url')
}

function requestIp(request: Request) {
  const vercelForwardedFor =
    process.env.VERCEL === '1'
      ? request.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
      : undefined

  return ipKeyGenerator(vercelForwardedFor || request.ip || 'unknown')
}

function normalizedEmail(request: Request) {
  if (
    typeof request.body === 'object' &&
    request.body !== null &&
    'email' in request.body &&
    typeof request.body.email === 'string'
  ) {
    return request.body.email.trim().toLowerCase()
  }
  return 'unknown'
}

export function createLoginRateLimit(
  storeFactory: RateLimitStoreFactory = defaultStoreFactory,
): RequestHandler {
  return rateLimit({
    windowMs: AUTH_WINDOW_MS,
    limit: 5,
    store: storeFactory('login', AUTH_WINDOW_MS),
    keyGenerator: (request) =>
      hashRateLimitKey(`${requestIp(request)}:${normalizedEmail(request)}`),
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      code: 'LOGIN_RATE_LIMITED',
      message: 'Muitas tentativas de login. Tente novamente mais tarde.',
    },
  })
}

export function createRegisterRateLimit(
  storeFactory: RateLimitStoreFactory = defaultStoreFactory,
): RequestHandler {
  return rateLimit({
    windowMs: AUTH_WINDOW_MS,
    limit: 5,
    store: storeFactory('register', AUTH_WINDOW_MS),
    keyGenerator: (request) => hashRateLimitKey(requestIp(request)),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      code: 'REGISTER_RATE_LIMITED',
      message: 'Muitas tentativas de cadastro. Tente novamente mais tarde.',
    },
  })
}

export function createAuthenticatedAdminRateLimit({
  getAuthService,
  requireUser,
  storeFactory = defaultStoreFactory,
}: {
  getAuthService: () => AuthService
  requireUser: RequireUser
  storeFactory?: RateLimitStoreFactory
}): RequestHandler[] {
  const authenticate: RequestHandler = async (request, _response, next) => {
    try {
      await requireUser(request)
      next()
    } catch (error) {
      next(error)
    }
  }

  const limiter = rateLimit({
    windowMs: ADMIN_WINDOW_MS,
    limit: 30,
    store: storeFactory('admin', ADMIN_WINDOW_MS),
    keyGenerator(request) {
      const user = getRequestUser(request)
      return user?.id ?? hashRateLimitKey(requestIp(request))
    },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    async handler(request, response, next) {
      try {
        const user = getRequestUser(request)
        if (!user) {
          next()
          return
        }

        await getAuthService().blockUserForRateLimit(
          user.id,
          new Date(Date.now() + USER_BLOCK_MS),
        )
        response.setHeader('Retry-After', String(USER_BLOCK_MS / 1000))
        response.status(429).json({
          code: 'SESSION_REVOKED_RATE_LIMIT',
          message:
            'Sessão encerrada por excesso de requisições. Tente novamente em 15 minutos.',
        })
      } catch (error) {
        next(error)
      }
    },
  })

  return [authenticate, limiter]
}
