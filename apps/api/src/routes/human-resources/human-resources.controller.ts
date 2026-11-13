import { ExerciseSchema } from '@oab-transparencia/contracts/common'
import {
  CreateHumanResourcesRequestSchema,
  PublicHumanResourcesPageSchema,
  UpdateHumanResourcesRequestSchema,
} from '@oab-transparencia/contracts/transparency'
import type { RequestHandler } from 'express'
import type { HumanResourcesService } from '../../human-resources/human-resources-service.js'
import type { RequireUser } from '../../middlewares/require-user.js'

export type HumanResourcesControllerDependencies = {
  getHumanResourcesService: () => HumanResourcesService
  requireUser: RequireUser
}

type HumanResourcesIdParams = {
  id: string
}

type HumanResourcesExerciseParams = {
  exercise: string
}

export type HumanResourcesController = {
  list: RequestHandler
  listPublished: RequestHandler
  create: RequestHandler
  update: RequestHandler<HumanResourcesIdParams>
  delete: RequestHandler<HumanResourcesIdParams>
  publish: RequestHandler<HumanResourcesExerciseParams>
}

export function createHumanResourcesController({
  getHumanResourcesService,
  requireUser,
}: HumanResourcesControllerDependencies): HumanResourcesController {
  return {
    async list(request, response, next) {
      try {
        await requireUser(request)
        response.json({ records: await getHumanResourcesService().list() })
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
        const user = await requireUser(request)
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
        const user = await requireUser(request)
        const input = UpdateHumanResourcesRequestSchema.parse(request.body)
        response.json(
          await getHumanResourcesService().update(request.params.id, {
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
        await getHumanResourcesService().delete(request.params.id)
        response.status(204).send()
      } catch (error) {
        next(error)
      }
    },

    async publish(request, response, next) {
      try {
        const user = await requireUser(request)
        const exercise = ExerciseSchema.parse(Number(request.params.exercise))
        response.json(
          await getHumanResourcesService().publishExercise(exercise, user.id),
        )
      } catch (error) {
        next(error)
      }
    },
  }
}
