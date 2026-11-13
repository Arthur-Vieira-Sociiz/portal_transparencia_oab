import { Router, type Router as ExpressRouter } from 'express'
import {
  createPatrimonialController,
  type PatrimonialControllerDependencies,
} from './patrimonial.controller.js'

export function createPatrimonialRoutes(
  dependencies: PatrimonialControllerDependencies,
): ExpressRouter {
  const routes = Router()
  const controller = createPatrimonialController(dependencies)

  routes.get('/api/public/patrimonial', controller.listPublished)
  routes.get('/api/admin/patrimonial', controller.list)
  routes.post('/api/admin/patrimonial', controller.create)
  routes.patch('/api/admin/patrimonial/:id', controller.update)
  routes.post('/api/admin/patrimonial/:exercise/publish', controller.publish)

  return routes
}
