import { Router, type Router as ExpressRouter } from 'express'
import {
  createFinancialController,
  type FinancialControllerDependencies,
} from './financial.controller.js'

export function createFinancialRoutes(
  dependencies: FinancialControllerDependencies,
): ExpressRouter {
  const routes = Router()
  const controller = createFinancialController(dependencies)

  routes.get('/api/admin/financial', controller.list)
  routes.get('/api/public/financial', controller.listPublished)
  routes.post('/api/admin/financial', controller.create)
  routes.patch('/api/admin/financial/:id', controller.update)
  routes.post('/api/admin/financial/:exercise/publish', controller.publish)

  return routes
}
