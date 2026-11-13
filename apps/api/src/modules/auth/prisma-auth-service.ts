import { createAuthService } from './auth-service.js'
import { createPrismaAuthRepository } from './prisma-auth-repository.js'
import { readEnvironment } from '../../environment.js'

export function createPrismaAuthService() {
  const environment = readEnvironment()
  return createAuthService(createPrismaAuthRepository(), {
    registrationKey: environment.adminRegistrationKey,
    sessionTtlHours: environment.sessionTtlHours,
  })
}
