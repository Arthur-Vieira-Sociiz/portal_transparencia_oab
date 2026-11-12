import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import type { ReportsIndicator } from '@oab-transparencia/contracts/transparency'
import type { ReportsIndicatorsRepository } from './reports-indicators-service.js'

let prisma: PrismaClient | undefined
function getPrismaClient() {
  if (prisma) return prisma
  const connectionString =
    process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL não configurada.')
  prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
  return prisma
}

function toContract(record: any): ReportsIndicator {
  return {
    id: record.id,
    exercise: record.exercise,
    totalRevenue: Number(record.totalRevenue),
    totalExpense: Number(record.totalExpense),
    exerciseResult: Number(record.exerciseResult),
    plannedBudget: Number(record.plannedBudget),
    executedBudget: Number(record.executedBudget),
    executionPercentage: Number(record.executionPercentage),
    activeLawyers: record.activeLawyers,
    interns: record.interns,
    registeredSocieties: record.registeredSocieties,
    appointments: record.appointments,
    protocols: record.protocols,
    certificates: record.certificates,
    ombudsmanRequests: record.ombudsmanRequests,
    activeContracts: record.activeContracts,
    totalContractValue: Number(record.totalContractValue),
    newBids: record.newBids,
    closedContracts: record.closedContracts,
    employees: record.employees,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    publishedAt: record.publishedAt?.toISOString() ?? null,
  }
}

function derivedValues(input: {
  totalRevenue: number | string
  totalExpense: number | string
  plannedBudget: number | string
  executedBudget: number | string
}) {
  const plannedBudget = Number(input.plannedBudget)
  const executedBudget = Number(input.executedBudget)
  return {
    exerciseResult: Number(input.totalRevenue) - Number(input.totalExpense),
    executionPercentage:
      plannedBudget > 0
        ? Math.min(100, Math.max(0, (executedBudget / plannedBudget) * 100))
        : 0,
  }
}

export function createPrismaReportsIndicatorsRepository(): ReportsIndicatorsRepository {
  const client = getPrismaClient()
  return {
    async list() {
      return (
        await client.reportsIndicator.findMany({
          orderBy: { exercise: 'desc' },
        })
      ).map(toContract)
    },
    async listPublished() {
      const indicators = (
        await client.reportsIndicator.findMany({
          where: { status: 'PUBLISHED' },
          orderBy: { exercise: 'asc' },
        })
      ).map(toContract)
      return {
        availableExercises: indicators.map((item) => item.exercise),
        indicators,
      }
    },
    async findByExercise(exercise) {
      const record = await client.reportsIndicator.findUnique({
        where: { exercise },
      })
      return record ? toContract(record) : null
    },
    async create(input) {
      const { userId, ...data } = input
      return toContract(
        await client.reportsIndicator.create({
          data: {
            ...data,
            ...derivedValues(data),
            createdById: userId,
            updatedById: userId,
          },
        }),
      )
    },
    async update(id, input) {
      const { userId, ...data } = input
      const existing = await client.reportsIndicator.findUnique({
        where: { id },
      })
      if (!existing) return null
      const record = await client.reportsIndicator
        .update({
          where: { id },
          data: {
            ...data,
            ...derivedValues({
              totalRevenue:
                data.totalRevenue ?? existing.totalRevenue.toString(),
              totalExpense:
                data.totalExpense ?? existing.totalExpense.toString(),
              plannedBudget:
                data.plannedBudget ?? existing.plannedBudget.toString(),
              executedBudget:
                data.executedBudget ?? existing.executedBudget.toString(),
            }),
            updatedById: userId,
            ...(data.status === 'DRAFT' ? { publishedAt: null } : {}),
          },
        })
        .catch(() => null)
      return record ? toContract(record) : null
    },
    async delete(id) {
      const record = await client.reportsIndicator
        .delete({ where: { id } })
        .catch(() => null)
      return Boolean(record)
    },
    async publish(exercise, userId) {
      await client.reportsIndicator.updateMany({
        where: { exercise },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          updatedById: userId,
        },
      })
      return (
        await client.reportsIndicator.findMany({ where: { exercise } })
      ).map(toContract)
    },
  }
}
