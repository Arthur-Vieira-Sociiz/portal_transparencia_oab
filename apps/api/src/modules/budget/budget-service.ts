import type {
  AdminBudgetRecord,
  CreateBudgetRecordRequest,
  PublicBudgetRecords,
  UpdateBudgetRecordRequest,
} from '@oab-transparencia/contracts/transparency'

export class BudgetError extends Error {
  constructor(
    public readonly code:
      | 'BUDGET_RECORD_ALREADY_EXISTS'
      | 'BUDGET_RECORD_NOT_FOUND'
      | 'BUDGET_EXERCISE_NOT_FOUND',
  ) {
    super(code)
  }
}

export type BudgetRepository = {
  list(): Promise<AdminBudgetRecord[]>
  findByTypeAndExercise(
    type: string,
    exercise: number,
  ): Promise<AdminBudgetRecord | null>
  listPublished(
    exercise?: number,
    informationType?: string,
  ): Promise<PublicBudgetRecords>
  create(
    input: CreateBudgetRecordRequest & { userId: string },
  ): Promise<AdminBudgetRecord | null>
  update(
    id: string,
    input: UpdateBudgetRecordRequest & { userId: string },
  ): Promise<AdminBudgetRecord | null>
  publishExercise(
    exercise: number,
    userId: string,
  ): Promise<AdminBudgetRecord[]>
}

export function createBudgetService(repository: BudgetRepository) {
  return {
    list: () => repository.list(),
    getPublished: (exercise?: number, type?: string) =>
      repository.listPublished(exercise, type),
    async create(input: CreateBudgetRecordRequest & { userId: string }) {
      if (
        await repository.findByTypeAndExercise(
          input.informationType,
          input.exercise,
        )
      )
        throw new BudgetError('BUDGET_RECORD_ALREADY_EXISTS')
      const result = await repository.create(input)
      if (!result) throw new BudgetError('BUDGET_RECORD_ALREADY_EXISTS')
      return result
    },
    async update(
      id: string,
      input: UpdateBudgetRecordRequest & { userId: string },
    ) {
      const result = await repository.update(id, input)
      if (!result) throw new BudgetError('BUDGET_RECORD_NOT_FOUND')
      return result
    },
    async publishExercise(exercise: number, userId: string) {
      const result = await repository.publishExercise(exercise, userId)
      if (!result.length) throw new BudgetError('BUDGET_EXERCISE_NOT_FOUND')
      return result
    },
  }
}

export type BudgetService = ReturnType<typeof createBudgetService>
