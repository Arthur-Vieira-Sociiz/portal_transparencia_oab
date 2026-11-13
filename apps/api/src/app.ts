import express, { type Express } from 'express'
import helmet from 'helmet'
import type { AuthService } from './features/auth/auth-service.js'
import { createPrismaAuthService } from './features/auth/prisma-auth-service.js'
import {
  createGeneralDataService,
  type GeneralDataService,
} from './features/general-data/general-data-service.js'
import { createPrismaGeneralDataRepository } from './features/general-data/prisma-general-data-repository.js'
import {
  createReportsIndicatorsService,
  type ReportsIndicatorsService,
} from './features/reports-indicators/reports-indicators-service.js'
import { createPrismaReportsIndicatorsRepository } from './features/reports-indicators/prisma-reports-indicators-repository.js'
import {
  createBudgetService,
  type BudgetService,
} from './features/budget/budget-service.js'
import { createPrismaBudgetRepository } from './features/budget/prisma-budget-repository.js'
import {
  createFinancialDocumentService,
  type FinancialDocumentService,
} from './features/financial/financial-document-service.js'
import { createPrismaFinancialDocumentRepository } from './features/financial/prisma-financial-document-repository.js'
import {
  createHumanResourcesService,
  type HumanResourcesService,
} from './features/human-resources/human-resources-service.js'
import { createPrismaHumanResourcesRepository } from './features/human-resources/prisma-human-resources-repository.js'
import {
  createPatrimonialAssetService,
  type PatrimonialAssetService,
} from './features/patrimonial/patrimonial-asset-service.js'
import { createPrismaPatrimonialAssetRepository } from './features/patrimonial/prisma-patrimonial-asset-repository.js'
import {
  createContractService,
  type ContractService,
} from './features/contracts/contract-service.js'
import { createPrismaContractRepository } from './features/contracts/prisma-contract-repository.js'
import { errorHandler } from './errors/error-handlers.js'
import { createCorsMiddleware } from './middlewares/cors.js'
import { createRequireAdmin } from './middlewares/require-admin.js'
import { createRequireUser } from './middlewares/require-user.js'
import { createAuthRoutes } from './features/auth/auth.routes.js'
import { createBudgetRoutes } from './features/budget/budget.routes.js'
import { createContractsRoutes } from './features/contracts/contracts.routes.js'
import { createFinancialRoutes } from './features/financial/financial.routes.js'
import { createGeneralDataRoutes } from './features/general-data/general-data.routes.js'
import { healthRoutes } from './features/health/health.routes.js'
import { createHumanResourcesRoutes } from './features/human-resources/human-resources.routes.js'
import { createPatrimonialRoutes } from './features/patrimonial/patrimonial.routes.js'
import { createReportsIndicatorsRoutes } from './features/reports-indicators/reports-indicators.routes.js'

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
