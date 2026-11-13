import {
  CreateFinancialDocumentRequestSchema,
  UpdateFinancialDocumentRequestSchema,
} from '@oab-transparencia/contracts/transparency'
import type { RequestHandler } from 'express'
import {
  ExerciseParamsSchema,
  IdParamsSchema,
  type ExerciseParams,
  type IdParams,
} from '../../http/request-schemas.js'
import type { FinancialDocumentService } from './financial-document-service.js'
import type { RequirePermission } from '../../middlewares/require-permission.js'

export type FinancialControllerDependencies = {
  getFinancialDocumentService: () => FinancialDocumentService
  requirePermission: RequirePermission
}

export type FinancialController = {
  list: RequestHandler
  listPublished: RequestHandler
  create: RequestHandler
  update: RequestHandler<IdParams>
  publish: RequestHandler<ExerciseParams>
}

export function createFinancialController({
  getFinancialDocumentService,
  requirePermission,
}: FinancialControllerDependencies): FinancialController {
  return {
    async list(request, response, next) {
      try {
        await requirePermission(request, 'CONTENT_READ')
        response.json({
          records: await getFinancialDocumentService().list(),
        })
      } catch (error) {
        next(error)
      }
    },

    async listPublished(_request, response, next) {
      try {
        response.json(await getFinancialDocumentService().listPublished())
      } catch (error) {
        next(error)
      }
    },

    async create(request, response, next) {
      try {
        const user = await requirePermission(request, 'CONTENT_WRITE')
        const input = CreateFinancialDocumentRequestSchema.parse(request.body)
        response.status(201).json(
          await getFinancialDocumentService().create({
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
        const input = UpdateFinancialDocumentRequestSchema.parse(request.body)
        response.json(
          await getFinancialDocumentService().update(id, {
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
          await getFinancialDocumentService().publishExercise(
            exercise,
            user.id,
          ),
        )
      } catch (error) {
        next(error)
      }
    },
  }
}
