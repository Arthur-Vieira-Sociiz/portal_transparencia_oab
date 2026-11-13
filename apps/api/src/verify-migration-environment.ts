import './environment.js'
import { readEnvironment } from './environment.js'

if (!readEnvironment().databaseUrl) {
  console.error(
    'DATABASE_URL não foi encontrada. Crie apps/api/.env a partir de apps/api/.env.example antes de aplicar migrations.',
  )
  process.exit(1)
}
