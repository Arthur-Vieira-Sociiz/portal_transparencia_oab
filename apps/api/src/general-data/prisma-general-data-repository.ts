import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import type { GeneralData } from '@oab-transparencia/contracts/transparency'
import type { GeneralDataRepository } from './general-data-service.js'

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
  exercise: number
  totalExpenses: unknown
  totalRevenue: unknown
  budget: unknown
  patrimony: unknown
  activeLawyers: number
  activeSocieties: number
  supportRooms: number
  registeredMembers: number
  status: 'DRAFT' | 'PUBLISHED'
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
}): GeneralData {
  return {
    id: record.id,
    exercise: record.exercise,
    totalExpenses: Number(record.totalExpenses),
    totalRevenue: Number(record.totalRevenue),
    budget: Number(record.budget),
    patrimony: Number(record.patrimony),
    activeLawyers: record.activeLawyers,
    activeSocieties: record.activeSocieties,
    supportRooms: record.supportRooms,
    registeredMembers: record.registeredMembers,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    publishedAt: record.publishedAt?.toISOString() ?? null,
  }
}

export function createPrismaGeneralDataRepository(): GeneralDataRepository {
  const client = getPrismaClient()
  return {
    async list() {
      const records = await client.generalData.findMany({
        orderBy: { exercise: 'desc' },
      })
      return records.map(toContract)
    },
    async findByExercise(exercise) {
      const record = await client.generalData.findUnique({
        where: { exercise },
      })
      return record ? toContract(record) : null
    },
    async findPublishedByExercise(exercise) {
      const record = await client.generalData.findFirst({
        where: { status: 'PUBLISHED', ...(exercise ? { exercise } : {}) },
        orderBy: { exercise: 'desc' },
      })
      return record ? toContract(record) : null
    },
    async create(input) {
      const record = await client.generalData.create({
        data: {
          exercise: input.exercise,
          totalExpenses: input.totalExpenses,
          totalRevenue: input.totalRevenue,
          budget: input.budget,
          patrimony: input.patrimony,
          activeLawyers: input.activeLawyers,
          activeSocieties: input.activeSocieties,
          supportRooms: input.supportRooms,
          registeredMembers: input.registeredMembers,
          createdById: input.userId,
          updatedById: input.userId,
        },
      })
      return toContract(record)
    },
    async update(id, input) {
      const { userId, status, ...data } = input
      const record = await client.generalData
        .update({
          where: { id },
          data: {
            ...data,
            ...(status ? { status } : {}),
            updatedById: userId,
            ...(status === 'DRAFT' ? { publishedAt: null } : {}),
          },
        })
        .catch(() => null)
      return record ? toContract(record) : null
    },
    async publish(id, userId) {
      const record = await client.generalData
        .update({
          where: { id },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
            updatedById: userId,
          },
        })
        .catch(() => null)
      return record ? toContract(record) : null
    },
  }
}
