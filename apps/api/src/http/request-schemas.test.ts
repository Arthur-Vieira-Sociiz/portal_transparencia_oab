import { describe, expect, it } from 'vitest'
import {
  BudgetQuerySchema,
  ExerciseParamsSchema,
  IdParamsSchema,
  PaginationQuerySchema,
} from './request-schemas.js'

describe('request schemas', () => {
  it('parses exercise and pagination values from the HTTP string format', () => {
    expect(ExerciseParamsSchema.parse({ exercise: '2025' })).toEqual({
      exercise: 2025,
    })
    expect(PaginationQuerySchema.parse({ page: '2', limit: '25' })).toEqual({
      page: 2,
      limit: 25,
    })
  })

  it('rejects invalid IDs, exercises and budget filters', () => {
    expect(IdParamsSchema.safeParse({ id: '   ' }).success).toBe(false)
    expect(ExerciseParamsSchema.safeParse({ exercise: '2025.5' }).success).toBe(
      false,
    )
    expect(
      BudgetQuerySchema.safeParse({ informationType: 'invalid' }).success,
    ).toBe(false)
  })
})
