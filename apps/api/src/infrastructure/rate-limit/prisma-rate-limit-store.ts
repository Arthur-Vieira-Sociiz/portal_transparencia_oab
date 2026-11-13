import type {
  ClientRateLimitInfo,
  IncrementResponse,
  Store,
} from 'express-rate-limit'
import { getPrismaClient, type DatabaseClient } from '../database/prisma.js'

function isRetryableTransactionError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error.code === 'P2002' || error.code === 'P2034')
  )
}

export class PrismaRateLimitStore implements Store {
  readonly localKeys = false
  readonly prefix: string
  private lastCleanupAt = 0

  constructor(
    prefix: string,
    private readonly windowMs: number,
    private readonly client: DatabaseClient = getPrismaClient(),
  ) {
    this.prefix = `${prefix}:`
  }

  private qualify(key: string) {
    return `${this.prefix}${key}`
  }

  private async cleanupExpiredCounters(now: Date) {
    if (now.getTime() - this.lastCleanupAt < 60_000) return
    this.lastCleanupAt = now.getTime()
    await this.client.rateLimitCounter.deleteMany({
      where: { resetAt: { lte: now } },
    })
  }

  async get(key: string): Promise<ClientRateLimitInfo | undefined> {
    const counter = await this.client.rateLimitCounter.findUnique({
      where: { key: this.qualify(key) },
    })
    if (!counter || counter.resetAt <= new Date()) return undefined
    return { totalHits: counter.hits, resetTime: counter.resetAt }
  }

  async increment(key: string): Promise<IncrementResponse> {
    const now = new Date()
    await this.cleanupExpiredCounters(now)

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.client.$transaction(
          async (transaction) => {
            const qualifiedKey = this.qualify(key)
            const current = await transaction.rateLimitCounter.findUnique({
              where: { key: qualifiedKey },
            })
            const resetTime = new Date(now.getTime() + this.windowMs)

            if (!current || current.resetAt <= now) {
              const counter = await transaction.rateLimitCounter.upsert({
                where: { key: qualifiedKey },
                create: { key: qualifiedKey, hits: 1, resetAt: resetTime },
                update: { hits: 1, resetAt: resetTime },
              })
              return { totalHits: counter.hits, resetTime: counter.resetAt }
            }

            const counter = await transaction.rateLimitCounter.update({
              where: { key: qualifiedKey },
              data: { hits: { increment: 1 } },
            })
            return { totalHits: counter.hits, resetTime: counter.resetAt }
          },
          { isolationLevel: 'Serializable' },
        )
      } catch (error) {
        if (attempt < 2 && isRetryableTransactionError(error)) continue
        throw error
      }
    }

    throw new Error('Não foi possível atualizar o rate limit.')
  }

  async decrement(key: string) {
    await this.client.rateLimitCounter.updateMany({
      where: {
        key: this.qualify(key),
        hits: { gt: 0 },
        resetAt: { gt: new Date() },
      },
      data: { hits: { decrement: 1 } },
    })
  }

  async resetKey(key: string) {
    await this.client.rateLimitCounter.deleteMany({
      where: { key: this.qualify(key) },
    })
  }
}
