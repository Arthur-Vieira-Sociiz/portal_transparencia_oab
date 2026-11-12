import type {
  AdminContractRecord,
  CreateContractRecordRequest,
  PublicContractsPage,
  UpdateContractRecordRequest,
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from '@oab-transparencia/contracts/transparency'

export class ContractError extends Error {
  constructor(
    public readonly code:
      | 'CONTRACT_ALREADY_EXISTS'
      | 'CONTRACT_NOT_FOUND'
      | 'CONTRACT_EXERCISE_NOT_FOUND'
      | 'SUPPLIER_ALREADY_EXISTS',
  ) {
    super(code)
  }
}
export type ContractRepository = {
  list(): Promise<AdminContractRecord[]>
  listPublished(): Promise<PublicContractsPage>
  create(
    input: CreateContractRecordRequest & { userId: string },
  ): Promise<AdminContractRecord>
  update(
    id: string,
    input: UpdateContractRecordRequest & { userId: string },
  ): Promise<AdminContractRecord | null>
  delete(id: string): Promise<boolean>
  publishExercise(
    exercise: number,
    userId: string,
  ): Promise<AdminContractRecord[]>
  listSuppliers(): Promise<Supplier[]>
  createSupplier(input: CreateSupplierRequest): Promise<Supplier>
  updateSupplier(
    id: string,
    input: UpdateSupplierRequest,
  ): Promise<Supplier | null>
  deleteSupplier(id: string): Promise<boolean>
}
export function createContractService(repository: ContractRepository) {
  return {
    list: () => repository.list(),
    listPublished: () => repository.listPublished(),
    listSuppliers: () => repository.listSuppliers(),
    async createSupplier(input: CreateSupplierRequest) {
      return repository.createSupplier(input)
    },
    async updateSupplier(id: string, input: UpdateSupplierRequest) {
      const result = await repository.updateSupplier(id, input)
      if (!result) throw new ContractError('SUPPLIER_ALREADY_EXISTS')
      return result
    },
    async deleteSupplier(id: string) {
      if (!(await repository.deleteSupplier(id)))
        throw new ContractError('SUPPLIER_ALREADY_EXISTS')
    },
    async create(input: CreateContractRecordRequest & { userId: string }) {
      return repository.create(input)
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
