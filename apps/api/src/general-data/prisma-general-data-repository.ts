import type { GeneralData } from '@oab-transparencia/contracts/transparency'
import type { GeneralData as PrismaGeneralData } from '../generated/prisma/client.js'
import {
  getPrismaClient,
  resultOrNullOnPrismaError,
  type DatabaseClient,
} from '../infrastructure/database/prisma.js'
import type { GeneralDataRepository } from './general-data-service.js'

function toContract(record: PrismaGeneralData): GeneralData {
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

export function createPrismaGeneralDataRepository(
  client: DatabaseClient = getPrismaClient(),
): GeneralDataRepository {
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
      const record = await resultOrNullOnPrismaError(
        () =>
          client.generalData.create({
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
          }),
        ['P2002'],
      )
      return record ? toContract(record) : null
    },
    async update(id, input) {
      const { userId, status, ...data } = input
      const record = await resultOrNullOnPrismaError(
        () =>
          client.generalData.update({
            where: { id },
            data: {
              ...data,
              ...(status ? { status } : {}),
              updatedById: userId,
              ...(status === 'DRAFT' ? { publishedAt: null } : {}),
            },
          }),
        ['P2025', 'P2002'],
      )
      return record ? toContract(record) : null
    },
    async publish(id, userId) {
      const record = await resultOrNullOnPrismaError(() =>
        client.generalData.update({
          where: { id },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
            updatedById: userId,
          },
        }),
      )
      return record ? toContract(record) : null
    },
  }
}
