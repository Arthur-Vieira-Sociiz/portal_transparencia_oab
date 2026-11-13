import { ExerciseSchema } from '@oab-transparencia/contracts/common'
import {
  CreateReportsIndicatorRequestSchema,
  PublicReportsPageSchema,
  ReportsIndicatorSchema,
  UpdateReportsIndicatorRequestSchema,
  type CreateReportsIndicatorRequest,
  type PublicReportsPage,
  type ReportsIndicator,
  type UpdateReportsIndicatorRequest,
} from '@oab-transparencia/contracts/transparency'
import { apiBaseUrl, authenticatedRequest, getApiError } from '@/lib/api-client'

export async function listReportsIndicators(
  token: string,
): Promise<ReportsIndicator[]> {
  const payload = await authenticatedRequest(
    token,
    '/admin/reports',
    {},
    (value) => value as { indicators: unknown[] },
  )
  return payload.indicators.map((indicator) =>
    ReportsIndicatorSchema.parse(indicator),
  )
}

export async function createReportsIndicator(
  token: string,
  input: CreateReportsIndicatorRequest,
): Promise<ReportsIndicator> {
  const validInput = CreateReportsIndicatorRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    '/admin/reports',
    { body: JSON.stringify(validInput), method: 'POST' },
    (value) => ReportsIndicatorSchema.parse(value),
  )
}

export async function updateReportsIndicator(
  token: string,
  id: string,
  input: UpdateReportsIndicatorRequest,
): Promise<ReportsIndicator> {
  const validInput = UpdateReportsIndicatorRequestSchema.parse(input)
  return authenticatedRequest(
    token,
    `/admin/reports/${id}`,
    { body: JSON.stringify(validInput), method: 'PATCH' },
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
  const validExercise = ExerciseSchema.parse(exercise)
  const payload = await authenticatedRequest(
    token,
    `/admin/reports/${validExercise}/publish`,
    { method: 'POST' },
    (value) => value as unknown[],
  )
  return payload.map((indicator) => ReportsIndicatorSchema.parse(indicator))
}

export async function getPublicReportsPage(): Promise<PublicReportsPage> {
  const response = await fetch(`${apiBaseUrl}/public/reports`)
  if (!response.ok) throw await getApiError(response)
  return PublicReportsPageSchema.parse(await response.json())
}
