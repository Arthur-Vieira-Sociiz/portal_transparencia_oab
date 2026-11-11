import {
  HealthResponseSchema,
  type HealthResponse,
} from '@oab-transparencia/contracts'

export async function getApiHealth(): Promise<HealthResponse> {
  const response = await fetch('/api/health')

  if (!response.ok) {
    throw new Error('A API não respondeu corretamente.')
  }

  return HealthResponseSchema.parse(await response.json())
}
