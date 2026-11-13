import type {
  AuthRepository,
  StoredUser,
} from '../features/auth/auth-service.js'

export function createMemoryAuthRepository(): AuthRepository {
  const users = new Map<string, StoredUser>()
  const sessions = new Map<string, string>()

  return {
    async countUsers() {
      return users.size
    },
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
