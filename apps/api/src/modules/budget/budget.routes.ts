import { Router, type Router as ExpressRouter } from 'express'
import {
  createBudgetController,
  type BudgetControllerDependencies,
} from './budget.controller.js'

export function createBudgetRoutes(
  dependencies: BudgetControllerDependencies,
): ExpressRouter {
  const routes = Router()
  const controller = createBudgetController(dependencies)

  routes.get('/api/public/budget', controller.listPublished)
  routes.get('/api/admin/budget', controller.list)
  routes.post('/api/admin/budget', controller.create)
  routes.patch('/api/admin/budget/:id', controller.update)
  routes.post('/api/admin/budget/:exercise/publish', controller.publish)

  return routes
}
