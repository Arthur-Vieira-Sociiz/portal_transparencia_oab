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
import { errorHandler } from './errors/error-handlers.js'
import { createCorsMiddleware } from './middlewares/cors.js'
import { createRequireAdmin } from './middlewares/require-admin.js'
import { createRequireUser } from './middlewares/require-user.js'
import { createAuthRoutes } from './routes/auth/auth.routes.js'
import { createBudgetRoutes } from './routes/budget/budget.routes.js'
import { createContractsRoutes } from './routes/contracts/contracts.routes.js'
import { createFinancialRoutes } from './routes/financial/financial.routes.js'
import { createGeneralDataRoutes } from './routes/general-data/general-data.routes.js'
import { healthRoutes } from './routes/health/health.routes.js'
import { createHumanResourcesRoutes } from './routes/human-resources/human-resources.routes.js'
import { createPatrimonialRoutes } from './routes/patrimonial/patrimonial.routes.js'
import { createReportsIndicatorsRoutes } from './routes/reports-indicators/reports-indicators.routes.js'

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
  app.use(createGeneralDataRoutes({ getGeneralDataService, requireUser }))
  app.use(
    createReportsIndicatorsRoutes({
      getReportsIndicatorsService,
      requireUser,
    }),
  )

  app.use(createHumanResourcesRoutes({ getHumanResourcesService, requireUser }))
  app.use(createBudgetRoutes({ getBudgetService, requireUser }))
  app.use(createFinancialRoutes({ getFinancialDocumentService, requireUser }))
  app.use(createPatrimonialRoutes({ getPatrimonialAssetService, requireUser }))
  app.use(createContractsRoutes({ getContractService, requireUser }))

  app.use(errorHandler)

  return app
}

// A Vercel detecta este export como uma aplicação Express e a empacota em uma Function.
export default createApp()
