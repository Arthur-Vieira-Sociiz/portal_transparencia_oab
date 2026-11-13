import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'

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

  it('cleans expired and revoked sessions before issuing a new token', async () => {
    const repository = createMemoryAuthRepository()
    const cleanup = vi.spyOn(repository, 'deleteExpiredAndRevokedSessions')
    const service = createAuthService(repository, { registrationKey })

    await service.register({
      name: 'Equipe OAB',
      email: 'admin@oab-al.org.br',
      password,
      registrationKey,
    })

    expect(cleanup).toHaveBeenCalledOnce()
    expect(cleanup).toHaveBeenCalledWith(expect.any(Date))
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

  it('closes public registration after the first administrator', async () => {
    const app = createAuthenticatedApp()
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Primeiro administrador',
        email: 'admin@oab-al.org.br',
        password,
        registrationKey,
      })
      .expect(201)

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Segundo administrador',
        email: 'outro@oab-al.org.br',
        password,
        registrationKey,
      })
      .expect(403)

    expect(response.body).toEqual({
      message: 'O cadastro inicial já foi encerrado.',
    })
  })

  it('limits failed logins without revoking an existing session', async () => {
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

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@oab-al.org.br',
          password: 'senha-incorreta-com-12-caracteres',
        })
        .expect(401)
    }

    const limited = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@oab-al.org.br', password })
      .expect(429)
    expect(limited.headers['retry-after']).toBeDefined()
    expect(limited.body.code).toBe('LOGIN_RATE_LIMITED')

    await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registration.body.token}`)
      .expect(200)
  })

  it('uses the client IP supplied by Vercel without sharing login limits', async () => {
    const previousVercel = process.env.VERCEL
    process.env.VERCEL = '1'

    try {
      const app = createAuthenticatedApp()
      await request(app)
        .post('/api/auth/register')
        .set('x-vercel-forwarded-for', '203.0.113.10')
        .send({
          name: 'Equipe OAB',
          email: 'admin@oab-al.org.br',
          password,
          registrationKey,
        })
        .expect(201)

      for (let attempt = 0; attempt < 5; attempt += 1) {
        await request(app)
          .post('/api/auth/login')
          .set('x-vercel-forwarded-for', '203.0.113.10')
          .send({
            email: 'admin@oab-al.org.br',
            password: 'senha-incorreta-com-12-caracteres',
          })
          .expect(401)
      }

      await request(app)
        .post('/api/auth/login')
        .set('x-vercel-forwarded-for', '198.51.100.20')
        .send({ email: 'admin@oab-al.org.br', password })
        .expect(200)
    } finally {
      if (previousVercel === undefined) delete process.env.VERCEL
      else process.env.VERCEL = previousVercel
    }
  })

  it('revokes every session when an authenticated user exceeds the limit', async () => {
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
    const authorization = { Authorization: `Bearer ${registration.body.token}` }

    for (let requestNumber = 0; requestNumber < 30; requestNumber += 1) {
      await request(app).get('/api/admin/users').set(authorization).expect(200)
    }

    const limited = await request(app)
      .get('/api/admin/users')
      .set(authorization)
      .expect(429)
    expect(limited.headers['retry-after']).toBe('900')
    expect(limited.body.code).toBe('SESSION_REVOKED_RATE_LIMIT')

    await request(app).get('/api/auth/me').set(authorization).expect(401)

    const blockedLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@oab-al.org.br', password })
      .expect(429)
    expect(blockedLogin.body.code).toBe('ACCOUNT_TEMPORARILY_BLOCKED')
  })

  it('allows login again after the temporary account block ends', async () => {
    const repository = createMemoryAuthRepository()
    const service = createAuthService(repository, { registrationKey })
    const session = await service.register({
      name: 'Equipe OAB',
      email: 'admin@oab-al.org.br',
      password,
      registrationKey,
    })

    await service.blockUserForRateLimit(
      session.user.id,
      new Date(Date.now() + 15 * 60 * 1000),
    )
    await expect(
      service.login({ email: 'admin@oab-al.org.br', password }),
    ).rejects.toMatchObject({ code: 'RATE_LIMITED' })

    await service.blockUserForRateLimit(
      session.user.id,
      new Date(Date.now() - 1),
    )
    await expect(
      service.login({ email: 'admin@oab-al.org.br', password }),
    ).resolves.toMatchObject({ user: { id: session.user.id } })
  })
})
