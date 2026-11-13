import {
  CreateGeneralDataRequestSchema,
  UpdateGeneralDataRequestSchema,
} from '@oab-transparencia/contracts/transparency'
import type { RequestHandler } from 'express'
import {
  ExerciseQuerySchema,
  IdParamsSchema,
  type IdParams,
} from '../../http/request-schemas.js'
import type { GeneralDataService } from './general-data-service.js'
import type { RequirePermission } from '../../middlewares/require-permission.js'

export type GeneralDataControllerDependencies = {
  getGeneralDataService: () => GeneralDataService
  requirePermission: RequirePermission
}

export type GeneralDataController = {
  getPublished: RequestHandler
  list: RequestHandler
  create: RequestHandler
  update: RequestHandler<IdParams>
  publish: RequestHandler<IdParams>
}

export function createGeneralDataController({
  getGeneralDataService,
  requirePermission,
}: GeneralDataControllerDependencies): GeneralDataController {
  return {
    async getPublished(request, response, next) {
      try {
        const { exercise } = ExerciseQuerySchema.parse(request.query)
        const result = await getGeneralDataService().getPublished(exercise)
        if (!result) {
          response
            .status(404)
            .json({ message: 'Dados gerais publicados não encontrados.' })
          return
        }

        response.json(result)
      } catch (error) {
        next(error)
      }
    },

    async list(request, response, next) {
      try {
        await requirePermission(request, 'CONTENT_READ')
        response.json({ records: await getGeneralDataService().list() })
      } catch (error) {
        next(error)
      }
    },

    async create(request, response, next) {
      try {
        const user = await requirePermission(request, 'CONTENT_WRITE')
        const input = CreateGeneralDataRequestSchema.parse(request.body)
        response.status(201).json(
          await getGeneralDataService().create({
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
        const input = UpdateGeneralDataRequestSchema.parse(request.body)
        response.json(
          await getGeneralDataService().update(id, {
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
        const { id } = IdParamsSchema.parse(request.params)
        response.json(await getGeneralDataService().publish(id, user.id))
      } catch (error) {
        next(error)
      }
    },
  }
}
