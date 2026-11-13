import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { createApp } from '../app.js'

describe('HTTP error responses', () => {
  it('returns JSON for an unknown route', async () => {
    const response = await request(createApp())
      .get('/api/route-that-does-not-exist')
      .expect(404)

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).toEqual({ message: 'Rota não encontrada.' })
  })

  it('adds a request ID and disables caching on authenticated routes', async () => {
    const response = await request(createApp())
      .get('/api/admin/general-data')
      .expect(401)

    expect(response.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
    expect(response.headers['cache-control']).toBe('no-store')
  })

  it('returns JSON for a malformed request body', async () => {
    const response = await request(createApp())
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email":')
      .expect(400)

    expect(response.body).toEqual({ message: 'JSON malformado.' })
  })

  it('returns validation issues for an invalid query', async () => {
    const response = await request(createApp())
      .get('/api/public/general-data?exercise=invalid')
      .expect(400)

    expect(response.body).toMatchObject({
      message: 'Dados inválidos.',
      issues: [
        {
          path: 'exercise',
        },
      ],
    })
  })
})
