import { ExerciseSchema } from '@oab-transparencia/contracts/common'
import {
  AdminContractRecordSchema,
  CreateContractRecordRequestSchema,
  CreateSupplierRequestSchema,
  PublicContractsPageSchema,
  SupplierSchema,
  UpdateContractRecordRequestSchema,
  UpdateSupplierRequestSchema,
  type AdminContractRecord,
  type CreateContractRecordRequest,
  type CreateSupplierRequest,
  type PublicContractsPage,
  type Supplier,
  type UpdateContractRecordRequest,
  type UpdateSupplierRequest,
} from '@oab-transparencia/contracts/transparency'
import { apiBaseUrl, authenticatedRequest, getApiError } from '@/lib/api-client'

const adminPageQuery = '?page=1&limit=100'

export async function listContracts(
  token: string,
): Promise<AdminContractRecord[]> {
  const payload = await authenticatedRequest(
    token,
    `/admin/contracts${adminPageQuery}`,
    {},
    (value) => value as { records: unknown[] },
  )
  return payload.records.map((record) =>
    AdminContractRecordSchema.parse(record),
  )
}

export async function listSuppliers(token: string): Promise<Supplier[]> {
  const payload = await authenticatedRequest(
    token,
    `/admin/suppliers${adminPageQuery}`,
    {},
    (value) => value as { suppliers: unknown[] },
  )
  return payload.suppliers.map((supplier) => SupplierSchema.parse(supplier))
}

export async function createSupplier(
  token: string,
  input: CreateSupplierRequest,
): Promise<Supplier> {
  const validInput = CreateSupplierRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/suppliers',
    { body: JSON.stringify(validInput), method: 'POST' },
    (value) => SupplierSchema.parse(value),
  )
}

export async function updateSupplier(
  token: string,
  id: string,
  input: UpdateSupplierRequest,
): Promise<Supplier> {
  const validInput = UpdateSupplierRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    `/admin/suppliers/${id}`,
    { body: JSON.stringify(validInput), method: 'PATCH' },
    (value) => SupplierSchema.parse(value),
  )
}

export async function deleteSupplier(token: string, id: string): Promise<void> {
  await authenticatedRequest(
    token,
    `/admin/suppliers/${id}`,
    { method: 'DELETE' },
    () => undefined,
  )
}

export async function createContract(
  token: string,
  input: CreateContractRecordRequest,
): Promise<AdminContractRecord> {
  const validInput = CreateContractRecordRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/contracts',
    { body: JSON.stringify(validInput), method: 'POST' },
    (value) => AdminContractRecordSchema.parse(value),
  )
}

export async function updateContract(
  token: string,
  id: string,
  input: UpdateContractRecordRequest,
): Promise<AdminContractRecord> {
  const validInput = UpdateContractRecordRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    `/admin/contracts/${id}`,
    { body: JSON.stringify(validInput), method: 'PATCH' },
    (value) => AdminContractRecordSchema.parse(value),
  )
}

export async function deleteContract(token: string, id: string): Promise<void> {
  await authenticatedRequest(
    token,
    `/admin/contracts/${id}`,
    { method: 'DELETE' },
    () => undefined,
  )
}

export async function publishContractExercise(
  token: string,
  exercise: number,
): Promise<AdminContractRecord[]> {
  const validExercise = ExerciseSchema.parse(exercise)
  const payload = await authenticatedRequest(
    token,
    `/admin/contracts/${validExercise}/publish`,
    { method: 'POST' },
    (value) => value as unknown[],
  )
  return payload.map((record) => AdminContractRecordSchema.parse(record))
}

export async function getPublicContractsPage(): Promise<PublicContractsPage> {
  const response = await fetch(`${apiBaseUrl}/public/contracts`)
  if (!response.ok) throw await getApiError(response)
  return PublicContractsPageSchema.parse(await response.json())
}
