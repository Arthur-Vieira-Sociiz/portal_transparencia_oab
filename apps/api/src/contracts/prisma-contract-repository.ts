import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import type {
  AdminContractRecord,
  CreateContractRecordRequest,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  PublicContractsPage,
  Supplier,
} from '@oab-transparencia/contracts/transparency'
import type { ContractRepository } from './contract-service.js'

let prisma: PrismaClient | undefined
function getPrismaClient() {
  if (prisma) return prisma
  const connectionString =
    process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL não configurada.')
  prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
  return prisma
}
function toContract(record: any): AdminContractRecord {
  const amendments = Array.isArray(record.amendmentUrls)
    ? record.amendmentUrls
    : []
  return {
    id: record.id,
    supplier: record.supplierName,
    cnpj: record.cnpj,
    ...(record.objectDescription
      ? { objectDescription: record.objectDescription }
      : {}),
    signedAt: record.signedAt,
    term: record.term,
    value: Number(record.value),
    exercise: record.exercise,
    contractDocument: record.contractDocumentUrl
      ? {
          id: `${record.id}-contract`,
          title: 'Contrato',
          format: 'pdf',
          url: record.contractDocumentUrl,
          category: 'contracts-and-bids',
          exercise: record.exercise,
        }
      : undefined,
    amendments: amendments.map((url: string, index: number) => ({
      id: `${record.id}-amendment-${index}`,
      title: `${index + 1}º termo aditivo`,
      format: 'pdf' as const,
      url,
      category: 'contracts-and-bids' as const,
      exercise: record.exercise,
    })),
    publicationStatus: record.statusState,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    publishedAt: record.publishedAt?.toISOString() ?? null,
  }
}
export function createPrismaContractRepository(): ContractRepository {
  const client = getPrismaClient()
  return {
    async list() {
      return (
        await client.contractRecord.findMany({
          orderBy: [{ exercise: 'desc' }, { supplierName: 'asc' }],
        })
      ).map(toContract)
    },
    async create(input) {
      const { userId, amendmentUrls, ...data } = input
      await client.supplier.upsert({
        where: { cnpj: data.cnpj },
        update: { name: data.supplierName },
        create: { name: data.supplierName, cnpj: data.cnpj },
      })
      return toContract(
        await client.contractRecord.create({
          data: {
            ...data,
            amendmentUrls,
            contractDocumentUrl: data.contractDocumentUrl || null,
            createdById: userId,
            updatedById: userId,
          },
        }),
      )
    },
    async update(id, input) {
      const { userId, amendmentUrls, publicationStatus, ...data } = input
      const record = await client.contractRecord
        .update({
          where: { id },
          data: {
            ...data,
            ...(amendmentUrls ? { amendmentUrls } : {}),
            ...(publicationStatus ? { statusState: publicationStatus } : {}),
            contractDocumentUrl: data.contractDocumentUrl || null,
            updatedById: userId,
            ...(publicationStatus === 'DRAFT' ? { publishedAt: null } : {}),
          },
        })
        .catch(() => null)
      return record ? toContract(record) : null
    },
    async delete(id) {
      const record = await client.contractRecord
        .delete({ where: { id } })
        .catch(() => null)
      return Boolean(record)
    },
    async publishExercise(exercise, userId) {
      await client.contractRecord.updateMany({
        where: { exercise },
        data: {
          statusState: 'PUBLISHED',
          publishedAt: new Date(),
          updatedById: userId,
        },
      })
      return (
        await client.contractRecord.findMany({
          where: { exercise },
          orderBy: { supplierName: 'asc' },
        })
      ).map(toContract)
    },
    async listPublished(): Promise<PublicContractsPage> {
      const records = await client.contractRecord.findMany({
        where: { statusState: 'PUBLISHED' },
        orderBy: [{ exercise: 'desc' }, { supplierName: 'asc' }],
      })
      return {
        availableExercises: [
          ...new Set(records.map((record) => record.exercise)),
        ],
        contracts: records.map(toContract),
      }
    },
    async listSuppliers(): Promise<Supplier[]> {
      const suppliers = await client.supplier.findMany({
        orderBy: { name: 'asc' },
      })
      return suppliers.map((supplier) => ({
        ...supplier,
        createdAt: supplier.createdAt.toISOString(),
        updatedAt: supplier.updatedAt.toISOString(),
      }))
    },
    async createSupplier(input: CreateSupplierRequest): Promise<Supplier> {
      const supplier = await client.supplier.create({ data: input })
      return {
        ...supplier,
        createdAt: supplier.createdAt.toISOString(),
        updatedAt: supplier.updatedAt.toISOString(),
      }
    },
    async updateSupplier(
      id: string,
      input: UpdateSupplierRequest,
    ): Promise<Supplier | null> {
      const current = await client.supplier.findUnique({ where: { id } })
      if (!current) return null
      const supplier = await client.supplier
        .update({ where: { id }, data: input })
        .catch(() => null)
      if (!supplier) return null
      await client.contractRecord.updateMany({
        where: { cnpj: current.cnpj },
        data: { cnpj: supplier.cnpj, supplierName: supplier.name },
      })
      return supplier
        ? {
            ...supplier,
            createdAt: supplier.createdAt.toISOString(),
            updatedAt: supplier.updatedAt.toISOString(),
          }
        : null
    },
    async deleteSupplier(id) {
      const supplier = await client.supplier
        .delete({ where: { id } })
        .catch(() => null)
      return Boolean(supplier)
    },
  }
}
