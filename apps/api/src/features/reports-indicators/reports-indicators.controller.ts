import { ExerciseSchema } from '@oab-transparencia/contracts/common'
import {
  CreateReportsIndicatorRequestSchema,
  PublicReportsPageSchema,
  UpdateReportsIndicatorRequestSchema,
} from '@oab-transparencia/contracts/transparency'
import type { RequestHandler } from 'express'
import type { RequireUser } from '../../middlewares/require-user.js'
import type { ReportsIndicatorsService } from './reports-indicators-service.js'

export type ReportsIndicatorsControllerDependencies = {
  getReportsIndicatorsService: () => ReportsIndicatorsService
  requireUser: RequireUser
}

type ReportIdParams = {
  id: string
}

type ReportExerciseParams = {
  exercise: string
}

export type ReportsIndicatorsController = {
  listPublished: RequestHandler
  list: RequestHandler
  create: RequestHandler
  update: RequestHandler<ReportIdParams>
  delete: RequestHandler<ReportIdParams>
  publish: RequestHandler<ReportExerciseParams>
}

export function createReportsIndicatorsController({
  getReportsIndicatorsService,
  requireUser,
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
        await requireUser(request)
        response.json({
          indicators: await getReportsIndicatorsService().list(),
        })
      } catch (error) {
        next(error)
      }
    },

    async create(request, response, next) {
      try {
        const user = await requireUser(request)
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
        const user = await requireUser(request)
        const input = UpdateReportsIndicatorRequestSchema.parse(request.body)
        response.json(
          await getReportsIndicatorsService().update(request.params.id, {
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
        await requireUser(request)
        await getReportsIndicatorsService().delete(request.params.id)
        response.status(204).send()
      } catch (error) {
        next(error)
      }
    },

    async publish(request, response, next) {
      try {
        const user = await requireUser(request)
        response.json(
          await getReportsIndicatorsService().publish(
            ExerciseSchema.parse(Number(request.params.exercise)),
            user.id,
          ),
        )
      } catch (error) {
        next(error)
      }
    },
  }
}
