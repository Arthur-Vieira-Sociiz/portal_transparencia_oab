import {
  AdminCreateUserRequestSchema,
  AdminCreatedUserResponseSchema,
  LoginRequestSchema,
  RegisterRequestSchema,
} from '@oab-transparencia/contracts/auth'
import type { RequestHandler } from 'express'
import { AuthenticationError, type AuthService } from './auth-service.js'
import { readBearerToken } from './bearer-token.js'
import type { RequireUser } from '../../middlewares/require-user.js'
import { PaginationQuerySchema } from '../../http/request-schemas.js'

export type AuthControllerDependencies = {
  getAuthService: () => AuthService
  requireUser: RequireUser
  requireAdmin: RequireUser
}

export type AuthController = {
  register: RequestHandler
  login: RequestHandler
  me: RequestHandler
  logout: RequestHandler
  listUsers: RequestHandler
  createUser: RequestHandler
}

export function createAuthController({
  getAuthService,
  requireUser,
  requireAdmin,
}: AuthControllerDependencies): AuthController {
  return {
    async register(request, response, next) {
      try {
        const input = RegisterRequestSchema.parse(request.body)
        const session = await getAuthService().register(input)
        response.status(201).json(session)
      } catch (error) {
        next(error)
      }
    },

    async login(request, response, next) {
      try {
        const input = LoginRequestSchema.parse(request.body)
        response.json(await getAuthService().login(input))
      } catch (error) {
        next(error)
      }
    },

    async me(request, response, next) {
      try {
        response.json({ user: await requireUser(request) })
      } catch (error) {
        next(error)
      }
    },

    async logout(request, response, next) {
      try {
        const token = readBearerToken(request.headers.authorization)
        if (!token) throw new AuthenticationError('UNAUTHENTICATED')

        await getAuthService().logout(token)
        response.status(204).send()
      } catch (error) {
        next(error)
      }
    },

    async listUsers(request, response, next) {
      try {
        await requireAdmin(request)
        const pagination = PaginationQuerySchema.parse(request.query)
        const result = await getAuthService().listUsers(pagination)
        response.json({ users: result.items, pagination: result.pagination })
      } catch (error) {
        next(error)
      }
    },

    async createUser(request, response, next) {
      try {
        await requireAdmin(request)
        const input = AdminCreateUserRequestSchema.parse(request.body)
        const user = await getAuthService().createUserByAdmin(input)
        response.status(201).json(
          AdminCreatedUserResponseSchema.parse({
            user,
            temporaryPassword: input.password,
          }),
        )
      } catch (error) {
        next(error)
      }
    },
  }
}
