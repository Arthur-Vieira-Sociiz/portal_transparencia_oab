import type {
  CreateReportsIndicatorRequest,
  ReportsIndicator,
  UpdateReportsIndicatorRequest,
} from '@oab-transparencia/contracts/transparency'

export class ReportsIndicatorsError extends Error {
  constructor(
    public readonly code:
      | 'REPORTS_INDICATOR_ALREADY_EXISTS'
      | 'REPORTS_INDICATOR_NOT_FOUND'
      | 'REPORTS_INDICATOR_EXERCISE_NOT_FOUND',
  ) {
    super(code)
  }
}

export type ReportsIndicatorsRepository = {
  list(): Promise<ReportsIndicator[]>
  listPublished(): Promise<{
    availableExercises: number[]
    indicators: ReportsIndicator[]
  }>
  findByExercise(exercise: number): Promise<ReportsIndicator | null>
  create(
    input: CreateReportsIndicatorRequest & { userId: string },
  ): Promise<ReportsIndicator | null>
  update(
    id: string,
    input: UpdateReportsIndicatorRequest & { userId: string },
  ): Promise<ReportsIndicator | null>
  delete(id: string): Promise<boolean>
  publish(exercise: number, userId: string): Promise<ReportsIndicator[]>
}

export function createReportsIndicatorsService(
  repository: ReportsIndicatorsRepository,
) {
  return {
    list: () => repository.list(),
    listPublished: () => repository.listPublished(),
    async create(input: CreateReportsIndicatorRequest & { userId: string }) {
      if (await repository.findByExercise(input.exercise)) {
        throw new ReportsIndicatorsError('REPORTS_INDICATOR_ALREADY_EXISTS')
      }
      const result = await repository.create(input)
      if (!result) {
        throw new ReportsIndicatorsError('REPORTS_INDICATOR_ALREADY_EXISTS')
      }
      return result
    },
    async update(
      id: string,
      input: UpdateReportsIndicatorRequest & { userId: string },
    ) {
      const result = await repository.update(id, input)
      if (!result)
        throw new ReportsIndicatorsError('REPORTS_INDICATOR_NOT_FOUND')
      return result
    },
    async delete(id: string) {
      if (!(await repository.delete(id))) {
        throw new ReportsIndicatorsError('REPORTS_INDICATOR_NOT_FOUND')
      }
    },
    async publish(exercise: number, userId: string) {
      const result = await repository.publish(exercise, userId)
      if (!result.length) {
        throw new ReportsIndicatorsError('REPORTS_INDICATOR_EXERCISE_NOT_FOUND')
      }
      return result
    },
  }
}

export type ReportsIndicatorsService = ReturnType<
  typeof createReportsIndicatorsService
>
