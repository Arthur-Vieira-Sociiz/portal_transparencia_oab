import { z } from 'zod'

export const ExerciseSchema = z.number().int().min(2000).max(2100)

export const MonthSchema = z.enum([
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
])

export const DocumentFormatSchema = z.enum(['pdf', 'csv', 'xlsx'])

export const TransparencyCategorySchema = z.enum([
  'institutional',
  'administrative',
  'budget',
  'financial',
  'patrimonial',
  'contracts-and-bids',
  'human-resources',
  'reports-and-indicators',
  'glossary',
  'lgpd',
])

export const TransparencyDocumentSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1),
  format: DocumentFormatSchema,
  url: z.string().url(),
  category: TransparencyCategorySchema,
  exercise: ExerciseSchema,
  period: z.string().trim().min(1).optional(),
})

export type Exercise = z.infer<typeof ExerciseSchema>
export type Month = z.infer<typeof MonthSchema>
export type TransparencyDocument = z.infer<typeof TransparencyDocumentSchema>
