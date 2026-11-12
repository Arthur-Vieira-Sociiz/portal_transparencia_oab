import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import type {
  AdminPatrimonialAsset,
  PublicPatrimonialPage,
} from '@oab-transparencia/contracts/transparency'
import type { PatrimonialAssetRepository } from './patrimonial-asset-service.js'

let prisma: PrismaClient | undefined
function getPrismaClient() {
  if (prisma) return prisma
  const connectionString =
    process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL não configurada.')
  prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
  return prisma
}

function toContract(record: any): AdminPatrimonialAsset {
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

export function createPrismaPatrimonialAssetRepository(): PatrimonialAssetRepository {
  const client = getPrismaClient()
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
      return toContract(
        await client.patrimonialAsset.create({
          data: {
            ...data,
            documentTitle: data.documentTitle || null,
            documentUrl: data.documentUrl || null,
            createdById: userId,
            updatedById: userId,
          },
        }),
      )
    },
    async update(id, input) {
      const { userId, ...data } = input
      const { publicationStatus, ...fields } = data
      const record = await client.patrimonialAsset
        .update({
          where: { id },
          data: {
            ...fields,
            ...(publicationStatus ? { statusState: publicationStatus } : {}),
            documentTitle: fields.documentTitle || null,
            documentUrl: fields.documentUrl || null,
            updatedById: userId,
            ...(publicationStatus === 'DRAFT' ? { publishedAt: null } : {}),
          },
        })
        .catch(() => null)
      return record ? toContract(record) : null
    },
    async publishExercise(exercise, userId) {
      await client.patrimonialAsset.updateMany({
        where: { exercise },
        data: {
          statusState: 'PUBLISHED',
          publishedAt: new Date(),
          updatedById: userId,
        },
      })
      return (
        await client.patrimonialAsset.findMany({
          where: { exercise },
          orderBy: { informationType: 'asc' },
        })
      ).map(toContract)
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
