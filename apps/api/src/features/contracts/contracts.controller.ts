import { ExerciseSchema } from '@oab-transparencia/contracts/common'
import {
  CreateContractRecordRequestSchema,
  CreateSupplierRequestSchema,
  PublicContractsPageSchema,
  UpdateContractRecordRequestSchema,
  UpdateSupplierRequestSchema,
} from '@oab-transparencia/contracts/transparency'
import type { RequestHandler } from 'express'
import type { ContractService } from './contract-service.js'
import type { RequireUser } from '../../middlewares/require-user.js'

export type ContractsControllerDependencies = {
  getContractService: () => ContractService
  requireUser: RequireUser
}

type ContractIdParams = {
  id: string
}

type ContractExerciseParams = {
  exercise: string
}

export type ContractsController = {
  listPublished: RequestHandler
  list: RequestHandler
  listSuppliers: RequestHandler
  createSupplier: RequestHandler
  updateSupplier: RequestHandler<ContractIdParams>
  deleteSupplier: RequestHandler<ContractIdParams>
  create: RequestHandler
  update: RequestHandler<ContractIdParams>
  delete: RequestHandler<ContractIdParams>
  publish: RequestHandler<ContractExerciseParams>
}

export function createContractsController({
  getContractService,
  requireUser,
}: ContractsControllerDependencies): ContractsController {
  return {
    async listPublished(_request, response, next) {
      try {
        response.json(
          PublicContractsPageSchema.parse(
            await getContractService().listPublished(),
          ),
        )
      } catch (error) {
        next(error)
      }
    },

    async list(request, response, next) {
      try {
        await requireUser(request)
        response.json({ records: await getContractService().list() })
      } catch (error) {
        next(error)
      }
    },

    async listSuppliers(request, response, next) {
      try {
        await requireUser(request)
        response.json({ suppliers: await getContractService().listSuppliers() })
      } catch (error) {
        next(error)
      }
    },

    async createSupplier(request, response, next) {
      try {
        await requireUser(request)
        const input = CreateSupplierRequestSchema.parse(request.body)
        response
          .status(201)
          .json(await getContractService().createSupplier(input))
      } catch (error) {
        next(error)
      }
    },

    async updateSupplier(request, response, next) {
      try {
        await requireUser(request)
        const input = UpdateSupplierRequestSchema.parse(request.body)
        response.json(
          await getContractService().updateSupplier(request.params.id, input),
        )
      } catch (error) {
        next(error)
      }
    },

    async deleteSupplier(request, response, next) {
      try {
        await requireUser(request)
        await getContractService().deleteSupplier(request.params.id)
        response.status(204).send()
      } catch (error) {
        next(error)
      }
    },

    async create(request, response, next) {
      try {
        const user = await requireUser(request)
        const input = CreateContractRecordRequestSchema.parse(request.body)
        response
          .status(201)
          .json(
            await getContractService().create({ ...input, userId: user.id }),
          )
      } catch (error) {
        next(error)
      }
    },

    async update(request, response, next) {
      try {
        const user = await requireUser(request)
        const input = UpdateContractRecordRequestSchema.parse(request.body)
        response.json(
          await getContractService().update(request.params.id, {
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
        await getContractService().delete(request.params.id)
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
          await getContractService().publishExercise(exercise, user.id),
        )
      } catch (error) {
        next(error)
      }
    },
  }
}
