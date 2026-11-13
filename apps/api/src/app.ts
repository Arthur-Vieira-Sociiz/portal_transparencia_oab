import express, { type Express } from 'express'
import helmet from 'helmet'
import type { AuthService } from './modules/auth/auth-service.js'
import { createPrismaAuthService } from './modules/auth/prisma-auth-service.js'
import {
  createGeneralDataService,
  type GeneralDataService,
} from './modules/general-data/general-data-service.js'
import { createPrismaGeneralDataRepository } from './modules/general-data/prisma-general-data-repository.js'
import {
  createReportsIndicatorsService,
  type ReportsIndicatorsService,
} from './modules/reports-indicators/reports-indicators-service.js'
import { createPrismaReportsIndicatorsRepository } from './modules/reports-indicators/prisma-reports-indicators-repository.js'
import {
  createBudgetService,
  type BudgetService,
} from './modules/budget/budget-service.js'
import { createPrismaBudgetRepository } from './modules/budget/prisma-budget-repository.js'
import {
  createFinancialDocumentService,
  type FinancialDocumentService,
} from './modules/financial/financial-document-service.js'
import { createPrismaFinancialDocumentRepository } from './modules/financial/prisma-financial-document-repository.js'
import {
  createHumanResourcesService,
  type HumanResourcesService,
} from './modules/human-resources/human-resources-service.js'
import { createPrismaHumanResourcesRepository } from './modules/human-resources/prisma-human-resources-repository.js'
import {
  createPatrimonialAssetService,
  type PatrimonialAssetService,
} from './modules/patrimonial/patrimonial-asset-service.js'
import { createPrismaPatrimonialAssetRepository } from './modules/patrimonial/prisma-patrimonial-asset-repository.js'
import {
  createContractService,
  type ContractService,
} from './modules/contracts/contract-service.js'
import { createPrismaContractRepository } from './modules/contracts/prisma-contract-repository.js'
import { errorHandler, notFoundHandler } from './errors/error-handlers.js'
import { createCorsMiddleware } from './middlewares/cors.js'
import { noStoreAuthenticatedResponses } from './middlewares/no-store.js'
import {
  createAuthenticatedAdminRateLimit,
  createLoginRateLimit,
  createRegisterRateLimit,
} from './middlewares/rate-limit.js'
import { createRequireAdmin } from './middlewares/require-admin.js'
import { createRequirePermission } from './middlewares/require-permission.js'
import { createRequireUser } from './middlewares/require-user.js'
import { createRequestLogger } from './middlewares/request-logger.js'
import { createAuthRoutes } from './modules/auth/auth.routes.js'
import { createBudgetRoutes } from './modules/budget/budget.routes.js'
import { createContractsRoutes } from './modules/contracts/contracts.routes.js'
import { createFinancialRoutes } from './modules/financial/financial.routes.js'
import { createGeneralDataRoutes } from './modules/general-data/general-data.routes.js'
import { healthRoutes } from './modules/health/health.routes.js'
import { createHumanResourcesRoutes } from './modules/human-resources/human-resources.routes.js'
import { createPatrimonialRoutes } from './modules/patrimonial/patrimonial.routes.js'
import { createReportsIndicatorsRoutes } from './modules/reports-indicators/reports-indicators.routes.js'

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
  app.use(createRequestLogger())
  app.use(express.json())
  app.use(createCorsMiddleware())
  app.use(noStoreAuthenticatedResponses)

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
  const requirePermission = createRequirePermission(requireUser)
  const requireAdmin = createRequireAdmin(requirePermission)
  const loginRateLimit = createLoginRateLimit()
  const registerRateLimit = createRegisterRateLimit()
  const adminRateLimit = createAuthenticatedAdminRateLimit({
    getAuthService,
    requireUser,
  })

  app.use(healthRoutes)
  app.use('/api/admin', ...adminRateLimit)
  app.use(
    createAuthRoutes({
      getAuthService,
      requireUser,
      requireAdmin,
      loginRateLimit,
      registerRateLimit,
    }),
  )
  app.use(createGeneralDataRoutes({ getGeneralDataService, requirePermission }))
  app.use(
    createReportsIndicatorsRoutes({
      getReportsIndicatorsService,
      requirePermission,
    }),
  )

  app.use(
    createHumanResourcesRoutes({
      getHumanResourcesService,
      requirePermission,
    }),
  )
  app.use(createBudgetRoutes({ getBudgetService, requirePermission }))
  app.use(
    createFinancialRoutes({ getFinancialDocumentService, requirePermission }),
  )
  app.use(
    createPatrimonialRoutes({ getPatrimonialAssetService, requirePermission }),
  )
  app.use(createContractsRoutes({ getContractService, requirePermission }))

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

// A Vercel detecta este export como uma aplicação Express e a empacota em uma Function.
export default createApp()
