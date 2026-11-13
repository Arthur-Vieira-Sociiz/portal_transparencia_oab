import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { createApp } from '../../app.js'
import { createMemoryAuthRepository } from '../../test/memory-auth-repository.js'
import { createAuthService } from './auth-service.js'

describe('authentication endpoints', () => {
  const registrationKey = 'uma-chave-de-cadastro-segura'
  const password = 'senha-segura-com-12-caracteres'

  function createAuthenticatedApp() {
    return createApp({
      authService: createAuthService(createMemoryAuthRepository(), {
        registrationKey,
      }),
    })
  }

  it('registers the first user as an administrator and authenticates the session', async () => {
    const app = createAuthenticatedApp()
    const registration = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Equipe OAB',
        email: 'admin@oab-al.org.br',
        password,
        registrationKey,
      })
      .expect(201)

    expect(registration.body.user).toMatchObject({
      email: 'admin@oab-al.org.br',
      role: 'ADMIN',
    })
    expect(registration.body.token).toEqual(expect.any(String))

    const currentUser = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registration.body.token}`)
      .expect(200)

    expect(currentUser.body.user.email).toBe('admin@oab-al.org.br')
  })

  it('rejects registration without the protected registration key', async () => {
    await request(createAuthenticatedApp())
      .post('/api/auth/register')
      .send({
        name: 'Equipe OAB',
        email: 'admin@oab-al.org.br',
        password,
        registrationKey: 'incorreta',
      })
      .expect(403)
  })

  it('logs in and revokes the session on logout', async () => {
    const app = createAuthenticatedApp()
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Equipe OAB',
        email: 'admin@oab-al.org.br',
        password,
        registrationKey,
      })
      .expect(201)

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@oab-al.org.br', password })
      .expect(200)

    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${login.body.token}`)
      .expect(204)

    await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`)
      .expect(401)
  })

  it('accepts uppercase letters in an e-mail during login', async () => {
    const app = createAuthenticatedApp()
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Equipe OAB',
        email: 'admin@oab-al.org.br',
        password,
        registrationKey,
      })
      .expect(201)

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'ADMIN@OAB-AL.ORG.BR', password })
      .expect(200)
  })
})
