import { ExerciseSchema } from '@oab-transparencia/contracts/common'
import {
  AdminPatrimonialAssetSchema,
  CreatePatrimonialAssetRequestSchema,
  PublicPatrimonialPageSchema,
  UpdatePatrimonialAssetRequestSchema,
  type AdminPatrimonialAsset,
  type CreatePatrimonialAssetRequest,
  type PublicPatrimonialPage,
  type UpdatePatrimonialAssetRequest,
} from '@oab-transparencia/contracts/transparency'
import { apiBaseUrl, authenticatedRequest, getApiError } from '@/lib/api-client'

const adminPageQuery = '?page=1&limit=100'

export async function listPatrimonialAssets(
  token: string,
): Promise<AdminPatrimonialAsset[]> {
  const payload = await authenticatedRequest(
    token,
    `/admin/patrimonial${adminPageQuery}`,
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
  const validInput = CreatePatrimonialAssetRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/patrimonial',
    { body: JSON.stringify(validInput), method: 'POST' },
    (value) => AdminPatrimonialAssetSchema.parse(value),
  )
}

export async function updatePatrimonialAsset(
  token: string,
  id: string,
  input: UpdatePatrimonialAssetRequest,
): Promise<AdminPatrimonialAsset> {
  const validInput = UpdatePatrimonialAssetRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    `/admin/patrimonial/${id}`,
    { body: JSON.stringify(validInput), method: 'PATCH' },
    (value) => AdminPatrimonialAssetSchema.parse(value),
  )
}

export async function publishPatrimonialExercise(
  token: string,
  exercise: number,
): Promise<AdminPatrimonialAsset[]> {
  const validExercise = ExerciseSchema.parse(exercise)
  const payload = await authenticatedRequest(
    token,
    `/admin/patrimonial/${validExercise}/publish`,
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
