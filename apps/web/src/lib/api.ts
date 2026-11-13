import {
  HealthResponseSchema,
  type HealthResponse,
} from '@oab-transparencia/contracts/health'
import {
  AuthSessionSchema,
  AuthenticatedUserSchema,
  AdminCreateUserRequestSchema,
  AdminCreatedUserResponseSchema,
  AdminUserSchema,
  type AuthSession,
  type AdminCreateUserRequest,
  type AdminCreatedUserResponse,
  type AdminUser,
  type AuthenticatedUser,
} from '@oab-transparencia/contracts/auth'
import {
  AdminPatrimonialAssetSchema,
  CreatePatrimonialAssetRequestSchema,
  UpdatePatrimonialAssetRequestSchema,
  PublicPatrimonialPageSchema,
  AdminContractRecordSchema,
  CreateContractRecordRequestSchema,
  UpdateContractRecordRequestSchema,
  SupplierSchema,
  CreateSupplierRequestSchema,
  UpdateSupplierRequestSchema,
  PublicContractsPageSchema,
  ReportsIndicatorSchema,
  CreateReportsIndicatorRequestSchema,
  UpdateReportsIndicatorRequestSchema,
  PublicReportsPageSchema,
  type AdminPatrimonialAsset,
  type CreatePatrimonialAssetRequest,
  type UpdatePatrimonialAssetRequest,
  type PublicPatrimonialPage,
  type AdminContractRecord,
  type CreateContractRecordRequest,
  type UpdateContractRecordRequest,
  type Supplier,
  type CreateSupplierRequest,
  type PublicContractsPage,
  type ReportsIndicator,
  type CreateReportsIndicatorRequest,
  type UpdateReportsIndicatorRequest,
  type PublicReportsPage,
} from '@oab-transparencia/contracts/transparency'
import { apiBaseUrl, authenticatedRequest, getApiError } from './api-client'
const currentAdminPageQuery = '?page=1&limit=100'

