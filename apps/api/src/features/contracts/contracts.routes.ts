import { Router, type Router as ExpressRouter } from 'express'
import {
  createContractsController,
  type ContractsControllerDependencies,
} from './contracts.controller.js'

export function createContractsRoutes(
  dependencies: ContractsControllerDependencies,
): ExpressRouter {
  const routes = Router()
  const controller = createContractsController(dependencies)

  routes.get('/api/public/contracts', controller.listPublished)
  routes.get('/api/admin/contracts', controller.list)
  routes.get('/api/admin/suppliers', controller.listSuppliers)
  routes.post('/api/admin/suppliers', controller.createSupplier)
  routes.delete('/api/admin/suppliers/:id', controller.deleteSupplier)
  routes.patch('/api/admin/suppliers/:id', controller.updateSupplier)
  routes.post('/api/admin/contracts', controller.create)
  routes.patch('/api/admin/contracts/:id', controller.update)
  routes.delete('/api/admin/contracts/:id', controller.delete)
  routes.post('/api/admin/contracts/:exercise/publish', controller.publish)

  return routes
}
