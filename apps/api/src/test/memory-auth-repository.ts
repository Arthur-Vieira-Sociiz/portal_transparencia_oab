import type {
  AuthRepository,
  StoredUser,
} from '../features/auth/auth-service.js'
import { getPaginationMetadata } from '../http/request-schemas.js'

export function createMemoryAuthRepository(): AuthRepository {
  const users = new Map<string, StoredUser>()
  const sessions = new Map<string, string>()

  return {
    async findUserByEmail(email) {
      return users.get(email) ?? null
    },
    async listUsers(pagination) {
      const sortedUsers = [...users.values()].sort(
        (first, second) =>
          first.name.localeCompare(second.name) ||
          first.id.localeCompare(second.id),
      )
      const start = (pagination.page - 1) * pagination.limit
      return {
        items: sortedUsers
          .slice(start, start + pagination.limit)
          .map(({ id, name, email, role, status }) => ({
            id,
            name,
            email,
            role,
            status,
          })),
        pagination: getPaginationMetadata(pagination, sortedUsers.length),
      }
    },
    async findActiveSession(tokenHash) {
      const userId = sessions.get(tokenHash)
      if (!userId) return null
      return [...users.values()].find((user) => user.id === userId) ?? null
    },
    async createSession({ tokenHash, userId }) {
      sessions.set(tokenHash, userId)
    },
    async createInitialAdmin(input) {
      if (users.size > 0) return null
      const user: StoredUser = {
        id: `user-${users.size + 1}`,
        ...input,
        status: 'ACTIVE',
        blockedUntil: null,
      }
      users.set(user.email, user)
      return user
    },
    async createUser(input) {
      const user: StoredUser = {
        id: `user-${users.size + 1}`,
        ...input,
        status: 'ACTIVE',
        blockedUntil: null,
      }
      users.set(user.email, user)
      return user
    },
    async blockUserAndRevokeSessions(userId, blockedUntil) {
      const user = [...users.values()].find((item) => item.id === userId)
      if (user) user.blockedUntil = blockedUntil
      for (const [tokenHash, sessionUserId] of sessions) {
        if (sessionUserId === userId) sessions.delete(tokenHash)
      }
    },
    async deleteExpiredAndRevokedSessions() {
      return 0
    },
    async revokeSession(tokenHash) {
      sessions.delete(tokenHash)
    },
    async updateLastLoginAt() {},
  }
}
