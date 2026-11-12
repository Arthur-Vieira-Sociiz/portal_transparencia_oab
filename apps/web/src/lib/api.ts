import {
  HealthResponseSchema,
  type HealthResponse,
} from '@oab-transparencia/contracts/health'
import {
  AuthSessionSchema,
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
  CreateGeneralDataRequestSchema,
  GeneralDataSchema,
  AdminBudgetRecordSchema,
  CreateBudgetRecordRequestSchema,
  PublicBudgetRecordsSchema,
  UpdateBudgetRecordRequestSchema,
  AdminFinancialDocumentRecordSchema,
  CreateFinancialDocumentRequestSchema,
  UpdateFinancialDocumentRequestSchema,
  PublicFinancialPageSchema,
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
  type AdminBudgetRecord,
  type CreateBudgetRecordRequest,
  type PublicBudgetRecords,
  type UpdateBudgetRecordRequest,
  type CreateGeneralDataRequest,
  type GeneralData,
  type UpdateGeneralDataRequest,
  type AdminFinancialDocumentRecord,
  type CreateFinancialDocumentRequest,
  type UpdateFinancialDocumentRequest,
  type PublicFinancialPage,
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
} from '@oab-transparencia/contracts/transparency'

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

export async function getApiHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiBaseUrl}/health`)

  if (!response.ok) {
    throw new Error('A API não respondeu corretamente.')
  }

  return HealthResponseSchema.parse(await response.json())
}

type ApiError = Error & { status?: number }

async function getApiError(response: Response): Promise<ApiError> {
  const payload = (await response.json().catch(() => null)) as {
    message?: string
  } | null
  const error = new Error(
    payload?.message ?? 'Não foi possível concluir a solicitação.',
  ) as ApiError
  error.status = response.status
  return error
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
  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw await getApiError(response)
  const payload = (await response.json()) as { user: AuthenticatedUser }
  return payload.user
}

export async function listAdminUsers(token: string): Promise<AdminUser[]> {
  const payload = await authenticatedRequest(
    token,
    '/admin/users',
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

async function authenticatedRequest<T>(
  token: string,
  path: string,
  init: RequestInit = {},
  parse: (payload: unknown) => T,
) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  })
  if (!response.ok) throw await getApiError(response)
  if (response.status === 204) return parse(undefined)
  return parse(await response.json())
}

export async function listGeneralData(token: string): Promise<GeneralData[]> {
  const payload = await authenticatedRequest(
    token,
    '/admin/general-data',
    {},
    (value) => value as { records: unknown[] },
  )
  return payload.records.map((record) => GeneralDataSchema.parse(record))
}

export async function createGeneralData(
  token: string,
  input: CreateGeneralDataRequest,
): Promise<GeneralData> {
  const validInput = CreateGeneralDataRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/general-data',
    { body: JSON.stringify(validInput), method: 'POST' },
    (value) => GeneralDataSchema.parse(value),
  )
}

export async function updateGeneralData(
  token: string,
  id: string,
  input: UpdateGeneralDataRequest,
): Promise<GeneralData> {
  return authenticatedRequest(
    token,
    `/admin/general-data/${id}`,
    { body: JSON.stringify(input), method: 'PATCH' },
    (value) => GeneralDataSchema.parse(value),
  )
}

export async function publishGeneralData(
  token: string,
  id: string,
): Promise<GeneralData> {
  return authenticatedRequest(
    token,
    `/admin/general-data/${id}/publish`,
    { method: 'POST' },
    (value) => GeneralDataSchema.parse(value),
  )
}

export async function getPublicGeneralData(
  exercise?: number,
): Promise<GeneralData> {
  const query = exercise ? `?exercise=${exercise}` : ''
  const response = await fetch(`${apiBaseUrl}/public/general-data${query}`)
  if (!response.ok) throw await getApiError(response)
  return GeneralDataSchema.parse(await response.json())
}

export async function listBudgetRecords(
  token: string,
): Promise<AdminBudgetRecord[]> {
  const payload = await authenticatedRequest(
    token,
    '/admin/budget',
    {},
    (value) => value as { records: unknown[] },
  )
  return payload.records.map((record) => AdminBudgetRecordSchema.parse(record))
}
export async function createBudgetRecord(
  token: string,
  input: CreateBudgetRecordRequest,
): Promise<AdminBudgetRecord> {
  const valid = CreateBudgetRecordRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/budget',
    { body: JSON.stringify(valid), method: 'POST' },
    (value) => AdminBudgetRecordSchema.parse(value),
  )
}
export async function updateBudgetRecord(
  token: string,
  id: string,
  input: UpdateBudgetRecordRequest,
): Promise<AdminBudgetRecord> {
  const valid = UpdateBudgetRecordRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    `/admin/budget/${id}`,
    { body: JSON.stringify(valid), method: 'PATCH' },
    (value) => AdminBudgetRecordSchema.parse(value),
  )
}
export async function publishBudgetExercise(
  token: string,
  exercise: number,
): Promise<AdminBudgetRecord[]> {
  const payload = await authenticatedRequest(
    token,
    `/admin/budget/${exercise}/publish`,
    { method: 'POST' },
    (value) => value as unknown[],
  )
  return payload.map((record) => AdminBudgetRecordSchema.parse(record))
}
export async function getPublicBudgetRecords(
  exercise?: number,
): Promise<PublicBudgetRecords> {
  const query = exercise ? `?exercise=${exercise}` : ''
  const response = await fetch(`${apiBaseUrl}/public/budget${query}`)
  if (!response.ok) throw await getApiError(response)
  return PublicBudgetRecordsSchema.parse(await response.json())
}

export async function listFinancialDocuments(
  token: string,
): Promise<AdminFinancialDocumentRecord[]> {
  const payload = await authenticatedRequest(
    token,
    '/admin/financial',
    {},
    (value) => value as { records: unknown[] },
  )
  return payload.records.map((record) =>
    AdminFinancialDocumentRecordSchema.parse(record),
  )
}

export async function createFinancialDocument(
  token: string,
  input: CreateFinancialDocumentRequest,
): Promise<AdminFinancialDocumentRecord> {
  const valid = CreateFinancialDocumentRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/financial',
    { body: JSON.stringify(valid), method: 'POST' },
    (value) => AdminFinancialDocumentRecordSchema.parse(value),
  )
}

export async function updateFinancialDocument(
  token: string,
  id: string,
  input: UpdateFinancialDocumentRequest,
): Promise<AdminFinancialDocumentRecord> {
  const valid = UpdateFinancialDocumentRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    `/admin/financial/${id}`,
    { body: JSON.stringify(valid), method: 'PATCH' },
    (value) => AdminFinancialDocumentRecordSchema.parse(value),
  )
}

export async function publishFinancialExercise(
  token: string,
  exercise: number,
): Promise<AdminFinancialDocumentRecord[]> {
  const payload = await authenticatedRequest(
    token,
    `/admin/financial/${exercise}/publish`,
    { method: 'POST' },
    (value) => value as unknown[],
  )
  return payload.map((record) =>
    AdminFinancialDocumentRecordSchema.parse(record),
  )
}

export async function getPublicFinancialPage(): Promise<PublicFinancialPage> {
  const response = await fetch(`${apiBaseUrl}/public/financial`)
  if (!response.ok) throw await getApiError(response)
  return PublicFinancialPageSchema.parse(await response.json())
}

export async function listPatrimonialAssets(
  token: string,
): Promise<AdminPatrimonialAsset[]> {
  const payload = await authenticatedRequest(
    token,
    '/admin/patrimonial',
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
    '/admin/contracts',
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
    '/admin/suppliers',
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
