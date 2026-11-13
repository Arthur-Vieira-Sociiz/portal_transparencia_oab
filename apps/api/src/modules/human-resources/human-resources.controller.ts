import {
  CreateHumanResourcesRequestSchema,
  PublicHumanResourcesPageSchema,
  UpdateHumanResourcesRequestSchema,
} from '@oab-transparencia/contracts/transparency'
import type { RequestHandler } from 'express'
import {
  ExerciseParamsSchema,
  IdParamsSchema,
  PaginationQuerySchema,
  type ExerciseParams,
  type IdParams,
} from '../../http/request-schemas.js'
import type { HumanResourcesService } from './human-resources-service.js'
import type { RequirePermission } from '../../middlewares/require-permission.js'

export type HumanResourcesControllerDependencies = {
  getHumanResourcesService: () => HumanResourcesService
  requirePermission: RequirePermission
}

export type HumanResourcesController = {
  list: RequestHandler
  listPublished: RequestHandler
  create: RequestHandler
  update: RequestHandler<IdParams>
  delete: RequestHandler<IdParams>
  publish: RequestHandler<ExerciseParams>
}

export function createHumanResourcesController({
  getHumanResourcesService,
  requirePermission,
}: HumanResourcesControllerDependencies): HumanResourcesController {
  return {
    async list(request, response, next) {
      try {
        await requirePermission(request, 'CONTENT_READ')
        const pagination = PaginationQuerySchema.parse(request.query)
        const result = await getHumanResourcesService().list(pagination)
        response.json({ records: result.items, pagination: result.pagination })
      } catch (error) {
        next(error)
      }
    },

    async listPublished(_request, response, next) {
      try {
        response.json(
          PublicHumanResourcesPageSchema.parse(
            await getHumanResourcesService().listPublished(),
          ),
        )
      } catch (error) {
        next(error)
      }
    },

    async create(request, response, next) {
      try {
        const user = await requirePermission(request, 'CONTENT_WRITE')
        const input = CreateHumanResourcesRequestSchema.parse(request.body)
        response.status(201).json(
          await getHumanResourcesService().create({
            ...input,
            userId: user.id,
          }),
        )
      } catch (error) {
        next(error)
      }
    },

    async update(request, response, next) {
      try {
        const user = await requirePermission(request, 'CONTENT_WRITE')
        const { id } = IdParamsSchema.parse(request.params)
        const input = UpdateHumanResourcesRequestSchema.parse(request.body)
        response.json(
          await getHumanResourcesService().update(id, {
            ...input,
            userId: user.id,
          }),
        )
      } catch (error) {
        next(error)
      }
    },

    async delete(request, response, next) {
      try {
        await requirePermission(request, 'CONTENT_WRITE')
        const { id } = IdParamsSchema.parse(request.params)
        await getHumanResourcesService().delete(id)
        response.status(204).send()
      } catch (error) {
        next(error)
      }
    },

    async publish(request, response, next) {
      try {
        const user = await requirePermission(request, 'CONTENT_PUBLISH')
        const { exercise } = ExerciseParamsSchema.parse(request.params)
        response.json(
          await getHumanResourcesService().publishExercise(exercise, user.id),
        )
      } catch (error) {
        next(error)
      }
    },
  }
}
