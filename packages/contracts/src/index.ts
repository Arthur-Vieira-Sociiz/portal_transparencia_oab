import { z } from 'zod'

export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.literal('portal-transparencia-api'),
})

export type HealthResponse = z.infer<typeof HealthResponseSchema>
