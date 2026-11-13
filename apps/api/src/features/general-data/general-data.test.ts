import type {
  CreateGeneralDataRequest,
  GeneralData,
  UpdateGeneralDataRequest,
} from '@oab-transparencia/contracts/transparency'
import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { createApp } from '../../app.js'
import { createMemoryAuthRepository } from '../../test/memory-auth-repository.js'
import { createAuthService } from '../auth/auth-service.js'
import {
  createGeneralDataService,
  type GeneralDataRepository,
} from './general-data-service.js'

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

  function createGeneralDataApp() {
    return createApp({
      authService: createAuthService(createMemoryAuthRepository(), {
        registrationKey,
      }),
      generalDataService: createGeneralDataService(
        createMemoryGeneralDataRepository(),
      ),
    })
  }

  it('requires a session, saves a draft and exposes it only after publishing', async () => {
    const app = createGeneralDataApp()
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
    const app = createGeneralDataApp()
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
