import type { AuthRepository, StoredUser } from './auth-service.js'
import type { User } from '../generated/prisma/client.js'
import {
  getPrismaClient,
  type DatabaseClient,
} from '../infrastructure/database/prisma.js'

function toStoredUser(user: User): StoredUser {
  return user
}

export function createPrismaAuthRepository(
  client: DatabaseClient = getPrismaClient(),
): AuthRepository {
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
