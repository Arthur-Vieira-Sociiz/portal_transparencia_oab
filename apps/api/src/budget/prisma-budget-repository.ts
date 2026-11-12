import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import type { AdminBudgetRecord } from '@oab-transparencia/contracts/transparency'
import type { BudgetRepository } from './budget-service.js'

let prisma: PrismaClient | undefined
function getPrismaClient() {
  if (prisma) return prisma
  const connectionString =
    process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL não configurada.')
  prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
  return prisma
}

function toContract(record: {
  id: string
  informationType: string
  annualBudget: unknown
  plannedAmount: unknown
  executedAmount: unknown
  exercise: number
  documentTitle: string | null
  documentUrl: string | null
  status: 'DRAFT' | 'PUBLISHED'
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
}): AdminBudgetRecord {
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

export function createPrismaBudgetRepository(): BudgetRepository {
  const client = getPrismaClient()
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
      const record = await client.budgetRecord.create({
        data: {
          ...data,
          documentTitle: data.documentTitle || null,
          documentUrl: data.documentUrl || null,
          createdById: userId,
          updatedById: userId,
        },
      })
      return toContract(record)
    },
    async update(id, input) {
      const { userId, ...data } = input
      const record = await client.budgetRecord
        .update({
          where: { id },
          data: {
            ...data,
            documentTitle: data.documentTitle || null,
            documentUrl: data.documentUrl || null,
            updatedById: userId,
            ...(data.status === 'DRAFT' ? { publishedAt: null } : {}),
          },
        })
        .catch(() => null)
      return record ? toContract(record) : null
    },
    async publishExercise(exercise, userId) {
      await client.budgetRecord.updateMany({
        where: { exercise },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          updatedById: userId,
        },
      })
      return (
        await client.budgetRecord.findMany({
          where: { exercise },
          orderBy: { informationType: 'asc' },
        })
      ).map(toContract)
    },
  }
}
