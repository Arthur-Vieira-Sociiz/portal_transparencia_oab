import { createAuthService } from './auth-service.js'
import { createPrismaAuthRepository } from './prisma-auth-repository.js'

export function createPrismaAuthService() {
  const sessionTtlHours = Number(process.env.SESSION_TTL_HOURS ?? 8)
  return createAuthService(createPrismaAuthRepository(), {
    registrationKey: process.env.ADMIN_REGISTRATION_KEY,
    sessionTtlHours:
      Number.isFinite(sessionTtlHours) && sessionTtlHours > 0
        ? sessionTtlHours
        : 8,
  })
}
