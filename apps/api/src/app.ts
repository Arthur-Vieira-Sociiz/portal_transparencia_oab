import {
  LoginRequestSchema,
  RegisterRequestSchema,
} from '@oab-transparencia/contracts/auth'
import { HealthResponseSchema } from '@oab-transparencia/contracts/health'
import cors from 'cors'
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from 'express'
import helmet from 'helmet'
import { ZodError } from 'zod'
import { AuthenticationError, type AuthService } from './auth/auth-service.js'
import { readBearerToken } from './auth/bearer-token.js'
import { createPrismaAuthService } from './auth/prisma-auth-service.js'

type AppOptions = {
  authService?: AuthService
}

function authenticationErrorResponse(
  error: AuthenticationError,
  response: Response,
) {
  const responses = {
    EMAIL_ALREADY_IN_USE: [409, 'Este e-mail já está cadastrado.'],
    INVALID_CREDENTIALS: [401, 'E-mail ou senha inválidos.'],
    INVALID_REGISTRATION_KEY: [403, 'Chave de cadastro inválida.'],
    REGISTRATION_UNAVAILABLE: [503, 'Cadastro inicial indisponível.'],
    UNAUTHENTICATED: [401, 'Autenticação necessária.'],
  } as const
  const [status, message] = responses[error.code]
  response.status(status).json({ message })
}

export function createApp(options: AppOptions = {}): Express {
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

  let authService = options.authService
  function getAuthService() {
    authService ??= createPrismaAuthService()
    return authService
  }

  app.get('/api/health', (_request, response) => {
    const body = HealthResponseSchema.parse({
      status: 'ok',
      service: 'portal-transparencia-api',
    })

    response.json(body)
  })

  app.post('/api/auth/register', async (request, response, next) => {
    try {
      const input = RegisterRequestSchema.parse(request.body)
      const session = await getAuthService().register(input)
      response.status(201).json(session)
    } catch (error) {
      next(error)
    }
  })

  app.post('/api/auth/login', async (request, response, next) => {
    try {
      const input = LoginRequestSchema.parse(request.body)
      response.json(await getAuthService().login(input))
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/auth/me', async (request, response, next) => {
    try {
      const token = readBearerToken(request.headers.authorization)
      if (!token) throw new AuthenticationError('UNAUTHENTICATED')
      response.json({
        user: await getAuthService().getAuthenticatedUser(token),
      })
    } catch (error) {
      next(error)
    }
  })

  app.post('/api/auth/logout', async (request, response, next) => {
    try {
      const token = readBearerToken(request.headers.authorization)
      if (!token) throw new AuthenticationError('UNAUTHENTICATED')
      await getAuthService().logout(token)
      response.status(204).send()
    } catch (error) {
      next(error)
    }
  })

  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      _next: NextFunction,
    ) => {
      if (error instanceof ZodError) {
        response.status(400).json({
          message: 'Dados inválidos.',
          issues: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        })
        return
      }
      if (error instanceof AuthenticationError) {
        authenticationErrorResponse(error, response)
        return
      }

      response.status(500).json({ message: 'Erro interno do servidor.' })
    },
  )

  return app
}

// A Vercel detecta este export como uma aplicação Express e a empacota em uma Function.
export default createApp()
