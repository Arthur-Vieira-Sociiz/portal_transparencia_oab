import { ExerciseSchema } from '@oab-transparencia/contracts/common'
import {
  CreatePatrimonialAssetRequestSchema,
  PublicPatrimonialPageSchema,
  UpdatePatrimonialAssetRequestSchema,
} from '@oab-transparencia/contracts/transparency'
import type { RequestHandler } from 'express'
import type { RequireUser } from '../../middlewares/require-user.js'
import type { PatrimonialAssetService } from '../../patrimonial/patrimonial-asset-service.js'

export type PatrimonialControllerDependencies = {
  getPatrimonialAssetService: () => PatrimonialAssetService
  requireUser: RequireUser
}

type PatrimonialIdParams = {
  id: string
}

type PatrimonialExerciseParams = {
  exercise: string
}

export type PatrimonialController = {
  listPublished: RequestHandler
  list: RequestHandler
  create: RequestHandler
  update: RequestHandler<PatrimonialIdParams>
  publish: RequestHandler<PatrimonialExerciseParams>
}

export function createPatrimonialController({
  getPatrimonialAssetService,
  requireUser,
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
        await requireUser(request)
        response.json({ records: await getPatrimonialAssetService().list() })
      } catch (error) {
        next(error)
      }
    },

    async create(request, response, next) {
      try {
        const user = await requireUser(request)
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
        const user = await requireUser(request)
        const input = UpdatePatrimonialAssetRequestSchema.parse(request.body)
        response.json(
          await getPatrimonialAssetService().update(request.params.id, {
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
          await getPatrimonialAssetService().publishExercise(exercise, user.id),
        )
      } catch (error) {
        next(error)
      }
    },
  }
}
