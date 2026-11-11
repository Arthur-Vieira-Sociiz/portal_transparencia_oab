import { config } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'prisma/config'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(currentDirectory, '.env') })

export default defineConfig({
  migrations: {
    path: 'prisma/migrations',
  },
  schema: 'prisma/schema.prisma',
  datasource: {
    // A URL direta é necessária para migrations no Neon. O fallback só permite
    // gerar o cliente em CI antes que uma variável de ambiente seja definida.
    url:
      process.env.DIRECT_DATABASE_URL ??
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/postgres',
  },
})
