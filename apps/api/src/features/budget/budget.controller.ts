import { ExerciseSchema } from '@oab-transparencia/contracts/common'
import {
  CreateBudgetRecordRequestSchema,
  PublicBudgetRecordsSchema,
  UpdateBudgetRecordRequestSchema,
} from '@oab-transparencia/contracts/transparency'
import type { RequestHandler } from 'express'
import type { BudgetService } from './budget-service.js'
import type { RequireUser } from '../../middlewares/require-user.js'

export type BudgetControllerDependencies = {
  getBudgetService: () => BudgetService
  requireUser: RequireUser
}

type BudgetIdParams = {
  id: string
}

type BudgetExerciseParams = {
  exercise: string
}

export type BudgetController = {
  listPublished: RequestHandler
  list: RequestHandler
  create: RequestHandler
  update: RequestHandler<BudgetIdParams>
  publish: RequestHandler<BudgetExerciseParams>
}

export function createBudgetController({
  getBudgetService,
  requireUser,
}: BudgetControllerDependencies): BudgetController {
  return {
    async listPublished(request, response, next) {
      try {
        const exercise = request.query.exercise
          ? ExerciseSchema.parse(Number(request.query.exercise))
          : undefined
        const informationType =
          typeof request.query.informationType === 'string'
            ? request.query.informationType
            : undefined
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
        const input = UpdateBudgetRecordRequestSchema.parse(request.body)
        response.json(
          await getBudgetService().update(request.params.id, {
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
        const exercise = ExerciseSchema.parse(Number(request.params.exercise))
        response.json(
          await getBudgetService().publishExercise(exercise, user.id),
        )
      } catch (error) {
        next(error)
      }
    },
  }
}
