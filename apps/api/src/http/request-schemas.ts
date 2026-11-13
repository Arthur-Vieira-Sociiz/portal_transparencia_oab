import { ExerciseSchema } from '@oab-transparencia/contracts/common'
import { BudgetInformationTypeSchema } from '@oab-transparencia/contracts/transparency'
import { z } from 'zod'

const IntegerStringSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, 'Deve ser um número inteiro.')

const ExerciseFromStringSchema =
  IntegerStringSchema.transform(Number).pipe(ExerciseSchema)

const PositiveIntegerFromStringSchema = IntegerStringSchema.transform(
  Number,
).pipe(z.number().int().positive())

export const IdParamsSchema = z.object({
  id: z.string().trim().min(1),
})

export const ExerciseParamsSchema = z.object({
  exercise: ExerciseFromStringSchema,
})

export const ExerciseQuerySchema = z.object({
  exercise: ExerciseFromStringSchema.optional(),
})

export const BudgetQuerySchema = ExerciseQuerySchema.extend({
  informationType: BudgetInformationTypeSchema.optional(),
})

export const PaginationQuerySchema = z.object({
  page: PositiveIntegerFromStringSchema.optional(),
  limit: PositiveIntegerFromStringSchema.optional(),
})

export type IdParams = z.input<typeof IdParamsSchema>
export type ExerciseParams = z.input<typeof ExerciseParamsSchema>
