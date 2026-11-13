import {
  HealthResponseSchema,
  type HealthResponse,
} from '@oab-transparencia/contracts/health'
import { ExerciseSchema } from '@oab-transparencia/contracts/common'
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
  AdminHumanResourcesRecordSchema,
  CreateHumanResourcesRequestSchema,
  UpdateHumanResourcesRequestSchema,
  PublicHumanResourcesPageSchema,
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
  type AdminHumanResourcesRecord,
  type CreateHumanResourcesRequest,
  type UpdateHumanResourcesRequest,
  type PublicHumanResourcesPage,
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

async function requestPublicGeneralData(query = ''): Promise<GeneralData> {
  const response = await fetch(`${apiBaseUrl}/public/general-data${query}`)
  if (!response.ok) throw await getApiError(response)
  return GeneralDataSchema.parse(await response.json())
}

export function getPublicGeneralData(): Promise<GeneralData> {
  return requestPublicGeneralData()
}

export function getGeneralDataByExercise(
  exercise: number,
): Promise<GeneralData> {
  const validExercise = ExerciseSchema.parse(exercise)
  return requestPublicGeneralData(`?exercise=${validExercise}`)
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

export async function listHumanResources(
  token: string,
): Promise<AdminHumanResourcesRecord[]> {
  const payload = await authenticatedRequest(
    token,
    '/admin/human-resources',
    {},
    (value) => value as { records: unknown[] },
  )
  return payload.records.map((record) =>
    AdminHumanResourcesRecordSchema.parse(record),
  )
}
export async function createHumanResources(
  token: string,
  input: CreateHumanResourcesRequest,
): Promise<AdminHumanResourcesRecord> {
  const valid = CreateHumanResourcesRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/human-resources',
    { body: JSON.stringify(valid), method: 'POST' },
    (value) => AdminHumanResourcesRecordSchema.parse(value),
  )
}
export async function updateHumanResources(
  token: string,
  id: string,
  input: UpdateHumanResourcesRequest,
): Promise<AdminHumanResourcesRecord> {
  const valid = UpdateHumanResourcesRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    `/admin/human-resources/${id}`,
    { body: JSON.stringify(valid), method: 'PATCH' },
    (value) => AdminHumanResourcesRecordSchema.parse(value),
  )
}
export async function deleteHumanResources(
  token: string,
  id: string,
): Promise<void> {
  await authenticatedRequest(
    token,
    `/admin/human-resources/${id}`,
    { method: 'DELETE' },
    () => undefined,
  )
}
export async function publishHumanResourcesExercise(
  token: string,
  exercise: number,
): Promise<AdminHumanResourcesRecord[]> {
  const payload = await authenticatedRequest(
    token,
    `/admin/human-resources/${exercise}/publish`,
    { method: 'POST' },
    (value) => value as unknown[],
  )
  return payload.map((record) => AdminHumanResourcesRecordSchema.parse(record))
}
export async function getPublicHumanResourcesPage(): Promise<PublicHumanResourcesPage> {
  const response = await fetch(`${apiBaseUrl}/public/human-resources`)
  if (!response.ok) throw await getApiError(response)
  return PublicHumanResourcesPageSchema.parse(await response.json())
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
