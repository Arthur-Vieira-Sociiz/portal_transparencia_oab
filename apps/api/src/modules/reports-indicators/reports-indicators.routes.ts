import { Router, type Router as ExpressRouter } from 'express'
import {
  createReportsIndicatorsController,
  type ReportsIndicatorsControllerDependencies,
} from './reports-indicators.controller.js'

export function createReportsIndicatorsRoutes(
  dependencies: ReportsIndicatorsControllerDependencies,
): ExpressRouter {
  const routes = Router()
  const controller = createReportsIndicatorsController(dependencies)

  routes.get('/api/public/reports', controller.listPublished)
  routes.get('/api/admin/reports', controller.list)
  routes.post('/api/admin/reports', controller.create)
  routes.patch('/api/admin/reports/:id', controller.update)
  routes.delete('/api/admin/reports/:id', controller.delete)
  routes.post('/api/admin/reports/:exercise/publish', controller.publish)

  return routes
}
