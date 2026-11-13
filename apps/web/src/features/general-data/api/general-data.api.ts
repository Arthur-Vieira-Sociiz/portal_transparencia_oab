import { ExerciseSchema } from '@oab-transparencia/contracts/common'
import {
  CreateGeneralDataRequestSchema,
  GeneralDataSchema,
  type CreateGeneralDataRequest,
  type GeneralData,
  type UpdateGeneralDataRequest,
} from '@oab-transparencia/contracts/transparency'
import { apiBaseUrl, authenticatedRequest, getApiError } from '@/lib/api-client'

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
  const query =
    exercise === undefined ? '' : `?exercise=${ExerciseSchema.parse(exercise)}`
  const response = await fetch(`${apiBaseUrl}/public/general-data${query}`)
  if (!response.ok) throw await getApiError(response)
  return GeneralDataSchema.parse(await response.json())
}
