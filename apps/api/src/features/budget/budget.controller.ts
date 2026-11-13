import {
  CreateBudgetRecordRequestSchema,
  PublicBudgetRecordsSchema,
  UpdateBudgetRecordRequestSchema,
} from '@oab-transparencia/contracts/transparency'
import type { RequestHandler } from 'express'
import {
  BudgetQuerySchema,
  ExerciseParamsSchema,
  IdParamsSchema,
  type ExerciseParams,
  type IdParams,
} from '../../http/request-schemas.js'
import type { BudgetService } from './budget-service.js'
import type { RequireUser } from '../../middlewares/require-user.js'

export type BudgetControllerDependencies = {
  getBudgetService: () => BudgetService
  requireUser: RequireUser
}

export type BudgetController = {
  listPublished: RequestHandler
  list: RequestHandler
  create: RequestHandler
  update: RequestHandler<IdParams>
  publish: RequestHandler<ExerciseParams>
}

export function createBudgetController({
  getBudgetService,
  requireUser,
}: BudgetControllerDependencies): BudgetController {
  return {
    async listPublished(request, response, next) {
      try {
        const { exercise, informationType } = BudgetQuerySchema.parse(
          request.query,
        )
        response.json(
          PublicBudgetRecordsSchema.parse(
            await getBudgetService().getPublished(exercise, informationType),
          ),
        )
      } catch (error) {
        next(error)
      }
    },

    async list(request, response, next) {
      try {
        await requireUser(request)
        response.json({ records: await getBudgetService().list() })
      } catch (error) {
        next(error)
      }
    },

    async create(request, response, next) {
      try {
        const user = await requireUser(request)
        const input = CreateBudgetRecordRequestSchema.parse(request.body)
        response
          .status(201)
          .json(await getBudgetService().create({ ...input, userId: user.id }))
      } catch (error) {
        next(error)
      }
    },

    async update(request, response, next) {
      try {
        const user = await requireUser(request)
        const { id } = IdParamsSchema.parse(request.params)
        const input = UpdateBudgetRecordRequestSchema.parse(request.body)
        response.json(
          await getBudgetService().update(id, {
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
        const user = await requireUser(request)
        const { exercise } = ExerciseParamsSchema.parse(request.params)
        response.json(
          await getBudgetService().publishExercise(exercise, user.id),
        )
      } catch (error) {
        next(error)
      }
    },
  }
}
