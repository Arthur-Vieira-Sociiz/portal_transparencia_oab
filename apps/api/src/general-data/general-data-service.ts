import type {
  CreateGeneralDataRequest,
  GeneralData,
  UpdateGeneralDataRequest,
} from '@oab-transparencia/contracts/transparency'

export class GeneralDataError extends Error {
  constructor(
    public readonly code:
      | 'EXERCISE_ALREADY_EXISTS'
      | 'GENERAL_DATA_NOT_FOUND'
      | 'GENERAL_DATA_ALREADY_PUBLISHED',
  ) {
    super(code)
  }
}

export type GeneralDataRepository = {
  list(): Promise<GeneralData[]>
  findByExercise(exercise: number): Promise<GeneralData | null>
  findPublishedByExercise(exercise?: number): Promise<GeneralData | null>
  create(
    input: CreateGeneralDataRequest & { userId: string },
  ): Promise<GeneralData | null>
  update(
    id: string,
    input: UpdateGeneralDataRequest & { userId: string },
  ): Promise<GeneralData | null>
  publish(id: string, userId: string): Promise<GeneralData | null>
}

export function createGeneralDataService(repository: GeneralDataRepository) {
  return {
    async list() {
      return repository.list()
    },
    async getPublished(exercise?: number) {
      return repository.findPublishedByExercise(exercise)
    },
    async create(input: CreateGeneralDataRequest & { userId: string }) {
      if (await repository.findByExercise(input.exercise)) {
        throw new GeneralDataError('EXERCISE_ALREADY_EXISTS')
      }
      const result = await repository.create(input)
      if (!result) throw new GeneralDataError('EXERCISE_ALREADY_EXISTS')
      return result
    },
    async update(
      id: string,
      input: UpdateGeneralDataRequest & { userId: string },
    ) {
      const result = await repository.update(id, input)
      if (!result) throw new GeneralDataError('GENERAL_DATA_NOT_FOUND')
      return result
    },
    async publish(id: string, userId: string) {
      const result = await repository.publish(id, userId)
      if (!result) throw new GeneralDataError('GENERAL_DATA_NOT_FOUND')
      return result
    },
  }
}

export type GeneralDataService = ReturnType<typeof createGeneralDataService>
