import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import type { AuthRepository, StoredUser } from './auth-service.js'

let prisma: PrismaClient | undefined

function getPrismaClient() {
  if (prisma) return prisma

  const connectionString =
    process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL_POOLED ou DATABASE_URL não foi configurada.')
  }

  prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  })
  return prisma
}

function toStoredUser(user: {
  id: string
  name: string
  email: string
  passwordHash: string
  role: 'ADMIN' | 'EDITOR' | 'REVIEWER'
  status: 'ACTIVE' | 'DISABLED'
}): StoredUser {
  return user
}

export function createPrismaAuthRepository(): AuthRepository {
  const client = getPrismaClient()

  return {
    async countUsers() {
      return client.user.count()
    },

    async findUserByEmail(email) {
      const user = await client.user.findUnique({ where: { email } })
      return user ? toStoredUser(user) : null
    },

    async listUsers() {
      const users = await client.user.findMany({ orderBy: { name: 'asc' } })
      return users.map(toStoredUser)
    },

    async findActiveSession(tokenHash) {
      const session = await client.session.findFirst({
        where: {
          tokenHash,
          revokedAt: null,
          expiresAt: { gt: new Date() },
          user: { status: 'ACTIVE' },
        },
        include: { user: true },
      })
      if (!session) return null

      return {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }
    },

    async createSession(input) {
      await client.session.create({ data: input })
    },

    async createUser(input) {
      const user = await client.user.create({ data: input })
      return toStoredUser(user)
    },

    async revokeSession(tokenHash) {
      await client.session.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      })
    },

    async updateLastLoginAt(userId) {
      await client.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() },
      })
    },
  }
}
