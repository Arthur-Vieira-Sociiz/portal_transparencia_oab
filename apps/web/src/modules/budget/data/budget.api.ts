import { ExerciseSchema } from '@oab-transparencia/contracts/common'
import {
  AdminBudgetRecordSchema,
  CreateBudgetRecordRequestSchema,
  PublicBudgetRecordsSchema,
  UpdateBudgetRecordRequestSchema,
  type AdminBudgetRecord,
  type CreateBudgetRecordRequest,
  type PublicBudgetRecords,
  type UpdateBudgetRecordRequest,
} from '@oab-transparencia/contracts/transparency'
import { apiBaseUrl, authenticatedRequest, getApiError } from '@/lib/api-client'

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
  const validInput = CreateBudgetRecordRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/budget',
    { body: JSON.stringify(validInput), method: 'POST' },
    (value) => AdminBudgetRecordSchema.parse(value),
  )
}

export async function updateBudgetRecord(
  token: string,
  id: string,
  input: UpdateBudgetRecordRequest,
): Promise<AdminBudgetRecord> {
  const validInput = UpdateBudgetRecordRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    `/admin/budget/${id}`,
    { body: JSON.stringify(validInput), method: 'PATCH' },
    (value) => AdminBudgetRecordSchema.parse(value),
  )
}

export async function publishBudgetExercise(
  token: string,
  exercise: number,
): Promise<AdminBudgetRecord[]> {
  const validExercise = ExerciseSchema.parse(exercise)
  const payload = await authenticatedRequest(
    token,
    `/admin/budget/${validExercise}/publish`,
    { method: 'POST' },
    (value) => value as unknown[],
  )
  return payload.map((record) => AdminBudgetRecordSchema.parse(record))
}

export async function getPublicBudgetRecords(
  exercise?: number,
): Promise<PublicBudgetRecords> {
  const query =
    exercise === undefined ? '' : `?exercise=${ExerciseSchema.parse(exercise)}`
  const response = await fetch(`${apiBaseUrl}/public/budget${query}`)
  if (!response.ok) throw await getApiError(response)
  return PublicBudgetRecordsSchema.parse(await response.json())
}
