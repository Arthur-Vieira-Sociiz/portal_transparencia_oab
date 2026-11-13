import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createContract,
  createSupplier,
  deleteContract,
  deleteSupplier,
  getPublicContractsPage,
  listContracts,
  listSuppliers,
  publishContractExercise,
  updateContract,
  updateSupplier,
} from './contracts.api'

const supplier = {
  id: 'supplier-acom',
  name: 'ACOM SISTEMAS CORPORATIVOS LTDA',
  cnpj: '00.000.000/0000-00',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const input = {
  supplierName: supplier.name,
  cnpj: supplier.cnpj,
  signedAt: '02/01/2026',
  term: '02/01/2026 a 01/01/2027',
  value: 214_124,
  exercise: 2026,
  contractDocumentUrl: 'https://example.com/contract.pdf',
  amendmentUrls: ['https://example.com/amendment.pdf'],
}

const document = (id: string, title: string, url: string) => ({
  id,
  title,
  format: 'pdf' as const,
  url,
  category: 'contracts-and-bids' as const,
  exercise: input.exercise,
})

const publicContract = {
  id: 'contract-acom-2026',
  supplier: input.supplierName,
  cnpj: input.cnpj,
  signedAt: input.signedAt,
  term: input.term,
  value: input.value,
  exercise: input.exercise,
  contractDocument: document(
    'contract-document',
    'Contrato ACOM 2026',
    input.contractDocumentUrl,
  ),
  amendments: [
    document('contract-amendment', '1º termo aditivo', input.amendmentUrls[0]!),
  ],
}

const adminContract = {
  ...publicContract,
  publicationStatus: 'DRAFT' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  publishedAt: null,
}

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
}

describe('contracts API client', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset()
  })

  it('loads and validates the public contracts page', async () => {
    const page = {
      availableExercises: [2026],
      contracts: [publicContract],
    }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(page))

    await expect(getPublicContractsPage()).resolves.toEqual(page)
    expect(fetch).toHaveBeenCalledWith('/api/public/contracts')
  })

  it('loads contracts and suppliers with pagination and authentication', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ records: [adminContract] }))
      .mockResolvedValueOnce(jsonResponse({ suppliers: [supplier] }))

    await expect(listContracts('session-token')).resolves.toEqual([
      adminContract,
    ])
    await expect(listSuppliers('session-token')).resolves.toEqual([supplier])
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      '/api/admin/contracts?page=1&limit=100',
      { headers: { Authorization: 'Bearer session-token' } },
    )
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      '/api/admin/suppliers?page=1&limit=100',
      { headers: { Authorization: 'Bearer session-token' } },
    )
  })

  it('creates, updates, publishes and deletes contracts', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(adminContract))
      .mockResolvedValueOnce(jsonResponse(adminContract))
      .mockResolvedValueOnce(
        jsonResponse([
          { ...adminContract, publicationStatus: 'PUBLISHED' as const },
        ]),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    await createContract('session-token', input)
    await updateContract('session-token', adminContract.id, input)
    await publishContractExercise('session-token', 2026)
    await deleteContract('session-token', adminContract.id)

    expect(fetch).toHaveBeenNthCalledWith(1, '/api/admin/contracts', {
      body: JSON.stringify(input),
      headers: {
        Authorization: 'Bearer session-token',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      `/api/admin/contracts/${adminContract.id}`,
      {
        body: JSON.stringify(input),
        headers: {
          Authorization: 'Bearer session-token',
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      },
    )
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      '/api/admin/contracts/2026/publish',
      {
        headers: { Authorization: 'Bearer session-token' },
        method: 'POST',
      },
    )
    expect(fetch).toHaveBeenNthCalledWith(
      4,
      `/api/admin/contracts/${adminContract.id}`,
      {
        headers: { Authorization: 'Bearer session-token' },
        method: 'DELETE',
      },
    )
  })

  it('creates, updates and deletes suppliers', async () => {
    const supplierInput = { name: supplier.name, cnpj: supplier.cnpj }
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(supplier))
      .mockResolvedValueOnce(jsonResponse(supplier))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    await createSupplier('session-token', supplierInput)
    await updateSupplier('session-token', supplier.id, supplierInput)
    await deleteSupplier('session-token', supplier.id)

    expect(fetch).toHaveBeenNthCalledWith(1, '/api/admin/suppliers', {
      body: JSON.stringify(supplierInput),
      headers: {
        Authorization: 'Bearer session-token',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      `/api/admin/suppliers/${supplier.id}`,
      {
        body: JSON.stringify(supplierInput),
        headers: {
          Authorization: 'Bearer session-token',
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      },
    )
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      `/api/admin/suppliers/${supplier.id}`,
      {
        headers: { Authorization: 'Bearer session-token' },
        method: 'DELETE',
      },
    )
  })
})
