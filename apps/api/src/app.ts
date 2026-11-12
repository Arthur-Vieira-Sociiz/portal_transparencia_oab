import {
  LoginRequestSchema,
  RegisterRequestSchema,
} from '@oab-transparencia/contracts/auth'
import {
  CreateGeneralDataRequestSchema,
  UpdateGeneralDataRequestSchema,
  CreateReportsIndicatorRequestSchema,
  UpdateReportsIndicatorRequestSchema,
  PublicReportsPageSchema,
} from '@oab-transparencia/contracts/transparency'
import {
  AdminCreateUserRequestSchema,
  AdminCreatedUserResponseSchema,
} from '@oab-transparencia/contracts/auth'
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
import {
  ReportsIndicatorsError,
  createReportsIndicatorsService,
  type ReportsIndicatorsService,
} from './reports-indicators/reports-indicators-service.js'
import { createPrismaReportsIndicatorsRepository } from './reports-indicators/prisma-reports-indicators-repository.js'
import {
  BudgetError,
  createBudgetService,
  type BudgetService,
} from './budget/budget-service.js'
import { createPrismaBudgetRepository } from './budget/prisma-budget-repository.js'
import {
  FinancialDocumentError,
  createFinancialDocumentService,
  type FinancialDocumentService,
} from './financial/financial-document-service.js'
import { createPrismaFinancialDocumentRepository } from './financial/prisma-financial-document-repository.js'
import {
  HumanResourcesError,
  createHumanResourcesService,
  type HumanResourcesService,
} from './human-resources/human-resources-service.js'
import { createPrismaHumanResourcesRepository } from './human-resources/prisma-human-resources-repository.js'
import {
  PatrimonialAssetError,
  createPatrimonialAssetService,
  type PatrimonialAssetService,
} from './patrimonial/patrimonial-asset-service.js'
import { createPrismaPatrimonialAssetRepository } from './patrimonial/prisma-patrimonial-asset-repository.js'
import {
  ContractError,
  createContractService,
  type ContractService,
} from './contracts/contract-service.js'
import { createPrismaContractRepository } from './contracts/prisma-contract-repository.js'
import {
  CreateBudgetRecordRequestSchema,
  PublicBudgetRecordsSchema,
  UpdateBudgetRecordRequestSchema,
  CreateFinancialDocumentRequestSchema,
  UpdateFinancialDocumentRequestSchema,
  CreateHumanResourcesRequestSchema,
  UpdateHumanResourcesRequestSchema,
  PublicHumanResourcesPageSchema,
  CreatePatrimonialAssetRequestSchema,
  UpdatePatrimonialAssetRequestSchema,
  PublicPatrimonialPageSchema,
  CreateContractRecordRequestSchema,
  UpdateContractRecordRequestSchema,
  CreateSupplierRequestSchema,
  UpdateSupplierRequestSchema,
  PublicContractsPageSchema,
} from '@oab-transparencia/contracts/transparency'

