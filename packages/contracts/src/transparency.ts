import { z } from 'zod'

import {
  ExerciseSchema,
  MonthSchema,
  TransparencyDocumentSchema,
} from './common.js'

const NonNegativeIntegerSchema = z.number().int().nonnegative()
const NonNegativeAmountSchema = z.number().finite().nonnegative()

export const GeneralDataStatusSchema = z.enum(['DRAFT', 'PUBLISHED'])

export const PublicSummarySchema = z.object({
  exercise: ExerciseSchema,
  totalExpenses: NonNegativeAmountSchema,
  totalRevenue: NonNegativeAmountSchema,
  budget: NonNegativeAmountSchema,
  patrimony: NonNegativeAmountSchema,
  activeLawyers: NonNegativeIntegerSchema,
  activeSocieties: NonNegativeIntegerSchema,
  supportRooms: NonNegativeIntegerSchema,
  registeredMembers: NonNegativeIntegerSchema,
})

export const GeneralDataSchema = PublicSummarySchema.extend({
  id: z.string().min(1),
  status: GeneralDataStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  publishedAt: z.iso.datetime().nullable(),
})

export const CreateGeneralDataRequestSchema = PublicSummarySchema

export const UpdateGeneralDataRequestSchema =
  PublicSummarySchema.partial().extend({
    status: GeneralDataStatusSchema.optional(),
  })

export const InstitutionalContentSchema = z.object({
  introduction: z.array(z.string().trim().min(1)).min(1),
  regulations: z.array(z.string().trim().min(1)).min(1),
})

export const PublicInstitutionalPageSchema = z.object({
  summary: PublicSummarySchema,
  content: InstitutionalContentSchema,
})

export const GeneralIndicatorsSchema = z.object({
  exercise: ExerciseSchema,
  totalRevenue: NonNegativeAmountSchema,
  totalExpense: NonNegativeAmountSchema,
  exerciseResult: z.number().finite(),
  plannedBudget: NonNegativeAmountSchema,
  executedBudget: NonNegativeAmountSchema,
  executionPercentage: NonNegativeAmountSchema,
  activeLawyers: NonNegativeIntegerSchema,
  interns: NonNegativeIntegerSchema,
  registeredSocieties: NonNegativeIntegerSchema,
  appointments: NonNegativeIntegerSchema,
  protocols: NonNegativeIntegerSchema,
  certificates: NonNegativeIntegerSchema,
  ombudsmanRequests: NonNegativeIntegerSchema,
  activeContracts: NonNegativeIntegerSchema,
  totalContractValue: NonNegativeAmountSchema,
  newBids: NonNegativeIntegerSchema,
  closedContracts: NonNegativeIntegerSchema,
  employees: NonNegativeIntegerSchema,
})

export const MonthlyDocumentsSchema = z.object({
  month: MonthSchema,
  documents: z.array(TransparencyDocumentSchema).max(2),
})

export const HumanResourcesRecordSchema = z
  .object({
    exercise: ExerciseSchema,
    locality: z.string().trim().min(1),
    months: z.array(MonthlyDocumentsSchema).length(12),
  })
  .superRefine(({ months }, context) => {
    const uniqueMonths = new Set(months.map(({ month }) => month))

    if (uniqueMonths.size !== months.length) {
      context.addIssue({
        code: 'custom',
        message: 'Cada mês deve aparecer uma única vez.',
        path: ['months'],
      })
    }
  })

export const PublicHumanResourcesPageSchema = z.object({
  availableExercises: z.array(ExerciseSchema).min(1),
  records: z.array(HumanResourcesRecordSchema),
})

export const PatrimonialAssetSchema = z.object({
  id: z.string().min(1),
  informationType: z.string().trim().min(1),
  description: z.string().trim().min(1),
  location: z.string().trim().min(1),
  acquisitionValue: NonNegativeAmountSchema,
  status: z.string().trim().min(1),
  exercise: ExerciseSchema,
  document: TransparencyDocumentSchema.optional(),
})

export const CreatePatrimonialAssetRequestSchema = z.object({
  informationType: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(240),
  location: z.string().trim().min(1).max(180),
  acquisitionValue: NonNegativeAmountSchema,
  status: z.string().trim().min(1).max(60),
  exercise: ExerciseSchema,
  documentTitle: z.string().trim().max(200).optional(),
  documentUrl: z.union([z.url(), z.literal('')]).optional(),
})

export const UpdatePatrimonialAssetRequestSchema =
  CreatePatrimonialAssetRequestSchema.partial().extend({
    status: z.string().trim().min(1).max(60).optional(),
    publicationStatus: GeneralDataStatusSchema.optional(),
  })

export const AdminPatrimonialAssetSchema = PatrimonialAssetSchema.extend({
  publicationStatus: GeneralDataStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  publishedAt: z.iso.datetime().nullable(),
})

export const FinancialSectionIdSchema = z.enum([
  'trial-balances',
  'financial-statements',
  'revenues',
  'expenses',
])

export const FinancialDocumentItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1),
  period: z.string().trim().min(1),
  documents: z.array(TransparencyDocumentSchema).min(1).max(2),
})

