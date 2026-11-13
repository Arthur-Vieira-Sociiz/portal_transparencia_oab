import { ExerciseSchema } from '@oab-transparencia/contracts/common'
import {
  AdminHumanResourcesRecordSchema,
  CreateHumanResourcesRequestSchema,
  PublicHumanResourcesPageSchema,
  UpdateHumanResourcesRequestSchema,
  type AdminHumanResourcesRecord,
  type CreateHumanResourcesRequest,
  type PublicHumanResourcesPage,
  type UpdateHumanResourcesRequest,
} from '@oab-transparencia/contracts/transparency'
import { apiBaseUrl, authenticatedRequest, getApiError } from '@/lib/api-client'

const adminPageQuery = '?page=1&limit=100'

export async function listHumanResources(
  token: string,
): Promise<AdminHumanResourcesRecord[]> {
  const payload = await authenticatedRequest(
    token,
    `/admin/human-resources${adminPageQuery}`,
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
  const validInput = CreateHumanResourcesRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/human-resources',
    { body: JSON.stringify(validInput), method: 'POST' },
    (value) => AdminHumanResourcesRecordSchema.parse(value),
  )
}

export async function updateHumanResources(
  token: string,
  id: string,
  input: UpdateHumanResourcesRequest,
): Promise<AdminHumanResourcesRecord> {
  const validInput = UpdateHumanResourcesRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    `/admin/human-resources/${id}`,
    { body: JSON.stringify(validInput), method: 'PATCH' },
    (value) => AdminHumanResourcesRecordSchema.parse(value),
  )
}

export async function deleteHumanResources(token: string, id: string) {
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
  const validExercise = ExerciseSchema.parse(exercise)
  const payload = await authenticatedRequest(
    token,
    `/admin/human-resources/${validExercise}/publish`,
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