type AppOptions = {
  authService?: AuthService
  generalDataService?: GeneralDataService
  reportsIndicatorsService?: ReportsIndicatorsService
  budgetService?: BudgetService
  financialDocumentService?: FinancialDocumentService
  humanResourcesService?: HumanResourcesService
  patrimonialAssetService?: PatrimonialAssetService
  contractService?: ContractService
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
    FORBIDDEN: [403, 'Apenas administradores podem gerenciar usuários.'],
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
  app.use(express.json())
  app.get('/api/public/contracts', async (_request, response, next) => {
    try {
      response.json(
        PublicContractsPageSchema.parse(
          await getContractService().listPublished(),
        ),
      )
    } catch (error) {
      next(error)
    }
  })
  app.get('/api/admin/contracts', async (request, response, next) => {
    try {
      await requireUser(request)
      response.json({ records: await getContractService().list() })
    } catch (error) {
      next(error)
    }
  })
  app.get('/api/admin/suppliers', async (request, response, next) => {
    try {
      await requireUser(request)
      response.json({ suppliers: await getContractService().listSuppliers() })
    } catch (error) {
      next(error)
    }
  })
  app.post('/api/admin/suppliers', async (request, response, next) => {
    try {
      await requireUser(request)
      const input = CreateSupplierRequestSchema.parse(request.body)
      response
        .status(201)
        .json(await getContractService().createSupplier(input))
    } catch (error) {
      next(error)
    }
  })
  app.delete('/api/admin/suppliers/:id', async (request, response, next) => {
    try {
      await requireUser(request)
      await getContractService().deleteSupplier(request.params.id)
      response.status(204).send()
    } catch (error) {
      next(error)
    }
  })
  app.patch('/api/admin/suppliers/:id', async (request, response, next) => {
    try {
      await requireUser(request)
      const input = UpdateSupplierRequestSchema.parse(request.body)
      response.json(
        await getContractService().updateSupplier(request.params.id, input),
      )
    } catch (error) {
      next(error)
    }
  })
  app.post('/api/admin/contracts', async (request, response, next) => {
    try {
      const user = await requireUser(request)
      const input = CreateContractRecordRequestSchema.parse(request.body)
      response
        .status(201)
        .json(await getContractService().create({ ...input, userId: user.id }))
    } catch (error) {
      next(error)
    }
  })
  app.patch('/api/admin/contracts/:id', async (request, response, next) => {
    try {
      const user = await requireUser(request)
      const input = UpdateContractRecordRequestSchema.parse(request.body)
      response.json(
        await getContractService().update(request.params.id, {
          ...input,
          userId: user.id,
        }),
      )
    } catch (error) {
      next(error)
    }
  })
  app.delete('/api/admin/contracts/:id', async (request, response, next) => {
    try {
      await requireUser(request)
      await getContractService().delete(request.params.id)
      response.status(204).send()
    } catch (error) {
      next(error)
    }
  })
  app.post(
    '/api/admin/contracts/:exercise/publish',
    async (request, response, next) => {
      try {
        const user = await requireUser(request)
        const exercise = ExerciseSchema.parse(Number(request.params.exercise))
        response.json(
          await getContractService().publishExercise(exercise, user.id),
        )
      } catch (error) {
        next(error)
      }
    },
  )

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
  let reportsIndicatorsService = options.reportsIndicatorsService
  function getReportsIndicatorsService() {
    reportsIndicatorsService ??= createReportsIndicatorsService(
      createPrismaReportsIndicatorsRepository(),
    )
    return reportsIndicatorsService
  }
  let budgetService = options.budgetService
  function getBudgetService() {
    budgetService ??= createBudgetService(createPrismaBudgetRepository())
    return budgetService
  }
  let financialDocumentService = options.financialDocumentService
  function getFinancialDocumentService() {
    financialDocumentService ??= createFinancialDocumentService(
      createPrismaFinancialDocumentRepository(),
    )
    return financialDocumentService
  }
  let humanResourcesService = options.humanResourcesService
  function getHumanResourcesService() {
    humanResourcesService ??= createHumanResourcesService(
      createPrismaHumanResourcesRepository(),
    )
    return humanResourcesService
  }
  let patrimonialAssetService = options.patrimonialAssetService
  function getPatrimonialAssetService() {
    patrimonialAssetService ??= createPatrimonialAssetService(
      createPrismaPatrimonialAssetRepository(),
    )
    return patrimonialAssetService
  }
  let contractService = options.contractService
  function getContractService() {
    contractService ??= createContractService(createPrismaContractRepository())
    return contractService
  }

  async function requireUser(request: Request) {
    const token = readBearerToken(request.headers.authorization)
    if (!token) throw new AuthenticationError('UNAUTHENTICATED')
    return getAuthService().getAuthenticatedUser(token)
  }

  async function requireAdmin(request: Request) {
    const user = await requireUser(request)
    if (user.role !== 'ADMIN') throw new AuthenticationError('FORBIDDEN')
    return user
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

  app.get('/api/admin/users', async (request, response, next) => {
    try {
      await requireAdmin(request)
      response.json({ users: await getAuthService().listUsers() })
    } catch (error) {
      next(error)
    }
  })

  app.post('/api/admin/users', async (request, response, next) => {
    try {
      await requireAdmin(request)
      const input = AdminCreateUserRequestSchema.parse(request.body)
      const user = await getAuthService().createUserByAdmin(input)
      response.status(201).json(
        AdminCreatedUserResponseSchema.parse({
          user,
          temporaryPassword: input.password,
        }),
      )
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

  app.get('/api/public/reports', async (_request, response, next) => {
    try {
      response.json(
        PublicReportsPageSchema.parse(
          await getReportsIndicatorsService().listPublished(),
        ),
      )
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/admin/reports', async (request, response, next) => {
    try {
      await requireUser(request)
      response.json({ indicators: await getReportsIndicatorsService().list() })
    } catch (error) {
      next(error)
    }
  })

  app.post('/api/admin/reports', async (request, response, next) => {
    try {
      const user = await requireUser(request)
      const input = CreateReportsIndicatorRequestSchema.parse(request.body)
      response
        .status(201)
        .json(
          await getReportsIndicatorsService().create({
            ...input,
            userId: user.id,
          }),
        )
    } catch (error) {
      next(error)
    }
  })

  app.patch('/api/admin/reports/:id', async (request, response, next) => {
    try {
      const user = await requireUser(request)
      const input = UpdateReportsIndicatorRequestSchema.parse(request.body)
      response.json(
        await getReportsIndicatorsService().update(request.params.id, {
          ...input,
          userId: user.id,
        }),
      )
    } catch (error) {
      next(error)
    }
  })

  app.delete('/api/admin/reports/:id', async (request, response, next) => {
    try {
      await requireUser(request)
      await getReportsIndicatorsService().delete(request.params.id)
      response.status(204).send()
    } catch (error) {
      next(error)
    }
  })

  app.post(
    '/api/admin/reports/:exercise/publish',
    async (request, response, next) => {
      try {
        const user = await requireUser(request)
        response.json(
          await getReportsIndicatorsService().publish(
            ExerciseSchema.parse(Number(request.params.exercise)),
            user.id,
          ),
        )
      } catch (error) {
        next(error)
      }
    },
  )

  app.get('/api/admin/human-resources', async (request, response, next) => {
    try {
      await requireUser(request)
      response.json({ records: await getHumanResourcesService().list() })
    } catch (error) {
      next(error)
    }
  })
  app.get('/api/public/human-resources', async (_request, response, next) => {
    try {
      response.json(
        PublicHumanResourcesPageSchema.parse(
          await getHumanResourcesService().listPublished(),
        ),
      )
    } catch (error) {
      next(error)
    }
  })
  app.post('/api/admin/human-resources', async (request, response, next) => {
    try {
      const user = await requireUser(request)
      const input = CreateHumanResourcesRequestSchema.parse(request.body)
      response.status(201).json(
        await getHumanResourcesService().create({
          ...input,
          userId: user.id,
        }),
      )
    } catch (error) {
      next(error)
    }
  })
  app.patch(
    '/api/admin/human-resources/:id',
    async (request, response, next) => {
      try {
        const user = await requireUser(request)
        const input = UpdateHumanResourcesRequestSchema.parse(request.body)
        response.json(
          await getHumanResourcesService().update(request.params.id, {
            ...input,
            userId: user.id,
          }),
        )
      } catch (error) {
        next(error)
      }
    },
  )
  app.delete(
    '/api/admin/human-resources/:id',
    async (request, response, next) => {
      try {
        await requireUser(request)
        await getHumanResourcesService().delete(request.params.id)
        response.status(204).send()
      } catch (error) {
        next(error)
      }
    },
  )
  app.post(
    '/api/admin/human-resources/:exercise/publish',
    async (request, response, next) => {
      try {
        const user = await requireUser(request)
        const exercise = ExerciseSchema.parse(Number(request.params.exercise))
        response.json(
          await getHumanResourcesService().publishExercise(exercise, user.id),
        )
      } catch (error) {
        next(error)
      }
    },
  )

  app.get('/api/public/budget', async (request, response, next) => {
    try {
      const exercise = request.query.exercise
        ? ExerciseSchema.parse(Number(request.query.exercise))
        : undefined
      const type =
        typeof request.query.informationType === 'string'
          ? request.query.informationType
          : undefined
      response.json(
        PublicBudgetRecordsSchema.parse(
          await getBudgetService().getPublished(exercise, type),
        ),
      )
    } catch (error) {
      next(error)
    }
  })
  app.get('/api/admin/budget', async (request, response, next) => {
    try {
      await requireUser(request)
      response.json({ records: await getBudgetService().list() })
    } catch (error) {
      next(error)
    }
  })
  app.post('/api/admin/budget', async (request, response, next) => {
    try {
      const user = await requireUser(request)
      const input = CreateBudgetRecordRequestSchema.parse(request.body)
      response
        .status(201)
        .json(await getBudgetService().create({ ...input, userId: user.id }))
    } catch (error) {
      next(error)
    }
  })
  app.patch('/api/admin/budget/:id', async (request, response, next) => {
    try {
      const user = await requireUser(request)
      const input = UpdateBudgetRecordRequestSchema.parse(request.body)
      response.json(
        await getBudgetService().update(request.params.id, {
          ...input,
          userId: user.id,
        }),
      )
    } catch (error) {
      next(error)
    }
  })
  app.post(
    '/api/admin/budget/:exercise/publish',
    async (request, response, next) => {
      try {
        const user = await requireUser(request)
        const exercise = ExerciseSchema.parse(Number(request.params.exercise))
        response.json(
          await getBudgetService().publishExercise(exercise, user.id),
        )
      } catch (error) {
        next(error)
      }
    },
  )

  app.get('/api/admin/financial', async (request, response, next) => {
    try {
      await requireUser(request)
      response.json({ records: await getFinancialDocumentService().list() })
    } catch (error) {
      next(error)
    }
  })
  app.get('/api/public/financial', async (_request, response, next) => {
    try {
      response.json(await getFinancialDocumentService().listPublished())
    } catch (error) {
      next(error)
    }
  })
  app.post('/api/admin/financial', async (request, response, next) => {
    try {
      const user = await requireUser(request)
      const input = CreateFinancialDocumentRequestSchema.parse(request.body)
      response.status(201).json(
        await getFinancialDocumentService().create({
          ...input,
          userId: user.id,
        }),
      )
    } catch (error) {
      next(error)
    }
  })
  app.patch('/api/admin/financial/:id', async (request, response, next) => {
    try {
      const user = await requireUser(request)
      const input = UpdateFinancialDocumentRequestSchema.parse(request.body)
      response.json(
        await getFinancialDocumentService().update(request.params.id, {
          ...input,
          userId: user.id,
        }),
      )
    } catch (error) {
      next(error)
    }
  })
  app.post(
    '/api/admin/financial/:exercise/publish',
    async (request, response, next) => {
      try {
        const user = await requireUser(request)
        const exercise = ExerciseSchema.parse(Number(request.params.exercise))
        response.json(
          await getFinancialDocumentService().publishExercise(
            exercise,
            user.id,
          ),
        )
      } catch (error) {
        next(error)
      }
    },
  )

  app.get('/api/public/patrimonial', async (_request, response, next) => {
    try {
      response.json(
        PublicPatrimonialPageSchema.parse(
          await getPatrimonialAssetService().listPublished(),
        ),
      )
    } catch (error) {
      next(error)
    }
  })
  app.get('/api/admin/patrimonial', async (request, response, next) => {
    try {
      await requireUser(request)
      response.json({ records: await getPatrimonialAssetService().list() })
    } catch (error) {
      next(error)
    }
  })
  app.post('/api/admin/patrimonial', async (request, response, next) => {
    try {
      const user = await requireUser(request)
      const input = CreatePatrimonialAssetRequestSchema.parse(request.body)
      response.status(201).json(
        await getPatrimonialAssetService().create({
          ...input,
          userId: user.id,
        }),
      )
    } catch (error) {
      next(error)
    }
  })
  app.patch('/api/admin/patrimonial/:id', async (request, response, next) => {
    try {
      const user = await requireUser(request)
      const input = UpdatePatrimonialAssetRequestSchema.parse(request.body)
      response.json(
        await getPatrimonialAssetService().update(request.params.id, {
          ...input,
          userId: user.id,
        }),
      )
    } catch (error) {
      next(error)
    }
  })
  app.post(
    '/api/admin/patrimonial/:exercise/publish',
    async (request, response, next) => {
      try {
        const user = await requireUser(request)
        const exercise = ExerciseSchema.parse(Number(request.params.exercise))
        response.json(
          await getPatrimonialAssetService().publishExercise(exercise, user.id),
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
      if (error instanceof ReportsIndicatorsError) {
        const messages = {
          REPORTS_INDICATOR_ALREADY_EXISTS:
            'Já existe um cadastro de indicadores para este exercício.',
          REPORTS_INDICATOR_NOT_FOUND:
            'Cadastro de indicadores não encontrado.',
          REPORTS_INDICATOR_EXERCISE_NOT_FOUND:
            'Nenhum cadastro de indicadores encontrado para este exercício.',
        } as const
        response
          .status(error.code === 'REPORTS_INDICATOR_ALREADY_EXISTS' ? 409 : 404)
          .json({ message: messages[error.code] })
        return
      }
      if (error instanceof BudgetError) {
        const messages = {
          BUDGET_RECORD_ALREADY_EXISTS:
            'Já existe um registro para este tipo e exercício.',
          BUDGET_RECORD_NOT_FOUND: 'Registro orçamentário não encontrado.',
          BUDGET_EXERCISE_NOT_FOUND:
            'Nenhum registro orçamentário encontrado para este exercício.',
        } as const
        const status = error.code === 'BUDGET_RECORD_ALREADY_EXISTS' ? 409 : 404
        response.status(status).json({ message: messages[error.code] })
        return
      }
      if (error instanceof FinancialDocumentError) {
        const messages = {
          FINANCIAL_DOCUMENT_ALREADY_EXISTS:
            'Já existe um documento para este tipo e exercício.',
          FINANCIAL_DOCUMENT_NOT_FOUND: 'Documento financeiro não encontrado.',
          FINANCIAL_EXERCISE_NOT_FOUND:
            'Nenhum documento financeiro encontrado para este exercício.',
        } as const
        const status =
          error.code === 'FINANCIAL_DOCUMENT_ALREADY_EXISTS' ? 409 : 404
        response.status(status).json({ message: messages[error.code] })
        return
      }
      if (error instanceof HumanResourcesError) {
        const messages = {
          HUMAN_RESOURCES_ALREADY_EXISTS:
            'Já existe um cadastro de recursos humanos para este exercício e localidade.',
          HUMAN_RESOURCES_NOT_FOUND:
            'Cadastro de recursos humanos não encontrado.',
          HUMAN_RESOURCES_EXERCISE_NOT_FOUND:
            'Nenhum cadastro de recursos humanos encontrado para este exercício.',
        } as const
        response
          .status(error.code === 'HUMAN_RESOURCES_ALREADY_EXISTS' ? 409 : 404)
          .json({ message: messages[error.code] })
        return
      }
      if (error instanceof PatrimonialAssetError) {
        const messages = {
          PATRIMONIAL_ASSET_ALREADY_EXISTS:
            'Já existe um bem patrimonial com esse tipo, descrição e exercício.',
          PATRIMONIAL_ASSET_NOT_FOUND: 'Bem patrimonial não encontrado.',
          PATRIMONIAL_EXERCISE_NOT_FOUND:
            'Nenhum bem patrimonial encontrado para este exercício.',
        } as const
        const status =
          error.code === 'PATRIMONIAL_ASSET_ALREADY_EXISTS' ? 409 : 404
        response.status(status).json({ message: messages[error.code] })
        return
      }
      if (error instanceof ContractError) {
        const messages = {
          CONTRACT_ALREADY_EXISTS:
            'Já existe um contrato para este fornecedor, data e exercício.',
          CONTRACT_NOT_FOUND: 'Contrato não encontrado.',
          CONTRACT_EXERCISE_NOT_FOUND:
            'Nenhum contrato encontrado para este exercício.',
          SUPPLIER_ALREADY_EXISTS: 'Este CNPJ já está cadastrado.',
        } as const
        response
          .status(
            error.code === 'CONTRACT_ALREADY_EXISTS' ||
              error.code === 'SUPPLIER_ALREADY_EXISTS'
              ? 409
              : 404,
          )
          .json({ message: messages[error.code] })
        return
      }

      response.status(500).json({ message: 'Erro interno do servidor.' })
    },
  )

  return app
}

// A Vercel detecta este export como uma aplicação Express e a empacota em uma Function.
export default createApp()
