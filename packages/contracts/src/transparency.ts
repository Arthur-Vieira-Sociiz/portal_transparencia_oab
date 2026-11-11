import { z } from 'zod'

import {
  ExerciseSchema,
  MonthSchema,
  TransparencyDocumentSchema,
} from './common.js'

const NonNegativeIntegerSchema = z.number().int().nonnegative()
const NonNegativeAmountSchema = z.number().finite().nonnegative()

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

export const ContractRecordSchema = z.object({
  id: z.string().min(1),
  supplier: z.string().trim().min(1),
  cnpj: z.string().trim().min(14).max(18),
  term: z.string().trim().min(1),
  value: NonNegativeAmountSchema,
  exercise: ExerciseSchema,
  contractDocument: TransparencyDocumentSchema.optional(),
  amendments: z.array(TransparencyDocumentSchema),
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

export const PatrimonialFiltersSchema = z.object({
  exercise: ExerciseSchema.optional(),
  informationType: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
})

export const ContractFiltersSchema = z.object({
  exercise: ExerciseSchema.optional(),
  supplier: z.string().trim().min(1).optional(),
  search: z.string().trim().optional(),
})

export type GeneralIndicators = z.infer<typeof GeneralIndicatorsSchema>
export type HumanResourcesRecord = z.infer<typeof HumanResourcesRecordSchema>
export type PatrimonialAsset = z.infer<typeof PatrimonialAssetSchema>
export type FinancialTransparency = z.infer<typeof FinancialTransparencySchema>
export type ContractRecord = z.infer<typeof ContractRecordSchema>
export type AdministrativeEnrollment = z.infer<
  typeof AdministrativeEnrollmentSchema
>
