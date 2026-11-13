import {
  CreateGeneralDataRequestSchema,
  UpdateGeneralDataRequestSchema,
  CreateReportsIndicatorRequestSchema,
  UpdateReportsIndicatorRequestSchema,
  PublicReportsPageSchema,
} from '@oab-transparencia/contracts/transparency'
import { ExerciseSchema } from '@oab-transparencia/contracts/common'
import express, { type Express } from 'express'
import helmet from 'helmet'
import type { AuthService } from './auth/auth-service.js'
import { createPrismaAuthService } from './auth/prisma-auth-service.js'
import {
  createGeneralDataService,
  type GeneralDataService,
} from './general-data/general-data-service.js'
import { createPrismaGeneralDataRepository } from './general-data/prisma-general-data-repository.js'
import {
  createReportsIndicatorsService,
  type ReportsIndicatorsService,
} from './reports-indicators/reports-indicators-service.js'
import { createPrismaReportsIndicatorsRepository } from './reports-indicators/prisma-reports-indicators-repository.js'
import {
  createBudgetService,
  type BudgetService,
} from './budget/budget-service.js'
import { createPrismaBudgetRepository } from './budget/prisma-budget-repository.js'
import {
  createFinancialDocumentService,
  type FinancialDocumentService,
} from './financial/financial-document-service.js'
import { createPrismaFinancialDocumentRepository } from './financial/prisma-financial-document-repository.js'
import {
  createHumanResourcesService,
  type HumanResourcesService,
} from './human-resources/human-resources-service.js'
import { createPrismaHumanResourcesRepository } from './human-resources/prisma-human-resources-repository.js'
import {
  createPatrimonialAssetService,
  type PatrimonialAssetService,
} from './patrimonial/patrimonial-asset-service.js'
import { createPrismaPatrimonialAssetRepository } from './patrimonial/prisma-patrimonial-asset-repository.js'
import {
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
import { errorHandler } from './errors/error-handlers.js'
import { createCorsMiddleware } from './middlewares/cors.js'
import { createRequireAdmin } from './middlewares/require-admin.js'
import { createRequireUser } from './middlewares/require-user.js'
import { createAuthRoutes } from './routes/auth/auth.routes.js'
import { healthRoutes } from './routes/health/health.routes.js'

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

export function createApp(options: AppOptions = {}): Express {
  const app = express()

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

  app.use(createCorsMiddleware())
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

  const requireUser = createRequireUser(getAuthService)
  const requireAdmin = createRequireAdmin(requireUser)

  app.use(healthRoutes)
  app.use(createAuthRoutes({ getAuthService, requireUser, requireAdmin }))

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

  app.use(errorHandler)

  return app
}

// A Vercel detecta este export como uma aplicação Express e a empacota em uma Function.
export default createApp()
