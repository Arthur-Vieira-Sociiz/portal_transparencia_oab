import {
  CreatePatrimonialAssetRequestSchema,
  PublicPatrimonialPageSchema,
  UpdatePatrimonialAssetRequestSchema,
} from '@oab-transparencia/contracts/transparency'
import type { RequestHandler } from 'express'
import {
  ExerciseParamsSchema,
  IdParamsSchema,
  PaginationQuerySchema,
  type ExerciseParams,
  type IdParams,
} from '../../http/request-schemas.js'
import type { RequirePermission } from '../../middlewares/require-permission.js'
import type { PatrimonialAssetService } from './patrimonial-asset-service.js'

export type PatrimonialControllerDependencies = {
  getPatrimonialAssetService: () => PatrimonialAssetService
  requirePermission: RequirePermission
}

export type PatrimonialController = {
  listPublished: RequestHandler
  list: RequestHandler
  create: RequestHandler
  update: RequestHandler<IdParams>
  publish: RequestHandler<ExerciseParams>
}

export function createPatrimonialController({
  getPatrimonialAssetService,
  requirePermission,
}: PatrimonialControllerDependencies): PatrimonialController {
  return {
    async listPublished(_request, response, next) {
      try {
        response.json(
          PublicPatrimonialPageSchema.parse(
            await getPatrimonialAssetService().listPublished(),
          ),
        )
      } catch (error) {
        next(error)
      }
    },

    async list(request, response, next) {
      try {
        await requirePermission(request, 'CONTENT_READ')
        const pagination = PaginationQuerySchema.parse(request.query)
        const result = await getPatrimonialAssetService().list(pagination)
        response.json({ records: result.items, pagination: result.pagination })
      } catch (error) {
        next(error)
      }
    },

    async create(request, response, next) {
      try {
        const user = await requirePermission(request, 'CONTENT_WRITE')
        const input = CreatePatrimonialAssetRequestSchema.parse(request.body)
        response.status(201).json(
          await getPatrimonialAssetService().create({
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
        const input = UpdatePatrimonialAssetRequestSchema.parse(request.body)
        response.json(
          await getPatrimonialAssetService().update(id, {
            ...input,
            userId: user.id,
          }),
        )
      } catch (error) {
        next(error)
      }
    },

    async publish(request, response, next) {
      try {
        const user = await requirePermission(request, 'CONTENT_PUBLISH')
        const { exercise } = ExerciseParamsSchema.parse(request.params)
        response.json(
          await getPatrimonialAssetService().publishExercise(exercise, user.id),
        )
      } catch (error) {
        next(error)
      }
    },
  }
}
