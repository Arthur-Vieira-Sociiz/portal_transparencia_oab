import type {
  AuthRepository,
  StoredUser,
} from '../features/auth/auth-service.js'

export function createMemoryAuthRepository(): AuthRepository {
  const users = new Map<string, StoredUser>()
  const sessions = new Map<string, string>()

  return {
    async findUserByEmail(email) {
      return users.get(email) ?? null
    },
    async listUsers() {
      return [...users.values()]
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
