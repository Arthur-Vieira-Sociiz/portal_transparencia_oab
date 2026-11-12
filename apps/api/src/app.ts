import {
  LoginRequestSchema,
  RegisterRequestSchema,
} from '@oab-transparencia/contracts/auth'
import {
  CreateGeneralDataRequestSchema,
  UpdateGeneralDataRequestSchema,
} from '@oab-transparencia/contracts/transparency'
import { ExerciseSchema } from '@oab-transparencia/contracts/common'
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
import {
  GeneralDataError,
  createGeneralDataService,
  type GeneralDataService,
} from './general-data/general-data-service.js'
import { createPrismaGeneralDataRepository } from './general-data/prisma-general-data-repository.js'

type AppOptions = {
  authService?: AuthService
  generalDataService?: GeneralDataService
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

function generalDataErrorResponse(error: GeneralDataError, response: Response) {
  const responses = {
    EXERCISE_ALREADY_EXISTS: [
      409,
      'Já existe um cadastro para este exercício.',
    ],
    GENERAL_DATA_NOT_FOUND: [404, 'Cadastro de dados gerais não encontrado.'],
    GENERAL_DATA_ALREADY_PUBLISHED: [409, 'Este cadastro já foi publicado.'],
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

  let generalDataService = options.generalDataService
  function getGeneralDataService() {
    generalDataService ??= createGeneralDataService(
      createPrismaGeneralDataRepository(),
    )
    return generalDataService
  }

  async function requireUser(request: Request) {
    const token = readBearerToken(request.headers.authorization)
    if (!token) throw new AuthenticationError('UNAUTHENTICATED')
    return getAuthService().getAuthenticatedUser(token)
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

  app.get('/api/public/general-data', async (request, response, next) => {
    try {
      const exerciseValue = request.query.exercise
      const exercise = exerciseValue
        ? ExerciseSchema.parse(Number(exerciseValue))
        : undefined
      const result = await getGeneralDataService().getPublished(exercise)
      if (!result) {
        response
          .status(404)
          .json({ message: 'Dados gerais publicados não encontrados.' })
        return
      }
      response.json(result)
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/admin/general-data', async (request, response, next) => {
    try {
      await requireUser(request)
      response.json({ records: await getGeneralDataService().list() })
    } catch (error) {
      next(error)
    }
  })

  app.post('/api/admin/general-data', async (request, response, next) => {
    try {
      const user = await requireUser(request)
      const input = CreateGeneralDataRequestSchema.parse(request.body)
      response
        .status(201)
        .json(
          await getGeneralDataService().create({ ...input, userId: user.id }),
        )
    } catch (error) {
      next(error)
    }
  })

  app.patch('/api/admin/general-data/:id', async (request, response, next) => {
    try {
      const user = await requireUser(request)
      const input = UpdateGeneralDataRequestSchema.parse(request.body)
      response.json(
        await getGeneralDataService().update(request.params.id, {
          ...input,
          userId: user.id,
        }),
      )
    } catch (error) {
      next(error)
    }
  })

  app.post(
    '/api/admin/general-data/:id/publish',
    async (request, response, next) => {
      try {
        const user = await requireUser(request)
        response.json(
          await getGeneralDataService().publish(request.params.id, user.id),
        )
      } catch (error) {
        next(error)
      }
    },
  )

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
      if (error instanceof GeneralDataError) {
        generalDataErrorResponse(error, response)
        return
      }

      response.status(500).json({ message: 'Erro interno do servidor.' })
    },
  )

  return app
}

// A Vercel detecta este export como uma aplicação Express e a empacota em uma Function.
export default createApp()
