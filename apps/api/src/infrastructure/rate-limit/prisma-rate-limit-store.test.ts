import { describe, expect, it } from 'vitest'
import type { DatabaseClient } from '../database/prisma.js'
import { PrismaRateLimitStore } from './prisma-rate-limit-store.js'

type Counter = {
  key: string
  hits: number
  resetAt: Date
  updatedAt: Date
}

function createSharedClient() {
  const counters = new Map<string, Counter>()

  const rateLimitCounter = {
    async findUnique({ where }: { where: { key: string } }) {
      return counters.get(where.key) ?? null
    },
    async upsert({
      where,
      create,
      update,
    }: {
      where: { key: string }
      create: Omit<Counter, 'updatedAt'>
      update: Pick<Counter, 'hits' | 'resetAt'>
    }) {
      const current = counters.get(where.key)
      const counter = current
        ? { ...current, ...update, updatedAt: new Date() }
        : { ...create, updatedAt: new Date() }
      counters.set(where.key, counter)
      return counter
    },
    async update({
      where,
      data,
    }: {
      where: { key: string }
      data: { hits: { increment: number } }
    }) {
      const current = counters.get(where.key)
      if (!current) throw new Error('Counter not found')
      const counter = {
        ...current,
        hits: current.hits + data.hits.increment,
        updatedAt: new Date(),
      }
      counters.set(where.key, counter)
      return counter
    },
    async deleteMany({
      where,
    }: {
      where: { key?: string; resetAt?: { lte: Date } }
    }) {
      let count = 0
      for (const [key, counter] of counters) {
        const matchesKey = where.key === undefined || where.key === key
        const matchesExpiry =
          where.resetAt === undefined || counter.resetAt <= where.resetAt.lte
        if (matchesKey && matchesExpiry) {
          counters.delete(key)
          count += 1
        }
      }
      return { count }
    },
  }

  const client = {
    rateLimitCounter,
    async $transaction(
      operation: (transaction: { rateLimitCounter: typeof rateLimitCounter }) =>
        Promise<unknown>,
    ) {
      return operation({ rateLimitCounter })
    },
  } as unknown as DatabaseClient

  return client
}

describe('PrismaRateLimitStore', () => {
  it('shares counters between store instances using the same database', async () => {
    const client = createSharedClient()
    const firstInstance = new PrismaRateLimitStore('login', 60_000, client)
    const secondInstance = new PrismaRateLimitStore('login', 60_000, client)

    await firstInstance.increment('client-key')
    const secondHit = await secondInstance.increment('client-key')

    expect(secondHit.totalHits).toBe(2)
    await expect(firstInstance.get('client-key')).resolves.toMatchObject({
      totalHits: 2,
    })
  })

  it('isolates counters from different limiter prefixes', async () => {
    const client = createSharedClient()
    const loginStore = new PrismaRateLimitStore('login', 60_000, client)
    const registerStore = new PrismaRateLimitStore('register', 60_000, client)

    await loginStore.increment('client-key')

    await expect(registerStore.get('client-key')).resolves.toBeUndefined()
  })
})
