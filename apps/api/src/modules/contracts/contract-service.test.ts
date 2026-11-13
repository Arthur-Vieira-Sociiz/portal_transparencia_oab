import { describe, expect, it } from 'vitest'
import {
  createContractService,
  type ContractRepository,
} from './contract-service.js'

describe('contract service', () => {
  it('prevents deleting a supplier that still owns contracts', async () => {
    const repository = {
      async deleteSupplier() {
        return 'in-use' as const
      },
    } as unknown as ContractRepository
    const service = createContractService(repository)

    await expect(service.deleteSupplier('supplier-1')).rejects.toMatchObject({
      code: 'SUPPLIER_IN_USE',
    })
  })

  it('distinguishes a missing supplier from a CNPJ conflict on update', async () => {
    const missingRepository = {
      async updateSupplier() {
        return { status: 'not-found' as const }
      },
    } as unknown as ContractRepository
    const conflictingRepository = {
      async updateSupplier() {
        return { status: 'conflict' as const }
      },
    } as unknown as ContractRepository
    const input = { name: 'Fornecedor', cnpj: '12.345.678/0001-90' }

    await expect(
      createContractService(missingRepository).updateSupplier('missing', input),
    ).rejects.toMatchObject({ code: 'SUPPLIER_NOT_FOUND' })
    await expect(
      createContractService(conflictingRepository).updateSupplier(
        'supplier-1',
        input,
      ),
    ).rejects.toMatchObject({ code: 'SUPPLIER_ALREADY_EXISTS' })
  })
})
