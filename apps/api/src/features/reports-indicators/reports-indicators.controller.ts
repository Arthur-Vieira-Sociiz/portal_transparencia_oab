import {
  CreateReportsIndicatorRequestSchema,
  PublicReportsPageSchema,
  UpdateReportsIndicatorRequestSchema,
} from '@oab-transparencia/contracts/transparency'
import type { RequestHandler } from 'express'
import {
  ExerciseParamsSchema,
  IdParamsSchema,
  type ExerciseParams,
  type IdParams,
} from '../../http/request-schemas.js'
import type { RequirePermission } from '../../middlewares/require-permission.js'
import type { ReportsIndicatorsService } from './reports-indicators-service.js'

export type ReportsIndicatorsControllerDependencies = {
  getReportsIndicatorsService: () => ReportsIndicatorsService
  requirePermission: RequirePermission
}

export type ReportsIndicatorsController = {
  listPublished: RequestHandler
  list: RequestHandler
  create: RequestHandler
  update: RequestHandler<IdParams>
  delete: RequestHandler<IdParams>
  publish: RequestHandler<ExerciseParams>
}

export function createReportsIndicatorsController({
  getReportsIndicatorsService,
  requirePermission,
}: ReportsIndicatorsControllerDependencies): ReportsIndicatorsController {
  return {
    async listPublished(_request, response, next) {
      try {
        response.json(
          PublicReportsPageSchema.parse(
            await getReportsIndicatorsService().listPublished(),
          ),
        )
      } catch (error) {
        next(error)
      }
    },

    async list(request, response, next) {
      try {
        await requirePermission(request, 'CONTENT_READ')
        response.json({
          indicators: await getReportsIndicatorsService().list(),
        })
      } catch (error) {
        next(error)
      }
    },

    async create(request, response, next) {
      try {
        const user = await requirePermission(request, 'CONTENT_WRITE')
        const input = CreateReportsIndicatorRequestSchema.parse(request.body)
        response.status(201).json(
          await getReportsIndicatorsService().create({
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
        const input = UpdateReportsIndicatorRequestSchema.parse(request.body)
        response.json(
          await getReportsIndicatorsService().update(id, {
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
        await getReportsIndicatorsService().delete(id)
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
          await getReportsIndicatorsService().publish(exercise, user.id),
        )
      } catch (error) {
        next(error)
      }
    },
  }
}
