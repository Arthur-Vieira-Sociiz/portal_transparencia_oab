import { ExerciseSchema } from '@oab-transparencia/contracts/common'
import {
  AdminFinancialDocumentRecordSchema,
  CreateFinancialDocumentRequestSchema,
  PublicFinancialPageSchema,
  UpdateFinancialDocumentRequestSchema,
  type AdminFinancialDocumentRecord,
  type CreateFinancialDocumentRequest,
  type PublicFinancialPage,
  type UpdateFinancialDocumentRequest,
} from '@oab-transparencia/contracts/transparency'
import { apiBaseUrl, authenticatedRequest, getApiError } from '@/lib/api-client'

const adminPageQuery = '?page=1&limit=100'

export async function listFinancialDocuments(
  token: string,
): Promise<AdminFinancialDocumentRecord[]> {
  const payload = await authenticatedRequest(
    token,
    `/admin/financial${adminPageQuery}`,
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
  const validInput = CreateFinancialDocumentRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/financial',
    { body: JSON.stringify(validInput), method: 'POST' },
    (value) => AdminFinancialDocumentRecordSchema.parse(value),
  )
}

export async function updateFinancialDocument(
  token: string,
  id: string,
  input: UpdateFinancialDocumentRequest,
): Promise<AdminFinancialDocumentRecord> {
  const validInput = UpdateFinancialDocumentRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    `/admin/financial/${id}`,
    { body: JSON.stringify(validInput), method: 'PATCH' },
    (value) => AdminFinancialDocumentRecordSchema.parse(value),
  )
}

export async function publishFinancialExercise(
  token: string,
  exercise: number,
): Promise<AdminFinancialDocumentRecord[]> {
  const validExercise = ExerciseSchema.parse(exercise)
  const payload = await authenticatedRequest(
    token,
    `/admin/financial/${validExercise}/publish`,
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