export const FinancialSectionSchema = z.object({
  id: FinancialSectionIdSchema,
  title: z.string().trim().min(1),
  items: z.array(FinancialDocumentItemSchema),
})

export const FinancialTransparencySchema = z.object({
  exercise: ExerciseSchema,
  sections: z.array(FinancialSectionSchema),
})

export const PublicFinancialPageSchema = z.object({
  availableExercises: z.array(ExerciseSchema),
  periods: z.array(FinancialTransparencySchema),
})

export const BudgetInformationTypeSchema = z.enum([
  'budget',
  'financial',
  'trial-balance',
  'financial-statement',
  'patrimonial-statement',
  'budget-proposal',
])

export const BudgetRecordSchema = z.object({
  id: z.string().min(1),
  informationType: BudgetInformationTypeSchema,
  annualBudget: NonNegativeAmountSchema,
  plannedAmount: NonNegativeAmountSchema,
  executedAmount: NonNegativeAmountSchema,
  executionPercentage: z.number().finite().min(0).max(100),
  exercise: ExerciseSchema,
  document: TransparencyDocumentSchema.optional(),
})

export const BudgetRecordStatusSchema = z.enum(['DRAFT', 'PUBLISHED'])

export const AdminBudgetRecordSchema = BudgetRecordSchema.extend({
  status: BudgetRecordStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  publishedAt: z.iso.datetime().nullable(),
})

export const CreateBudgetRecordRequestSchema = z.object({
  informationType: BudgetInformationTypeSchema,
  annualBudget: NonNegativeAmountSchema,
  plannedAmount: NonNegativeAmountSchema,
  executedAmount: NonNegativeAmountSchema,
  exercise: ExerciseSchema,
  documentTitle: z.string().trim().max(200).optional(),
  documentUrl: z.union([z.url(), z.literal('')]).optional(),
})

export const UpdateBudgetRecordRequestSchema =
  CreateBudgetRecordRequestSchema.partial().extend({
    status: BudgetRecordStatusSchema.optional(),
  })

export const PublicBudgetRecordsSchema = z.object({
  availableExercises: z.array(ExerciseSchema),
  records: z.array(BudgetRecordSchema),
})

export const BudgetTransparencySchema = z.object({
  availableExercises: z.array(ExerciseSchema).min(1),
  records: z.array(BudgetRecordSchema),
})

export const FinancialInformationTypeSchema = z.enum([
  'trial-balances',
  'financial-statements',
  'revenues',
  'expenses',
])
export const FinancialPeriodSchema = z.enum([
  '1º trimestre',
  '2º trimestre',
  '3º trimestre',
  '4º trimestre',
])

export const FinancialDocumentRecordSchema = z.object({
  id: z.string().min(1),
  informationType: FinancialInformationTypeSchema,
  period: FinancialPeriodSchema,
  exercise: ExerciseSchema,
  documents: z.array(TransparencyDocumentSchema).min(1).max(2),
})

export const AdminFinancialDocumentRecordSchema =
  FinancialDocumentRecordSchema.extend({
    status: BudgetRecordStatusSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    publishedAt: z.iso.datetime().nullable(),
  })

const FinancialDocumentFieldsSchema = z.object({
  informationType: FinancialInformationTypeSchema,
  period: FinancialPeriodSchema,
  exercise: ExerciseSchema,
  pdfUrl: z.union([z.url(), z.literal('')]),
  csvUrl: z.union([z.url(), z.literal('')]),
})

export const CreateFinancialDocumentRequestSchema =
  FinancialDocumentFieldsSchema.refine(
    (value) => value.pdfUrl || value.csvUrl,
    {
      message: 'Cadastre pelo menos um arquivo PDF ou CSV.',
      path: ['pdfUrl'],
    },
  )

export const UpdateFinancialDocumentRequestSchema =
  FinancialDocumentFieldsSchema.partial().extend({
    status: BudgetRecordStatusSchema.optional(),
  })

export const ContractRecordSchema = z.object({
  id: z.string().min(1),
  supplier: z.string().trim().min(1),
  cnpj: z.string().trim().min(14).max(18),
  objectDescription: z.string().trim().min(1),
  signedAt: z.string().trim().min(1),
  term: z.string().trim().min(1),
  value: NonNegativeAmountSchema,
  exercise: ExerciseSchema,
  contractDocument: TransparencyDocumentSchema.optional(),
  amendments: z.array(TransparencyDocumentSchema),
})

export const PublicContractsPageSchema = z.object({
  availableExercises: z.array(ExerciseSchema).min(1),
  contracts: z.array(ContractRecordSchema),
})

export const GlossaryEntrySchema = z.object({
  term: z.string().trim().min(1),
  definition: z.string().trim().min(1),
})

export const PublicGlossaryPageSchema = z.object({
  introduction: z.string().trim().min(1),
  entries: z.array(GlossaryEntrySchema).min(1),
})

export const LgpdSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
})

export const LgpdSectionGroupSchema = z.object({
  id: z.string().min(1),
  sections: z.array(LgpdSectionSchema).min(1),
})

