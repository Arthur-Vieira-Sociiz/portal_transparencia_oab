import { Router, type Router as ExpressRouter } from 'express'
import {
  createGeneralDataController,
  type GeneralDataControllerDependencies,
} from './general-data.controller.js'

export function createGeneralDataRoutes(
  dependencies: GeneralDataControllerDependencies,
): ExpressRouter {
  const routes = Router()
  const controller = createGeneralDataController(dependencies)

  routes.get('/api/public/general-data', controller.getPublished)
  routes.get('/api/admin/general-data', controller.list)
  routes.post('/api/admin/general-data', controller.create)
  routes.patch('/api/admin/general-data/:id', controller.update)
  routes.post('/api/admin/general-data/:id/publish', controller.publish)

  return routes
}
