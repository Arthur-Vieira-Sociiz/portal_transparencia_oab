import type {
  AdminContractRecord,
  CreateContractRecordRequest,
  PublicContractsPage,
  UpdateContractRecordRequest,
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from '@oab-transparencia/contracts/transparency'
import type { PaginatedResult, Pagination } from '../../http/request-schemas.js'

export class ContractError extends Error {
  constructor(
    public readonly code:
      | 'CONTRACT_ALREADY_EXISTS'
      | 'CONTRACT_NOT_FOUND'
      | 'CONTRACT_EXERCISE_NOT_FOUND'
      | 'SUPPLIER_ALREADY_EXISTS'
      | 'SUPPLIER_NOT_FOUND'
      | 'SUPPLIER_IN_USE',
  ) {
    super(code)
  }
}
export type ContractRepository = {
  list(pagination: Pagination): Promise<PaginatedResult<AdminContractRecord>>
  listPublished(): Promise<PublicContractsPage>
  create(
    input: CreateContractRecordRequest & { userId: string },
  ): Promise<AdminContractRecord | null>
  update(
    id: string,
    input: UpdateContractRecordRequest & { userId: string },
  ): Promise<AdminContractRecord | null>
  delete(id: string): Promise<boolean>
  publishExercise(
    exercise: number,
    userId: string,
  ): Promise<AdminContractRecord[]>
  listSuppliers(pagination: Pagination): Promise<PaginatedResult<Supplier>>
  createSupplier(input: CreateSupplierRequest): Promise<Supplier | null>
  updateSupplier(
    id: string,
    input: UpdateSupplierRequest,
  ): Promise<
    | { status: 'updated'; supplier: Supplier }
    | { status: 'not-found' }
    | { status: 'conflict' }
  >
  deleteSupplier(id: string): Promise<'deleted' | 'not-found' | 'in-use'>
}
export function createContractService(repository: ContractRepository) {
  return {
    list: (pagination: Pagination) => repository.list(pagination),
    listPublished: () => repository.listPublished(),
    listSuppliers: (pagination: Pagination) =>
      repository.listSuppliers(pagination),
    async createSupplier(input: CreateSupplierRequest) {
      const result = await repository.createSupplier(input)
      if (!result) throw new ContractError('SUPPLIER_ALREADY_EXISTS')
      return result
    },
    async updateSupplier(id: string, input: UpdateSupplierRequest) {
      const result = await repository.updateSupplier(id, input)
      if (result.status === 'not-found')
        throw new ContractError('SUPPLIER_NOT_FOUND')
      if (result.status === 'conflict')
        throw new ContractError('SUPPLIER_ALREADY_EXISTS')
      return result.supplier
    },
    async deleteSupplier(id: string) {
      const result = await repository.deleteSupplier(id)
      if (result === 'not-found') throw new ContractError('SUPPLIER_NOT_FOUND')
      if (result === 'in-use') throw new ContractError('SUPPLIER_IN_USE')
    },
    async create(input: CreateContractRecordRequest & { userId: string }) {
      const result = await repository.create(input)
      if (!result) throw new ContractError('CONTRACT_ALREADY_EXISTS')
      return result
    },
    async update(
      id: string,
      input: UpdateContractRecordRequest & { userId: string },
    ) {
      const result = await repository.update(id, input)
      if (!result) throw new ContractError('CONTRACT_NOT_FOUND')
      return result
    },
    async delete(id: string) {
      if (!(await repository.delete(id)))
        throw new ContractError('CONTRACT_NOT_FOUND')
    },
    async publishExercise(exercise: number, userId: string) {
      const result = await repository.publishExercise(exercise, userId)
      if (!result.length) throw new ContractError('CONTRACT_EXERCISE_NOT_FOUND')
      return result
    },
  }
}
export type ContractService = ReturnType<typeof createContractService>
