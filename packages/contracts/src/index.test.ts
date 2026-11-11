import { describe, expect, it } from 'vitest'

import { HealthResponseSchema } from './index.js'

describe('HealthResponseSchema', () => {
  it('accepts the API health response', () => {
    expect(
      HealthResponseSchema.parse({
        status: 'ok',
        service: 'portal-transparencia-api',
      }),
    ).toEqual({
      status: 'ok',
      service: 'portal-transparencia-api',
    })
  })
})
