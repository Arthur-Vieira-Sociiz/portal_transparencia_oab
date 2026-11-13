import { Router, type Router as ExpressRouter } from 'express'
import type { RequestHandler } from 'express'
import {
  createAuthController,
  type AuthControllerDependencies,
} from './auth.controller.js'

type AuthRoutesDependencies = AuthControllerDependencies & {
  loginRateLimit: RequestHandler
  registerRateLimit: RequestHandler
}

export function createAuthRoutes({
  loginRateLimit,
  registerRateLimit,
  ...controllerDependencies
}: AuthRoutesDependencies): ExpressRouter {
  const routes = Router()
  const controller = createAuthController(controllerDependencies)

  routes.post('/api/auth/register', registerRateLimit, controller.register)
  routes.post('/api/auth/login', loginRateLimit, controller.login)
  routes.get('/api/auth/me', controller.me)
  routes.post('/api/auth/logout', controller.logout)
  routes.get('/api/admin/users', controller.listUsers)
  routes.post('/api/admin/users', controller.createUser)

  return routes
}
