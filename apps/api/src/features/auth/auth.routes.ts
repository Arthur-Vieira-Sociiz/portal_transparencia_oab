import { Router, type Router as ExpressRouter } from 'express'
import {
  createAuthController,
  type AuthControllerDependencies,
} from './auth.controller.js'

export function createAuthRoutes(
  dependencies: AuthControllerDependencies,
): ExpressRouter {
  const routes = Router()
  const controller = createAuthController(dependencies)

  routes.post('/api/auth/register', controller.register)
  routes.post('/api/auth/login', controller.login)
  routes.get('/api/auth/me', controller.me)
  routes.post('/api/auth/logout', controller.logout)
  routes.get('/api/admin/users', controller.listUsers)
  routes.post('/api/admin/users', controller.createUser)

  return routes
}
