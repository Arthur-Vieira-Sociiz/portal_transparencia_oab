import type { AuthRepository, StoredUser } from './auth-service.js'
import type { User } from '../../generated/prisma/client.js'
import {
  getPrismaClient,
  type DatabaseClient,
} from '../../infrastructure/database/prisma.js'

function toStoredUser(user: User): StoredUser {
  return user
}

function isTransactionConflict(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error.code === 'P2002' || error.code === 'P2034')
  )
}

export function createPrismaAuthRepository(
  client: DatabaseClient = getPrismaClient(),
): AuthRepository {
  return {
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
          user: {
            status: 'ACTIVE',
            OR: [{ blockedUntil: null }, { blockedUntil: { lte: new Date() } }],
          },
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

    async createInitialAdmin(input) {
      try {
        return await client.$transaction(
          async (transaction) => {
            if ((await transaction.user.count()) > 0) return null
            return toStoredUser(await transaction.user.create({ data: input }))
          },
          { isolationLevel: 'Serializable' },
        )
      } catch (error) {
        if (isTransactionConflict(error)) return null
        throw error
      }
    },

    async createUser(input) {
      const user = await client.user.create({ data: input })
      return toStoredUser(user)
    },

    async blockUserAndRevokeSessions(userId, blockedUntil) {
      await client.$transaction([
        client.user.update({
          where: { id: userId },
          data: { blockedUntil },
        }),
        client.session.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date() },
        }),
      ])
    },

    async deleteExpiredAndRevokedSessions(now) {
      const result = await client.session.deleteMany({
        where: {
          OR: [{ expiresAt: { lte: now } }, { revokedAt: { not: null } }],
        },
      })
      return result.count
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
