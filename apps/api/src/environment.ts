import { config } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

const currentDirectory = dirname(fileURLToPath(import.meta.url))

config({ path: resolve(currentDirectory, '../.env') })

const WebOriginSchema = z
  .string()
  .trim()
  .url()
  .refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), {
    message: 'A origem deve usar HTTP ou HTTPS.',
  })
  .transform((value) => new URL(value).origin)

const DatabaseUrlSchema = z
  .string()
  .trim()
  .url()
  .refine(
    (value) => ['postgres:', 'postgresql:'].includes(new URL(value).protocol),
    { message: 'A URL do banco deve usar PostgreSQL.' },
  )

// Aceita a chave no formato de uma linha do .env, com quebras de linha escapadas.
const FirebasePrivateKeySchema = z
  .string()
  .trim()
  .min(64)
  .transform((value) => value.replaceAll('\\n', '\n'))
  .refine(
    (value) =>
      value.includes('-----BEGIN PRIVATE KEY-----') &&
      value.includes('-----END PRIVATE KEY-----'),
    { message: 'A chave privada do Firebase está em formato inválido.' },
  )

const EnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3333),
  WEB_ORIGIN: z
    .string()
    .trim()
    .default('http://localhost:5173')
    .transform((value, context) => {
      const origins = value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)

      const parsedOrigins = origins.map((origin) =>
        WebOriginSchema.safeParse(origin),
      )

      if (
        parsedOrigins.length === 0 ||
        parsedOrigins.some((result) => !result.success)
      ) {
        context.addIssue({
          code: 'custom',
          message: 'WEB_ORIGIN deve conter apenas URLs válidas.',
        })
        return z.NEVER
      }

      return parsedOrigins.flatMap((result) =>
        result.success ? [result.data] : [],
      )
    }),
  DATABASE_URL: DatabaseUrlSchema.optional(),
  DATABASE_URL_POOLED: DatabaseUrlSchema.optional(),
  DIRECT_DATABASE_URL: DatabaseUrlSchema.optional(),
  FIREBASE_PROJECT_ID: z.string().trim().min(1).optional(),
  FIREBASE_CLIENT_EMAIL: z.email().optional(),
  FIREBASE_PRIVATE_KEY: FirebasePrivateKeySchema.optional(),
  ADMIN_REGISTRATION_KEY: z.string().trim().min(16).optional(),
  SESSION_TTL_HOURS: z.coerce.number().positive().default(8),
})

// Monta a validação runtime conforme as integrações exigidas pelo ponto de entrada.
function criarSchemaRuntime(options: {
  requireDatabase: boolean
  requireFirebase: boolean
}) {
  return EnvironmentSchema.superRefine((environment, context) => {
    if (
      options.requireDatabase &&
      !(environment.DATABASE_URL_POOLED ?? environment.DATABASE_URL)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['DATABASE_URL'],
        message: 'DATABASE_URL_POOLED ou DATABASE_URL deve ser configurada.',
      })
    }

    if (
      options.requireFirebase &&
      !(
        environment.FIREBASE_PROJECT_ID &&
        environment.FIREBASE_CLIENT_EMAIL &&
        environment.FIREBASE_PRIVATE_KEY
      )
    ) {
      context.addIssue({
        code: 'custom',
        path: ['FIREBASE_PROJECT_ID'],
        message:
          'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY devem ser configuradas.',
      })
    }
  })
}

export type FirebaseCredentials = {
  projectId: string
  clientEmail: string
  privateKey: string
}

export type Environment = {
  nodeEnv: 'development' | 'test' | 'production'
  port: number
  webOrigins: readonly string[]
  databaseUrl?: string
  pooledDatabaseUrl?: string
  directDatabaseUrl?: string
  firebase?: FirebaseCredentials
  adminRegistrationKey?: string
  sessionTtlHours: number
}

function getFirebaseCredentials(
  environment: z.output<typeof EnvironmentSchema>,
): FirebaseCredentials | undefined {
  if (
    !environment.FIREBASE_PROJECT_ID ||
    !environment.FIREBASE_CLIENT_EMAIL ||
    !environment.FIREBASE_PRIVATE_KEY
  ) {
    return undefined
  }

  return {
    projectId: environment.FIREBASE_PROJECT_ID,
    clientEmail: environment.FIREBASE_CLIENT_EMAIL,
    privateKey: environment.FIREBASE_PRIVATE_KEY,
  }
}

export function readEnvironment(
  source: NodeJS.ProcessEnv = process.env,
  options: { requireDatabase?: boolean; requireFirebase?: boolean } = {},
): Environment {
  const baseEnvironment = EnvironmentSchema.parse(source)
  const requireExternalServices = baseEnvironment.NODE_ENV !== 'test'
  const requireDatabase = options.requireDatabase ?? requireExternalServices
  const requireFirebase = options.requireFirebase ?? requireExternalServices

  // Cada integração é validada conforme o ponto de entrada, sem acoplar Prisma e Firestore.
  const environment = criarSchemaRuntime({
    requireDatabase,
    requireFirebase,
  }).parse(source)

  return {
    nodeEnv: environment.NODE_ENV,
    port: environment.PORT,
    webOrigins: environment.WEB_ORIGIN,
    databaseUrl: environment.DATABASE_URL,
    pooledDatabaseUrl: environment.DATABASE_URL_POOLED,
    directDatabaseUrl: environment.DIRECT_DATABASE_URL,
    firebase: getFirebaseCredentials(environment),
    adminRegistrationKey: environment.ADMIN_REGISTRATION_KEY,
    sessionTtlHours: environment.SESSION_TTL_HOURS,
  }
}
