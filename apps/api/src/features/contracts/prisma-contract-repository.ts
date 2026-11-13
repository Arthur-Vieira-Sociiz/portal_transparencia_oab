import type {
  AdminContractRecord,
  CreateSupplierRequest,
  PublicContractsPage,
  Supplier,
  UpdateSupplierRequest,
} from '@oab-transparencia/contracts/transparency'
import type { ContractRecord } from '../../generated/prisma/client.js'
import {
  getPrismaClient,
  resultOrNullOnPrismaError,
  type DatabaseClient,
} from '../../infrastructure/database/prisma.js'
import type { ContractRepository } from './contract-service.js'

function toContract(record: ContractRecord): AdminContractRecord {
  if (
    !Array.isArray(record.amendmentUrls) ||
    !record.amendmentUrls.every(
      (amendment): amendment is string => typeof amendment === 'string',
    )
  ) {
    throw new Error(`Aditivos inválidos no contrato ${record.id}.`)
  }
  const amendments = record.amendmentUrls
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
export function createPrismaContractRepository(
  client: DatabaseClient = getPrismaClient(),
): ContractRepository {
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
      const record = await resultOrNullOnPrismaError(
        () =>
          client.$transaction(async (transaction) => {
            await transaction.supplier.upsert({
              where: { cnpj: data.cnpj },
              update: { name: data.supplierName },
              create: { name: data.supplierName, cnpj: data.cnpj },
            })
            return transaction.contractRecord.create({
              data: {
                ...data,
                amendmentUrls,
                contractDocumentUrl: data.contractDocumentUrl || null,
                createdById: userId,
                updatedById: userId,
              },
            })
          }),
        ['P2002'],
      )
      return record ? toContract(record) : null
    },
    async update(id, input) {
      const { userId, amendmentUrls, publicationStatus, ...data } = input
      const record = await resultOrNullOnPrismaError(
        () =>
          client.contractRecord.update({
            where: { id },
            data: {
              ...data,
              ...(amendmentUrls ? { amendmentUrls } : {}),
              ...(publicationStatus ? { statusState: publicationStatus } : {}),
              contractDocumentUrl: data.contractDocumentUrl || null,
              updatedById: userId,
              ...(publicationStatus === 'DRAFT' ? { publishedAt: null } : {}),
            },
          }),
        ['P2025', 'P2002'],
      )
      return record ? toContract(record) : null
    },
    async delete(id) {
      const record = await resultOrNullOnPrismaError(() =>
        client.contractRecord.delete({ where: { id } }),
      )
      return Boolean(record)
    },
    async publishExercise(exercise, userId) {
      const records = await client.$transaction(async (transaction) => {
        await transaction.contractRecord.updateMany({
          where: { exercise },
          data: {
            statusState: 'PUBLISHED',
            publishedAt: new Date(),
            updatedById: userId,
          },
        })
        return transaction.contractRecord.findMany({
          where: { exercise },
          orderBy: { supplierName: 'asc' },
        })
      })
      return records.map(toContract)
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
    async createSupplier(
      input: CreateSupplierRequest,
    ): Promise<Supplier | null> {
      const supplier = await resultOrNullOnPrismaError(
        () => client.supplier.create({ data: input }),
        ['P2002'],
      )
      return supplier
        ? {
            ...supplier,
            createdAt: supplier.createdAt.toISOString(),
            updatedAt: supplier.updatedAt.toISOString(),
          }
        : null
    },
    async updateSupplier(
      id: string,
      input: UpdateSupplierRequest,
    ): Promise<Supplier | null> {
      const supplier = await client.$transaction(async (transaction) => {
        const current = await transaction.supplier.findUnique({ where: { id } })
        if (!current) return null
        const updated = await resultOrNullOnPrismaError(
          () => transaction.supplier.update({ where: { id }, data: input }),
          ['P2025', 'P2002'],
        )
        if (!updated) return null
        await transaction.contractRecord.updateMany({
          where: { cnpj: current.cnpj },
          data: { cnpj: updated.cnpj, supplierName: updated.name },
        })
        return updated
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
      const supplier = await resultOrNullOnPrismaError(() =>
        client.supplier.delete({ where: { id } }),
      )
      return Boolean(supplier)
    },
  }
}
