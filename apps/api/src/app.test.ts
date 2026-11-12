import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'

import {
  createAuthService,
  type AuthRepository,
  type StoredUser,
} from './auth/auth-service.js'
import { createApp } from './app.js'
import {
  createGeneralDataService,
  type GeneralDataRepository,
} from './general-data/general-data-service.js'
import type {
  CreateGeneralDataRequest,
  GeneralData,
  UpdateGeneralDataRequest,
} from '@oab-transparencia/contracts/transparency'

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

function createMemoryAuthRepository(): AuthRepository {
  const users = new Map<string, StoredUser>()
  const sessions = new Map<string, string>()

  return {
    async countUsers() {
      return users.size
    },
    async findUserByEmail(email) {
      return users.get(email) ?? null
    },
    async findActiveSession(tokenHash) {
      const userId = sessions.get(tokenHash)
      if (!userId) return null
      return [...users.values()].find((user) => user.id === userId) ?? null
    },
    async createSession({ tokenHash, userId }) {
      sessions.set(tokenHash, userId)
    },
    async createUser(input) {
      const user: StoredUser = {
        id: `user-${users.size + 1}`,
        ...input,
        status: 'ACTIVE',
      }
      users.set(user.email, user)
      return user
    },
    async revokeSession(tokenHash) {
      sessions.delete(tokenHash)
    },
    async updateLastLoginAt() {},
  }
}

function createMemoryGeneralDataRepository(): GeneralDataRepository {
  const records = new Map<string, GeneralData>()
  return {
    async list() {
      return [...records.values()]
    },
    async findByExercise(exercise) {
      return (
        [...records.values()].find((record) => record.exercise === exercise) ??
        null
      )
    },
    async findPublishedByExercise(exercise) {
      return (
        [...records.values()].find(
          (record) =>
            record.status === 'PUBLISHED' &&
            (!exercise || record.exercise === exercise),
        ) ?? null
      )
    },
    async create(input: CreateGeneralDataRequest & { userId: string }) {
      const now = new Date().toISOString()
      const record: GeneralData = {
        id: `general-${records.size + 1}`,
        ...input,
        status: 'DRAFT',
        createdAt: now,
        updatedAt: now,
        publishedAt: null,
      }
      delete (record as GeneralData & { userId?: string }).userId
      records.set(record.id, record)
      return record
    },
    async update(id, input: UpdateGeneralDataRequest & { userId: string }) {
      const current = records.get(id)
      if (!current) return null
      const { userId: _userId, ...changes } = input
      const updated = {
        ...current,
        ...changes,
        updatedAt: new Date().toISOString(),
        ...(changes.status === 'DRAFT' ? { publishedAt: null } : {}),
      }
      records.set(id, updated)
      return updated
    },
    async publish(id) {
      const current = records.get(id)
      if (!current) return null
      const updated = {
        ...current,
        status: 'PUBLISHED' as const,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      records.set(id, updated)
      return updated
    },
  }
}

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

describe('general data endpoints', () => {
  const registrationKey = 'uma-chave-de-cadastro-segura'
  const password = 'senha-segura-com-12-caracteres'
  const data = {
    exercise: 2025,
    totalExpenses: 100,
    totalRevenue: 120,
    budget: 150,
    patrimony: 200,
    activeLawyers: 10,
    activeSocieties: 2,
    supportRooms: 3,
    registeredMembers: 20,
  }

  it('requires a session, saves a draft and exposes it only after publishing', async () => {
    const app = createApp({
      authService: createAuthService(createMemoryAuthRepository(), {
        registrationKey,
      }),
      generalDataService: createGeneralDataService(
        createMemoryGeneralDataRepository(),
      ),
    })
    await request(app).post('/api/admin/general-data').send(data).expect(401)
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
    const draft = await request(app)
      .post('/api/admin/general-data')
      .set(authorization)
      .send(data)
    expect(draft.status).toBe(201)
    expect(draft.body.status).toBe('DRAFT')
    await request(app).get('/api/public/general-data').expect(404)
    const published = await request(app)
      .post(`/api/admin/general-data/${draft.body.id}/publish`)
      .set(authorization)
      .expect(200)
    expect(published.body.status).toBe('PUBLISHED')
    expect(
      (await request(app).get('/api/public/general-data').expect(200)).body
        .exercise,
    ).toBe(2025)
  })

  it('rejects a second record for the same exercise', async () => {
    const app = createApp({
      authService: createAuthService(createMemoryAuthRepository(), {
        registrationKey,
      }),
      generalDataService: createGeneralDataService(
        createMemoryGeneralDataRepository(),
      ),
    })
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
    await request(app)
      .post('/api/admin/general-data')
      .set(authorization)
      .send(data)
      .expect(201)
    await request(app)
      .post('/api/admin/general-data')
      .set(authorization)
      .send(data)
      .expect(409)
  })
})
