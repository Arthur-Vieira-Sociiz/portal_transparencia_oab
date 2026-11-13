import {
  CreateContractRecordRequestSchema,
  CreateSupplierRequestSchema,
  PublicContractsPageSchema,
  UpdateContractRecordRequestSchema,
  UpdateSupplierRequestSchema,
} from '@oab-transparencia/contracts/transparency'
import type { RequestHandler } from 'express'
import {
  ExerciseParamsSchema,
  IdParamsSchema,
  type ExerciseParams,
  type IdParams,
} from '../../http/request-schemas.js'
import type { ContractService } from './contract-service.js'
import type { RequireUser } from '../../middlewares/require-user.js'

export type ContractsControllerDependencies = {
  getContractService: () => ContractService
  requireUser: RequireUser
}

export type ContractsController = {
  listPublished: RequestHandler
  list: RequestHandler
  listSuppliers: RequestHandler
  createSupplier: RequestHandler
  updateSupplier: RequestHandler<IdParams>
  deleteSupplier: RequestHandler<IdParams>
  create: RequestHandler
  update: RequestHandler<IdParams>
  delete: RequestHandler<IdParams>
  publish: RequestHandler<ExerciseParams>
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
        const { id } = IdParamsSchema.parse(request.params)
        const input = UpdateSupplierRequestSchema.parse(request.body)
        response.json(await getContractService().updateSupplier(id, input))
      } catch (error) {
        next(error)
      }
    },

    async deleteSupplier(request, response, next) {
      try {
        await requireUser(request)
        const { id } = IdParamsSchema.parse(request.params)
        await getContractService().deleteSupplier(id)
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
        const { id } = IdParamsSchema.parse(request.params)
        const input = UpdateContractRecordRequestSchema.parse(request.body)
        response.json(
          await getContractService().update(id, {
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
        const { id } = IdParamsSchema.parse(request.params)
        await getContractService().delete(id)
        response.status(204).send()
      } catch (error) {
        next(error)
      }
    },

    async publish(request, response, next) {
      try {
        const user = await requireUser(request)
        const { exercise } = ExerciseParamsSchema.parse(request.params)
        response.json(
          await getContractService().publishExercise(exercise, user.id),
        )
      } catch (error) {
        next(error)
      }
    },
  }
}