export async function getApiHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiBaseUrl}/health`)

  if (!response.ok) {
    throw new Error('A API não respondeu corretamente.')
  }

  return HealthResponseSchema.parse(await response.json())
}

export async function login(input: {
  email: string
  password: string
}): Promise<AuthSession> {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  if (!response.ok) throw await getApiError(response)
  return AuthSessionSchema.parse(await response.json())
}

export async function logout(token: string) {
  const response = await fetch(`${apiBaseUrl}/auth/logout`, {
    headers: { Authorization: `Bearer ${token}` },
    method: 'POST',
  })
  if (!response.ok) throw await getApiError(response)
}

export async function getCurrentUser(
  token: string,
): Promise<AuthenticatedUser> {
  const payload = await authenticatedRequest(
    token,
    '/auth/me',
    {},
    (value) => value as { user: unknown },
  )
  return AuthenticatedUserSchema.parse(payload.user)
}

export async function listAdminUsers(token: string): Promise<AdminUser[]> {
  const payload = await authenticatedRequest(
    token,
    `/admin/users${currentAdminPageQuery}`,
    {},
    (value) => value as { users: unknown[] },
  )
  return payload.users.map((user) => AdminUserSchema.parse(user))
}

export async function createAdminUser(
  token: string,
  input: AdminCreateUserRequest,
): Promise<AdminCreatedUserResponse> {
  const valid = AdminCreateUserRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/users',
    { body: JSON.stringify(valid), method: 'POST' },
    (value) => AdminCreatedUserResponseSchema.parse(value),
  )
}

export async function listPatrimonialAssets(
  token: string,
): Promise<AdminPatrimonialAsset[]> {
  const payload = await authenticatedRequest(
    token,
    `/admin/patrimonial${currentAdminPageQuery}`,
    {},
    (value) => value as { records: unknown[] },
  )
  return payload.records.map((record) =>
    AdminPatrimonialAssetSchema.parse(record),
  )
}
export async function createPatrimonialAsset(
  token: string,
  input: CreatePatrimonialAssetRequest,
): Promise<AdminPatrimonialAsset> {
  const valid = CreatePatrimonialAssetRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/patrimonial',
    { body: JSON.stringify(valid), method: 'POST' },
    (value) => AdminPatrimonialAssetSchema.parse(value),
  )
}
export async function updatePatrimonialAsset(
  token: string,
  id: string,
  input: UpdatePatrimonialAssetRequest,
): Promise<AdminPatrimonialAsset> {
  const valid = UpdatePatrimonialAssetRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    `/admin/patrimonial/${id}`,
    { body: JSON.stringify(valid), method: 'PATCH' },
    (value) => AdminPatrimonialAssetSchema.parse(value),
  )
}
export async function publishPatrimonialExercise(
  token: string,
  exercise: number,
): Promise<AdminPatrimonialAsset[]> {
  const payload = await authenticatedRequest(
    token,
    `/admin/patrimonial/${exercise}/publish`,
    { method: 'POST' },
    (value) => value as unknown[],
  )
  return payload.map((record) => AdminPatrimonialAssetSchema.parse(record))
}
export async function getPublicPatrimonialPage(): Promise<PublicPatrimonialPage> {
  const response = await fetch(`${apiBaseUrl}/public/patrimonial`)
  if (!response.ok) throw await getApiError(response)
  return PublicPatrimonialPageSchema.parse(await response.json())
}

export async function listContracts(
  token: string,
): Promise<AdminContractRecord[]> {
  const payload = await authenticatedRequest(
    token,
    `/admin/contracts${currentAdminPageQuery}`,
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
    `/admin/suppliers${currentAdminPageQuery}`,
    {},
    (value) => value as { suppliers: unknown[] },
  )
  return payload.suppliers.map((supplier) => SupplierSchema.parse(supplier))
}
export async function createSupplier(
  token: string,
  input: CreateSupplierRequest,
): Promise<Supplier> {
  const valid = CreateSupplierRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/suppliers',
    { body: JSON.stringify(valid), method: 'POST' },
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
export async function updateSupplier(
  token: string,
  id: string,
  input: CreateSupplierRequest,
): Promise<Supplier> {
  const valid = UpdateSupplierRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    `/admin/suppliers/${id}`,
    { body: JSON.stringify(valid), method: 'PATCH' },
    (value) => SupplierSchema.parse(value),
  )
}
export async function createContract(
  token: string,
  input: CreateContractRecordRequest,
): Promise<AdminContractRecord> {
  const valid = CreateContractRecordRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/contracts',
    { body: JSON.stringify(valid), method: 'POST' },
    (value) => AdminContractRecordSchema.parse(value),
  )
}
export async function updateContract(
  token: string,
  id: string,
  input: UpdateContractRecordRequest,
): Promise<AdminContractRecord> {
  const valid = UpdateContractRecordRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    `/admin/contracts/${id}`,
    { body: JSON.stringify(valid), method: 'PATCH' },
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
  const payload = await authenticatedRequest(
    token,
    `/admin/contracts/${exercise}/publish`,
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

export async function listReportsIndicators(
  token: string,
): Promise<ReportsIndicator[]> {
  const payload = await authenticatedRequest(
    token,
    '/admin/reports',
    {},
    (value) => value as { indicators: unknown[] },
  )
  return payload.indicators.map((item) => ReportsIndicatorSchema.parse(item))
}
export async function createReportsIndicator(
  token: string,
  input: CreateReportsIndicatorRequest,
): Promise<ReportsIndicator> {
  const valid = CreateReportsIndicatorRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/reports',
    { body: JSON.stringify(valid), method: 'POST' },
    (value) => ReportsIndicatorSchema.parse(value),
  )
}
export async function updateReportsIndicator(
  token: string,
  id: string,
  input: UpdateReportsIndicatorRequest,
): Promise<ReportsIndicator> {
  const valid = UpdateReportsIndicatorRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    `/admin/reports/${id}`,
    { body: JSON.stringify(valid), method: 'PATCH' },
    (value) => ReportsIndicatorSchema.parse(value),
  )
}
export async function deleteReportsIndicator(
  token: string,
  id: string,
): Promise<void> {
  await authenticatedRequest(
    token,
    `/admin/reports/${id}`,
    { method: 'DELETE' },
    () => undefined,
  )
}
export async function publishReportsExercise(
  token: string,
  exercise: number,
): Promise<ReportsIndicator[]> {
  const payload = await authenticatedRequest(
    token,
    `/admin/reports/${exercise}/publish`,
    { method: 'POST' },
    (value) => value as unknown[],
  )
  return payload.map((item) => ReportsIndicatorSchema.parse(item))
}
export async function getPublicReportsPage(): Promise<PublicReportsPage> {
  const response = await fetch(`${apiBaseUrl}/public/reports`)
  if (!response.ok) throw await getApiError(response)
  return PublicReportsPageSchema.parse(await response.json())
}
