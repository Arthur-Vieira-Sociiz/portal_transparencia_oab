import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import type {
  AuthenticatedUser,
  AuthSession,
  AdminCreateUserRequest,
  AdminUser,
  LoginRequest,
  RegisterRequest,
} from '@oab-transparencia/contracts/auth'
import { hashPassword, verifyPassword } from './password.js'

export type StoredUser = AuthenticatedUser & {
  passwordHash: string
  status: 'ACTIVE' | 'DISABLED'
}

export type AuthRepository = {
  countUsers(): Promise<number>
  findUserByEmail(email: string): Promise<StoredUser | null>
  findActiveSession(tokenHash: string): Promise<AuthenticatedUser | null>
  createSession(input: {
    tokenHash: string
    userId: string
    expiresAt: Date
  }): Promise<void>
  createUser(input: {
    name: string
    email: string
    passwordHash: string
    role: 'ADMIN' | 'EDITOR' | 'REVIEWER'
  }): Promise<StoredUser>
  listUsers(): Promise<StoredUser[]>
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
      | 'UNAUTHENTICATED'
      | 'FORBIDDEN',
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
    async listUsers(): Promise<AdminUser[]> {
      const users = await repository.listUsers()
      return users.map((user) => ({
        ...toAuthenticatedUser(user),
        status: user.status,
      }))
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
      if (await repository.findUserByEmail(input.email)) {
        throw new AuthenticationError('EMAIL_ALREADY_IN_USE')
      }

      const isFirstUser = (await repository.countUsers()) === 0
      const user = await repository.createUser({
        name: input.name,
        email: input.email,
        passwordHash: await hashPassword(input.password),
        role: isFirstUser ? 'ADMIN' : 'EDITOR',
      })

      return createSession(toAuthenticatedUser(user))
    },

    async login(input: LoginRequest) {
      const user = await repository.findUserByEmail(input.email)
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
  }
}

export type AuthService = ReturnType<typeof createAuthService>
