import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import type {
  AuthenticatedUser,
  AuthSession,
  AdminCreateUserRequest,
  AdminUser,
  LoginRequest,
  RegisterRequest,
} from '@oab-transparencia/contracts/auth'
import type { PaginatedResult, Pagination } from '../../http/request-schemas.js'
import { hashPassword, verifyPassword } from './password.js'

export type StoredUser = AuthenticatedUser & {
  passwordHash: string
  status: 'ACTIVE' | 'DISABLED'
  blockedUntil: Date | null
}

export type AuthRepository = {
  findUserByEmail(email: string): Promise<StoredUser | null>
  findActiveSession(tokenHash: string): Promise<AuthenticatedUser | null>
  createSession(input: {
    tokenHash: string
    userId: string
    expiresAt: Date
  }): Promise<void>
  createInitialAdmin(input: {
    name: string
    email: string
    passwordHash: string
    role: 'ADMIN'
  }): Promise<StoredUser | null>
  createUser(input: {
    name: string
    email: string
    passwordHash: string
    role: 'ADMIN' | 'EDITOR' | 'REVIEWER'
  }): Promise<StoredUser>
  listUsers(pagination: Pagination): Promise<PaginatedResult<AdminUser>>
  blockUserAndRevokeSessions(userId: string, blockedUntil: Date): Promise<void>
  deleteExpiredAndRevokedSessions(now: Date): Promise<number>
  revokeSession(tokenHash: string): Promise<void>
  updateLastLoginAt(userId: string): Promise<void>
}

export class AuthenticationError extends Error {
  constructor(
    public readonly code:
      | 'EMAIL_ALREADY_IN_USE'
      | 'INVALID_CREDENTIALS'
      | 'INVALID_REGISTRATION_KEY'
      | 'REGISTRATION_UNAVAILABLE'
      | 'REGISTRATION_CLOSED'
      | 'RATE_LIMITED'
      | 'UNAUTHENTICATED'
      | 'FORBIDDEN',
    public readonly retryAfterSeconds?: number,
  ) {
    super(code)
  }
}

type AuthServiceOptions = {
  registrationKey?: string
  sessionTtlHours?: number
}

function toAuthenticatedUser(user: StoredUser): AuthenticatedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('base64url')
}

function hasSameSecret(value: string, expected: string) {
  const valueBuffer = Buffer.from(value)
  const expectedBuffer = Buffer.from(expected)
  return (
    valueBuffer.length === expectedBuffer.length &&
    timingSafeEqual(valueBuffer, expectedBuffer)
  )
}

export function createAuthService(
  repository: AuthRepository,
  options: AuthServiceOptions = {},
) {
  const sessionTtlHours = options.sessionTtlHours ?? 8

  async function createSession(user: AuthenticatedUser): Promise<AuthSession> {
    await repository.deleteExpiredAndRevokedSessions(new Date())
    const token = randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + sessionTtlHours * 60 * 60 * 1000)
    await repository.createSession({
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt,
    })

    return {
      token,
      expiresAt: expiresAt.toISOString(),
      user,
    }
  }

  return {
    async listUsers(
      pagination: Pagination,
    ): Promise<PaginatedResult<AdminUser>> {
      return repository.listUsers(pagination)
    },

    async createUserByAdmin(input: AdminCreateUserRequest): Promise<AdminUser> {
      if (await repository.findUserByEmail(input.email)) {
        throw new AuthenticationError('EMAIL_ALREADY_IN_USE')
      }
      const user = await repository.createUser({
        name: input.name,
        email: input.email,
        passwordHash: await hashPassword(input.password),
        role: input.role,
      })
      return { ...toAuthenticatedUser(user), status: user.status }
    },

    async register(input: RegisterRequest) {
      if (!options.registrationKey) {
        throw new AuthenticationError('REGISTRATION_UNAVAILABLE')
      }
      if (!hasSameSecret(input.registrationKey, options.registrationKey)) {
        throw new AuthenticationError('INVALID_REGISTRATION_KEY')
      }
      const user = await repository.createInitialAdmin({
        name: input.name,
        email: input.email,
        passwordHash: await hashPassword(input.password),
        role: 'ADMIN',
      })
      if (!user) throw new AuthenticationError('REGISTRATION_CLOSED')

      return createSession(toAuthenticatedUser(user))
    },

    async login(input: LoginRequest) {
      const user = await repository.findUserByEmail(input.email)
      if (user?.blockedUntil && user.blockedUntil > new Date()) {
        const retryAfterSeconds = Math.max(
          1,
          Math.ceil((user.blockedUntil.getTime() - Date.now()) / 1000),
        )
        throw new AuthenticationError('RATE_LIMITED', retryAfterSeconds)
      }
      if (
        !user ||
        user.status !== 'ACTIVE' ||
        !(await verifyPassword(input.password, user.passwordHash))
      ) {
        throw new AuthenticationError('INVALID_CREDENTIALS')
      }

      await repository.updateLastLoginAt(user.id)
      return createSession(toAuthenticatedUser(user))
    },

    async getAuthenticatedUser(token: string) {
      const user = await repository.findActiveSession(hashToken(token))
      if (!user) throw new AuthenticationError('UNAUTHENTICATED')
      return user
    },

    async logout(token: string) {
      await repository.revokeSession(hashToken(token))
    },

    async blockUserForRateLimit(userId: string, blockedUntil: Date) {
      await repository.blockUserAndRevokeSessions(userId, blockedUntil)
    },
  }
}

export type AuthService = ReturnType<typeof createAuthService>
