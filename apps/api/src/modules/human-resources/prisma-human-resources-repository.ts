import {
  CreateHumanResourcesRequestSchema,
  type AdminHumanResourcesRecord,
  type PublicHumanResourcesPage,
} from '@oab-transparencia/contracts/transparency'
import type { HumanResourcesRecord } from '../../generated/prisma/client.js'
import {
  getPrismaClient,
  resultOrNullOnPrismaError,
  type DatabaseClient,
} from '../../infrastructure/database/prisma.js'
import {
  getPaginationArguments,
  getPaginationMetadata,
} from '../../http/request-schemas.js'
import type { HumanResourcesRepository } from './human-resources-service.js'

function parseMonths(record: HumanResourcesRecord) {
  const result = CreateHumanResourcesRequestSchema.safeParse({
    exercise: record.exercise,
    locality: record.locality,
    months: record.months,
  })
  if (!result.success) {
    throw new Error(`Meses inválidos no registro de RH ${record.id}.`, {
      cause: result.error,
    })
  }
  return result.data.months
}

function toPublic(record: HumanResourcesRecord): AdminHumanResourcesRecord {
  const months = parseMonths(record)
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

export function createPrismaHumanResourcesRepository(
  client: DatabaseClient = getPrismaClient(),
): HumanResourcesRepository {
  return {
    async list(pagination) {
      const [records, total] = await client.$transaction([
        client.humanResourcesRecord.findMany({
          ...getPaginationArguments(pagination),
          orderBy: [{ exercise: 'desc' }, { locality: 'asc' }, { id: 'asc' }],
        }),
        client.humanResourcesRecord.count(),
      ])
      return {
        items: records.map(toPublic),
        pagination: getPaginationMetadata(pagination, total),
      }
    },
    async findByExerciseAndLocality(exercise, locality) {
      const record = await client.humanResourcesRecord.findUnique({
        where: { exercise_locality: { exercise, locality } },
      })
      return record ? toPublic(record) : null
    },
    async create(input) {
      const { userId, ...data } = input
      const record = await resultOrNullOnPrismaError(
        () =>
          client.humanResourcesRecord.create({
            data: { ...data, createdById: userId, updatedById: userId },
          }),
        ['P2002'],
      )
      return record ? toPublic(record) : null
    },
    async update(id, input) {
      const { userId, ...data } = input
      const record = await resultOrNullOnPrismaError(
        () =>
          client.humanResourcesRecord.update({
            where: { id },
            data: {
              ...data,
              updatedById: userId,
              ...(data.status === 'DRAFT' ? { publishedAt: null } : {}),
            },
          }),
        ['P2025', 'P2002'],
      )
      return record ? toPublic(record) : null
    },
    async delete(id) {
      const record = await resultOrNullOnPrismaError(() =>
        client.humanResourcesRecord.delete({ where: { id } }),
      )
      return Boolean(record)
    },
    async publishExercise(exercise, userId) {
      const records = await client.$transaction(async (transaction) => {
        await transaction.humanResourcesRecord.updateMany({
          where: { exercise },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
            updatedById: userId,
          },
        })
        return transaction.humanResourcesRecord.findMany({
          where: { exercise },
          orderBy: { locality: 'asc' },
        })
      })
      return records.map(toPublic)
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
