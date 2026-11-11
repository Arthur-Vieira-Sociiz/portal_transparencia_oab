import './environment.js'

if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL não foi encontrada. Crie apps/api/.env a partir de apps/api/.env.example antes de aplicar migrations.',
  )
  process.exit(1)
}
