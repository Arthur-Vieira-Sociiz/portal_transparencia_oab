import { ExerciseSchema } from '@oab-transparencia/contracts/common'
import {
  CreateFinancialDocumentRequestSchema,
  UpdateFinancialDocumentRequestSchema,
} from '@oab-transparencia/contracts/transparency'
import type { RequestHandler } from 'express'
import type { FinancialDocumentService } from '../../financial/financial-document-service.js'
import type { RequireUser } from '../../middlewares/require-user.js'

export type FinancialControllerDependencies = {
  getFinancialDocumentService: () => FinancialDocumentService
  requireUser: RequireUser
}

type FinancialIdParams = {
  id: string
}

type FinancialExerciseParams = {
  exercise: string
}

export type FinancialController = {
  list: RequestHandler
  listPublished: RequestHandler
  create: RequestHandler
  update: RequestHandler<FinancialIdParams>
  publish: RequestHandler<FinancialExerciseParams>
}

export function createFinancialController({
  getFinancialDocumentService,
  requireUser,
}: FinancialControllerDependencies): FinancialController {
  return {
    async list(request, response, next) {
      try {
        await requireUser(request)
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
        const user = await requireUser(request)
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
        const user = await requireUser(request)
        const input = UpdateFinancialDocumentRequestSchema.parse(request.body)
        response.json(
          await getFinancialDocumentService().update(request.params.id, {
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
