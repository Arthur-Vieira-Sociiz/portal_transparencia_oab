import type { AdminBudgetRecord } from '@oab-transparencia/contracts/transparency'
import type { BudgetRecord } from '../../generated/prisma/client.js'
import {
  getPrismaClient,
  resultOrNullOnPrismaError,
  type DatabaseClient,
} from '../../infrastructure/database/prisma.js'
import type { BudgetRepository } from './budget-service.js'

function toContract(record: BudgetRecord): AdminBudgetRecord {
  const planned = Number(record.plannedAmount)
  const executed = Number(record.executedAmount)
  return {
    id: record.id,
    informationType:
      record.informationType as AdminBudgetRecord['informationType'],
    annualBudget: Number(record.annualBudget),
    plannedAmount: planned,
    executedAmount: executed,
    executionPercentage: planned
      ? Math.min(100, (executed / planned) * 100)
      : 0,
    exercise: record.exercise,
    document:
      record.documentTitle && record.documentUrl
        ? {
            id: `${record.id}-document`,
            title: record.documentTitle,
            format: 'pdf',
            url: record.documentUrl,
            category: 'budget',
            exercise: record.exercise,
          }
        : undefined,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    publishedAt: record.publishedAt?.toISOString() ?? null,
  }
}

export function createPrismaBudgetRepository(
  client: DatabaseClient = getPrismaClient(),
): BudgetRepository {
  return {
    async list() {
      return (
        await client.budgetRecord.findMany({
          orderBy: [{ exercise: 'desc' }, { informationType: 'asc' }],
        })
      ).map(toContract)
    },
    async findByTypeAndExercise(informationType, exercise) {
      const record = await client.budgetRecord.findUnique({
        where: { informationType_exercise: { informationType, exercise } },
      })
      return record ? toContract(record) : null
    },
    async listPublished(exercise, informationType) {
      const records = (
        await client.budgetRecord.findMany({
          where: {
            status: 'PUBLISHED',
            ...(exercise ? { exercise } : {}),
            ...(informationType ? { informationType } : {}),
          },
          orderBy: [{ exercise: 'desc' }, { informationType: 'asc' }],
        })
      ).map(toContract)
      return {
        availableExercises: [
          ...new Set(records.map((record) => record.exercise)),
        ],
        records,
      }
    },
    async create(input) {
      const { userId, ...data } = input
      const record = await resultOrNullOnPrismaError(
        () =>
          client.budgetRecord.create({
            data: {
              ...data,
              documentTitle: data.documentTitle || null,
              documentUrl: data.documentUrl || null,
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
      const record = await resultOrNullOnPrismaError(
        () =>
          client.budgetRecord.update({
            where: { id },
            data: {
              ...data,
              documentTitle: data.documentTitle || null,
              documentUrl: data.documentUrl || null,
              updatedById: userId,
              ...(data.status === 'DRAFT' ? { publishedAt: null } : {}),
            },
          }),
        ['P2025', 'P2002'],
      )
      return record ? toContract(record) : null
    },
    async publishExercise(exercise, userId) {
      const records = await client.$transaction(async (transaction) => {
        await transaction.budgetRecord.updateMany({
          where: { exercise },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
            updatedById: userId,
          },
        })
        return transaction.budgetRecord.findMany({
          where: { exercise },
          orderBy: { informationType: 'asc' },
        })
      })
      return records.map(toContract)
    },
  }
}
