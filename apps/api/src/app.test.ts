import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'

import { createApp } from './app.js'

afterEach(() => {
  delete process.env.WEB_ORIGIN
})

describe('GET /api/health', () => {
  it('returns the shared health contract', async () => {
    const response = await request(createApp()).get('/api/health').expect(200)

    expect(response.body).toEqual({
      status: 'ok',
      service: 'portal-transparencia-api',
    })
  })

  it('allows any configured web origin from a comma-separated list', async () => {
    process.env.WEB_ORIGIN =
      'https://preview.example.com,https://transparencia.orbiapp.com.br'

    const response = await request(createApp())
      .get('/api/health')
      .set('Origin', 'https://transparencia.orbiapp.com.br')
      .expect(200)

    expect(response.headers['access-control-allow-origin']).toBe(
      'https://transparencia.orbiapp.com.br',
    )
  })
})
