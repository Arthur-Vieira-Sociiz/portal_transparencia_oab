import { defineConfig } from 'prisma/config'
import { readEnvironment } from './src/environment.js'

const environment = readEnvironment(process.env, { requireDatabase: false })

export default defineConfig({
  migrations: {
    path: 'prisma/migrations',
  },
  schema: 'prisma/schema.prisma',
  datasource: {
    // A URL direta é necessária para migrations no Neon. O fallback só permite
    // gerar o cliente em CI antes que uma variável de ambiente seja definida.
    url:
      environment.directDatabaseUrl ??
      environment.databaseUrl ??
      'postgresql://postgres:postgres@localhost:5432/postgres',
  },
})
