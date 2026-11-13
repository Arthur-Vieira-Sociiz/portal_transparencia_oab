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
  ADMIN_REGISTRATION_KEY: z.string().trim().min(16).optional(),
  SESSION_TTL_HOURS: z.coerce.number().positive().default(8),
})

const RuntimeEnvironmentSchema = EnvironmentSchema.refine(
  (environment) =>
    Boolean(environment.DATABASE_URL_POOLED ?? environment.DATABASE_URL),
  {
    path: ['DATABASE_URL'],
    message: 'DATABASE_URL_POOLED ou DATABASE_URL deve ser configurada.',
  },
)

export type Environment = {
  nodeEnv: 'development' | 'test' | 'production'
  port: number
  webOrigins: readonly string[]
  databaseUrl?: string
  pooledDatabaseUrl?: string
  directDatabaseUrl?: string
  adminRegistrationKey?: string
  sessionTtlHours: number
}

export function readEnvironment(
  source: NodeJS.ProcessEnv = process.env,
  options: { requireDatabase?: boolean } = {},
): Environment {
  const baseEnvironment = EnvironmentSchema.parse(source)
  const requireDatabase =
    options.requireDatabase ?? baseEnvironment.NODE_ENV !== 'test'
  const environment = requireDatabase
    ? RuntimeEnvironmentSchema.parse(source)
    : baseEnvironment

  return {
    nodeEnv: environment.NODE_ENV,
    port: environment.PORT,
    webOrigins: environment.WEB_ORIGIN,
    databaseUrl: environment.DATABASE_URL,
    pooledDatabaseUrl: environment.DATABASE_URL_POOLED,
    directDatabaseUrl: environment.DIRECT_DATABASE_URL,
    adminRegistrationKey: environment.ADMIN_REGISTRATION_KEY,
    sessionTtlHours: environment.SESSION_TTL_HOURS,
  }
}
