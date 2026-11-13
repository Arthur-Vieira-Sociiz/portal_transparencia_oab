import { Router, type Router as ExpressRouter } from 'express'
import {
  createHumanResourcesController,
  type HumanResourcesControllerDependencies,
} from './human-resources.controller.js'

export function createHumanResourcesRoutes(
  dependencies: HumanResourcesControllerDependencies,
): ExpressRouter {
  const routes = Router()
  const controller = createHumanResourcesController(dependencies)

  routes.get('/api/admin/human-resources', controller.list)
  routes.get('/api/public/human-resources', controller.listPublished)
  routes.post('/api/admin/human-resources', controller.create)
  routes.patch('/api/admin/human-resources/:id', controller.update)
  routes.delete('/api/admin/human-resources/:id', controller.delete)
  routes.post(
    '/api/admin/human-resources/:exercise/publish',
    controller.publish,
  )

  return routes
}