export const PublicLgpdPageSchema = z.object({
  introduction: z.array(z.string().trim().min(1)).min(1),
  groups: z.array(LgpdSectionGroupSchema).min(1),
})

export const PublicReportsPageSchema = z.object({
  availableExercises: z.array(ExerciseSchema).min(1),
  indicators: z.array(GeneralIndicatorsSchema).min(1),
})

export const AdministrativeEnrollmentSchema = z.object({
  id: z.string().min(1),
  exercise: ExerciseSchema,
  subsection: z.string().trim().min(1),
  lawyers: NonNegativeIntegerSchema,
  interns: NonNegativeIntegerSchema,
  supplementary: NonNegativeIntegerSchema,
  transferringLawyers: NonNegativeIntegerSchema,
})

export const AdministrativeOrganogramSchema = z.object({
  description: z.string().trim().min(1),
  document: TransparencyDocumentSchema,
})

export const PublicAdministrativePageSchema = z.object({
  summary: PublicSummarySchema,
  organogram: AdministrativeOrganogramSchema,
})

export const PatrimonialFiltersSchema = z.object({
  exercise: ExerciseSchema.optional(),
  informationType: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
})

export const PublicPatrimonialPageSchema = z.object({
  availableExercises: z.array(ExerciseSchema),
  assets: z.array(PatrimonialAssetSchema),
})

export const ContractFiltersSchema = z.object({
  exercise: ExerciseSchema.optional(),
  supplier: z.string().trim().min(1).optional(),
  search: z.string().trim().optional(),
})

export type GeneralIndicators = z.infer<typeof GeneralIndicatorsSchema>
export type PublicSummary = z.infer<typeof PublicSummarySchema>
export type GeneralData = z.infer<typeof GeneralDataSchema>
export type CreateGeneralDataRequest = z.infer<
  typeof CreateGeneralDataRequestSchema
>
export type UpdateGeneralDataRequest = z.infer<
  typeof UpdateGeneralDataRequestSchema
>
export type InstitutionalContent = z.infer<typeof InstitutionalContentSchema>
export type PublicInstitutionalPage = z.infer<
  typeof PublicInstitutionalPageSchema
>
export type HumanResourcesRecord = z.infer<typeof HumanResourcesRecordSchema>
export type PublicHumanResourcesPage = z.infer<
  typeof PublicHumanResourcesPageSchema
>
export type PatrimonialAsset = z.infer<typeof PatrimonialAssetSchema>
export type AdminPatrimonialAsset = z.infer<typeof AdminPatrimonialAssetSchema>
export type CreatePatrimonialAssetRequest = z.infer<
  typeof CreatePatrimonialAssetRequestSchema
>
export type UpdatePatrimonialAssetRequest = z.infer<
  typeof UpdatePatrimonialAssetRequestSchema
>
export type PublicPatrimonialPage = z.infer<typeof PublicPatrimonialPageSchema>
export type FinancialSectionId = z.infer<typeof FinancialSectionIdSchema>
export type FinancialTransparency = z.infer<typeof FinancialTransparencySchema>
export type PublicFinancialPage = z.infer<typeof PublicFinancialPageSchema>
export type BudgetTransparency = z.infer<typeof BudgetTransparencySchema>
export type BudgetRecord = z.infer<typeof BudgetRecordSchema>
export type AdminBudgetRecord = z.infer<typeof AdminBudgetRecordSchema>
export type CreateBudgetRecordRequest = z.infer<
  typeof CreateBudgetRecordRequestSchema
>
export type UpdateBudgetRecordRequest = z.infer<
  typeof UpdateBudgetRecordRequestSchema
>
export type PublicBudgetRecords = z.infer<typeof PublicBudgetRecordsSchema>
export type FinancialDocumentRecord = z.infer<
  typeof FinancialDocumentRecordSchema
>
export type AdminFinancialDocumentRecord = z.infer<
  typeof AdminFinancialDocumentRecordSchema
>
export type CreateFinancialDocumentRequest = z.infer<
  typeof CreateFinancialDocumentRequestSchema
>
export type UpdateFinancialDocumentRequest = z.infer<
  typeof UpdateFinancialDocumentRequestSchema
>
export type ContractRecord = z.infer<typeof ContractRecordSchema>
export type PublicContractsPage = z.infer<typeof PublicContractsPageSchema>
export type GlossaryEntry = z.infer<typeof GlossaryEntrySchema>
export type PublicGlossaryPage = z.infer<typeof PublicGlossaryPageSchema>
export type LgpdSection = z.infer<typeof LgpdSectionSchema>
export type LgpdSectionGroup = z.infer<typeof LgpdSectionGroupSchema>
export type PublicLgpdPage = z.infer<typeof PublicLgpdPageSchema>
export type PublicReportsPage = z.infer<typeof PublicReportsPageSchema>
export type AdministrativeEnrollment = z.infer<
  typeof AdministrativeEnrollmentSchema
>
export type AdministrativeOrganogram = z.infer<
  typeof AdministrativeOrganogramSchema
>
export type PublicAdministrativePage = z.infer<
  typeof PublicAdministrativePageSchema
>
