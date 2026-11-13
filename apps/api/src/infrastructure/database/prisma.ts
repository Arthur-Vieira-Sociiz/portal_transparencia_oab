import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client.js'

let prismaClient: PrismaClient | undefined

export function getPrismaClient(): PrismaClient {
  if (prismaClient) return prismaClient

  const connectionString =
    process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL_POOLED ou DATABASE_URL não foi configurada.')
  }

  prismaClient = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  })
  return prismaClient
}

type HandledPrismaErrorCode = 'P2002' | 'P2025'

function isPrismaErrorWithCode(
  error: unknown,
  expectedCode: HandledPrismaErrorCode,
): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === expectedCode
  )
}

export async function resultOrNullOnPrismaError<T>(
  operation: () => Promise<T>,
  handledCodes: readonly HandledPrismaErrorCode[] = ['P2025'],
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    if (handledCodes.some((code) => isPrismaErrorWithCode(error, code))) {
      return null
    }
    throw error
  }
}

export type DatabaseClient = PrismaClient
