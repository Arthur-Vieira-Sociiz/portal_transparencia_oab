import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import type {
  AdminHumanResourcesRecord,
  PublicHumanResourcesPage,
} from '@oab-transparencia/contracts/transparency'
import type { HumanResourcesRepository } from './human-resources-service.js'

let prisma: PrismaClient | undefined
function getPrismaClient() {
  if (prisma) return prisma
  const connectionString =
    process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL não configurada.')
  prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
  return prisma
}

type MonthInput = { month: string; pdfUrl: string; xlsxUrl: string }

function toPublic(record: any): AdminHumanResourcesRecord {
  const months = (
    Array.isArray(record.months) ? record.months : []
  ) as MonthInput[]
  return {
    id: record.id,
    exercise: record.exercise,
    locality: record.locality,
    months: months.map((month) => ({
      month:
        month.month as AdminHumanResourcesRecord['months'][number]['month'],
      documents: [
        ...(month.pdfUrl
          ? [
              {
                id: `${record.id}-${month.month}-pdf`,
                title: 'Baixar PDF',
                format: 'pdf' as const,
                url: month.pdfUrl,
                category: 'human-resources' as const,
                exercise: record.exercise,
              },
            ]
          : []),
        ...(month.xlsxUrl
          ? [
              {
                id: `${record.id}-${month.month}-xlsx`,
                title: 'Baixar XLSX',
                format: 'xlsx' as const,
                url: month.xlsxUrl,
                category: 'human-resources' as const,
                exercise: record.exercise,
              },
            ]
          : []),
      ],
    })),
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    publishedAt: record.publishedAt?.toISOString() ?? null,
  }
}

export function createPrismaHumanResourcesRepository(): HumanResourcesRepository {
  const client = getPrismaClient()
  return {
    async list() {
      return (
        await client.humanResourcesRecord.findMany({
          orderBy: [{ exercise: 'desc' }, { locality: 'asc' }],
        })
      ).map(toPublic)
    },
    async findByExerciseAndLocality(exercise, locality) {
      const record = await client.humanResourcesRecord.findUnique({
        where: { exercise_locality: { exercise, locality } },
      })
      return record ? toPublic(record) : null
    },
    async create(input) {
      const { userId, ...data } = input
      return toPublic(
        await client.humanResourcesRecord.create({
          data: { ...data, createdById: userId, updatedById: userId },
        }),
      )
    },
    async update(id, input) {
      const { userId, ...data } = input
      const record = await client.humanResourcesRecord
        .update({
          where: { id },
          data: {
            ...data,
            updatedById: userId,
            ...(data.status === 'DRAFT' ? { publishedAt: null } : {}),
          },
        })
        .catch(() => null)
      return record ? toPublic(record) : null
    },
    async delete(id) {
      const record = await client.humanResourcesRecord
        .delete({ where: { id } })
        .catch(() => null)
      return Boolean(record)
    },
    async publishExercise(exercise, userId) {
      await client.humanResourcesRecord.updateMany({
        where: { exercise },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          updatedById: userId,
        },
      })
      return (
        await client.humanResourcesRecord.findMany({
          where: { exercise },
          orderBy: { locality: 'asc' },
        })
      ).map(toPublic)
    },
    async listPublished(): Promise<PublicHumanResourcesPage> {
      const records = await client.humanResourcesRecord.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [{ exercise: 'desc' }, { locality: 'asc' }],
      })
      return {
        availableExercises: [
          ...new Set(records.map((record) => record.exercise)),
        ],
        records: records.map(toPublic),
      }
    },
  }
}
