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

const PageSizeFromStringSchema = IntegerStringSchema.transform(Number).pipe(
  z.number().int().positive().max(100),
)

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
  page: PositiveIntegerFromStringSchema.default(1),
  limit: PageSizeFromStringSchema.default(20),
})

export type Pagination = z.output<typeof PaginationQuerySchema>

export type PaginationMetadata = Pagination & {
  total: number
  totalPages: number
}

export type PaginatedResult<T> = {
  items: T[]
  pagination: PaginationMetadata
}

export function getPaginationArguments({ page, limit }: Pagination) {
  return { skip: (page - 1) * limit, take: limit }
}

export function getPaginationMetadata(
  { page, limit }: Pagination,
  total: number,
): PaginationMetadata {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}

export type IdParams = z.input<typeof IdParamsSchema>
export type ExerciseParams = z.input<typeof ExerciseParamsSchema>
