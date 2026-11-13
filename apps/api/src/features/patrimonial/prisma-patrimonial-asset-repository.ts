import type {
  AdminPatrimonialAsset,
  PublicPatrimonialPage,
} from '@oab-transparencia/contracts/transparency'
import type { PatrimonialAsset } from '../../generated/prisma/client.js'
import {
  getPrismaClient,
  resultOrNullOnPrismaError,
  type DatabaseClient,
} from '../../infrastructure/database/prisma.js'
import type { PatrimonialAssetRepository } from './patrimonial-asset-service.js'

function toContract(record: PatrimonialAsset): AdminPatrimonialAsset {
  return {
    id: record.id,
    informationType: record.informationType,
    description: record.description,
    location: record.location,
    acquisitionValue: Number(record.acquisitionValue),
    status: record.status,
    exercise: record.exercise,
    document: record.documentUrl
      ? {
          id: `${record.id}-document`,
          title: record.documentTitle || 'Visualizar documento',
          format: 'pdf',
          url: record.documentUrl,
          category: 'patrimonial',
          exercise: record.exercise,
        }
      : undefined,
    publicationStatus: record.statusState,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    publishedAt: record.publishedAt?.toISOString() ?? null,
  }
}

export function createPrismaPatrimonialAssetRepository(
  client: DatabaseClient = getPrismaClient(),
): PatrimonialAssetRepository {
  return {
    async list() {
      return (
        await client.patrimonialAsset.findMany({
          orderBy: [{ exercise: 'desc' }, { informationType: 'asc' }],
        })
      ).map(toContract)
    },
    async findDuplicate(informationType, description, exercise) {
      const record = await client.patrimonialAsset.findUnique({
        where: {
          informationType_description_exercise: {
            informationType,
            description,
            exercise,
          },
        },
      })
      return record ? toContract(record) : null
    },
    async create(input) {
      const { userId, ...data } = input
      const record = await resultOrNullOnPrismaError(
        () =>
          client.patrimonialAsset.create({
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
      const { publicationStatus, ...fields } = data
      const record = await resultOrNullOnPrismaError(
        () =>
          client.patrimonialAsset.update({
            where: { id },
            data: {
              ...fields,
              ...(publicationStatus ? { statusState: publicationStatus } : {}),
              documentTitle: fields.documentTitle || null,
              documentUrl: fields.documentUrl || null,
              updatedById: userId,
              ...(publicationStatus === 'DRAFT' ? { publishedAt: null } : {}),
            },
          }),
        ['P2025', 'P2002'],
      )
      return record ? toContract(record) : null
    },
    async publishExercise(exercise, userId) {
      const records = await client.$transaction(async (transaction) => {
        await transaction.patrimonialAsset.updateMany({
          where: { exercise },
          data: {
            statusState: 'PUBLISHED',
            publishedAt: new Date(),
            updatedById: userId,
          },
        })
        return transaction.patrimonialAsset.findMany({
          where: { exercise },
          orderBy: { informationType: 'asc' },
        })
      })
      return records.map(toContract)
    },
    async listPublished(): Promise<PublicPatrimonialPage> {
      const records = await client.patrimonialAsset.findMany({
        where: { statusState: 'PUBLISHED' },
        orderBy: [{ exercise: 'desc' }, { informationType: 'asc' }],
      })
      return {
        availableExercises: [
          ...new Set(records.map((record) => record.exercise)),
        ],
        assets: records.map((record) => toContract(record)),
      }
    },
  }
}
