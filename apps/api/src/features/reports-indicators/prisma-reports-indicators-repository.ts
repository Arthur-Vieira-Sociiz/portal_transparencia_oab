import type { ReportsIndicator } from '@oab-transparencia/contracts/transparency'
import type { ReportsIndicator as PrismaReportsIndicator } from '../../generated/prisma/client.js'
import {
  getPrismaClient,
  resultOrNullOnPrismaError,
  type DatabaseClient,
} from '../../infrastructure/database/prisma.js'
import type { ReportsIndicatorsRepository } from './reports-indicators-service.js'

function toContract(record: PrismaReportsIndicator): ReportsIndicator {
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

export function createPrismaReportsIndicatorsRepository(
  client: DatabaseClient = getPrismaClient(),
): ReportsIndicatorsRepository {
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
      const record = await resultOrNullOnPrismaError(
        () =>
          client.reportsIndicator.create({
            data: {
              ...data,
              ...derivedValues(data),
              createdById: userId,
              updatedById: userId,
            },
          }),
        ['P2002'],
      )
      return record ? toContract(record) : null
    },
    async update(id, input) {
      const { userId, ...data } = input
      const record = await client.$transaction(async (transaction) => {
        const existing = await transaction.reportsIndicator.findUnique({
          where: { id },
        })
        if (!existing) return null
        return resultOrNullOnPrismaError(
          () =>
            transaction.reportsIndicator.update({
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
            }),
          ['P2025', 'P2002'],
        )
      })
      return record ? toContract(record) : null
    },
    async delete(id) {
      const record = await resultOrNullOnPrismaError(() =>
        client.reportsIndicator.delete({ where: { id } }),
      )
      return Boolean(record)
    },
    async publish(exercise, userId) {
      const records = await client.$transaction(async (transaction) => {
        await transaction.reportsIndicator.updateMany({
          where: { exercise },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
            updatedById: userId,
          },
        })
        return transaction.reportsIndicator.findMany({ where: { exercise } })
      })
      return records.map(toContract)
    },
  }
}
