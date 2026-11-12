import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import type {
  AdminFinancialDocumentRecord,
  PublicFinancialPage,
} from '@oab-transparencia/contracts/transparency'
import type { FinancialDocumentRepository } from './financial-document-service.js'

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
  period: string
  exercise: number
  documentTitle: string
  documentUrl: string | null
  pdfUrl: string | null
  csvUrl: string | null
  status: 'DRAFT' | 'PUBLISHED'
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
}): AdminFinancialDocumentRecord {
  return {
    id: record.id,
    informationType:
      record.informationType as AdminFinancialDocumentRecord['informationType'],
    period: record.period as AdminFinancialDocumentRecord['period'],
    exercise: record.exercise,
    documents: [
      ...(record.pdfUrl
        ? [
            {
              id: `${record.id}-pdf`,
              title: 'Baixar PDF',
              format: 'pdf' as const,
              url: record.pdfUrl,
              category: 'financial' as const,
              exercise: record.exercise,
              period: record.period,
            },
          ]
        : []),
      ...(record.csvUrl
        ? [
            {
              id: `${record.id}-csv`,
              title: 'Baixar CSV',
              format: 'csv' as const,
              url: record.csvUrl,
              category: 'financial' as const,
              exercise: record.exercise,
              period: record.period,
            },
          ]
        : []),
      ...(!record.pdfUrl && !record.csvUrl && record.documentUrl
        ? [
            {
              id: `${record.id}-document`,
              title: 'Baixar arquivo',
              format: 'pdf' as const,
              url: record.documentUrl,
              category: 'financial' as const,
              exercise: record.exercise,
              period: record.period,
            },
          ]
        : []),
    ],
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    publishedAt: record.publishedAt?.toISOString() ?? null,
  }
}

export function createPrismaFinancialDocumentRepository(): FinancialDocumentRepository {
  const client = getPrismaClient()
  const sectionTitles = {
    'trial-balances': 'Balancetes',
    'financial-statements': 'Demonstrativos Financeiros',
    revenues: 'Quadro Sintético de Receitas',
    expenses: 'Quadro Sintético de Despesas',
  } as const
  const itemTitles = {
    'trial-balances': 'Balancete',
    'financial-statements': 'Demonstrativo financeiro',
    revenues: 'Receitas',
    expenses: 'Despesas',
  } as const
  return {
    async list() {
      return (
        await client.financialDocument.findMany({
          orderBy: [{ exercise: 'desc' }, { informationType: 'asc' }],
        })
      ).map(toContract)
    },
    async findByTypeAndExercise(informationType, period, exercise) {
      const record = await client.financialDocument.findUnique({
        where: {
          informationType_period_exercise: {
            informationType,
            period,
            exercise,
          },
        },
      })
      return record ? toContract(record) : null
    },
    async listPublished(): Promise<PublicFinancialPage> {
      const records = await client.financialDocument.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [
          { exercise: 'desc' },
          { informationType: 'asc' },
          { period: 'asc' },
        ],
      })
      const exercises = [...new Set(records.map((record) => record.exercise))]
      const periods = exercises.map((exercise) => {
        const exerciseRecords = records.filter(
          (record) => record.exercise === exercise,
        )
        const sections = (
          Object.keys(sectionTitles) as Array<keyof typeof sectionTitles>
        )
          .map((informationType) => ({
            id: informationType,
            title: sectionTitles[informationType],
            items: exerciseRecords
              .filter((record) => record.informationType === informationType)
              .map((record) => ({
                id: record.id,
                title: `${itemTitles[informationType]} - ${record.period}`,
                period: record.period,
                documents: toContract(record).documents,
              })),
          }))
          .filter((section) => section.items.length > 0)
        return { exercise, sections }
      })
      return { availableExercises: exercises, periods }
    },
    async create(input) {
      const { userId, ...data } = input
      const record = await client.financialDocument.create({
        data: {
          ...data,
          documentTitle: `${data.informationType} — ${data.period}`,
          documentUrl: data.pdfUrl || data.csvUrl || null,
          createdById: userId,
          updatedById: userId,
        },
      })
      return toContract(record)
    },
    async update(id, input) {
      const { userId, ...data } = input
      const record = await client.financialDocument
        .update({
          where: { id },
          data: {
            ...data,
            ...(data.pdfUrl !== undefined || data.csvUrl !== undefined
              ? {
                  documentUrl: data.pdfUrl || data.csvUrl || null,
                }
              : {}),
            updatedById: userId,
            ...(data.status === 'DRAFT' ? { publishedAt: null } : {}),
          },
        })
        .catch(() => null)
      return record ? toContract(record) : null
    },
    async publishExercise(exercise, userId) {
      await client.financialDocument.updateMany({
        where: { exercise },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          updatedById: userId,
        },
      })
      return (
        await client.financialDocument.findMany({
          where: { exercise },
          orderBy: { informationType: 'asc' },
        })
      ).map(toContract)
    },
  }
}
