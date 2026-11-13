import type {
  AdminHumanResourcesRecord,
  CreateHumanResourcesRequest,
  PublicHumanResourcesPage,
  UpdateHumanResourcesRequest,
} from '@oab-transparencia/contracts/transparency'

export class HumanResourcesError extends Error {
  constructor(
    public readonly code:
      | 'HUMAN_RESOURCES_ALREADY_EXISTS'
      | 'HUMAN_RESOURCES_NOT_FOUND'
      | 'HUMAN_RESOURCES_EXERCISE_NOT_FOUND',
  ) {
    super(code)
  }
}

export type HumanResourcesRepository = {
  list(): Promise<AdminHumanResourcesRecord[]>
  listPublished(): Promise<PublicHumanResourcesPage>
  findByExerciseAndLocality(
    exercise: number,
    locality: string,
  ): Promise<AdminHumanResourcesRecord | null>
  create(
    input: CreateHumanResourcesRequest & { userId: string },
  ): Promise<AdminHumanResourcesRecord | null>
  update(
    id: string,
    input: UpdateHumanResourcesRequest & { userId: string },
  ): Promise<AdminHumanResourcesRecord | null>
  delete(id: string): Promise<boolean>
  publishExercise(
    exercise: number,
    userId: string,
  ): Promise<AdminHumanResourcesRecord[]>
}

export function createHumanResourcesService(
  repository: HumanResourcesRepository,
) {
  return {
    list: () => repository.list(),
    listPublished: () => repository.listPublished(),
    async create(input: CreateHumanResourcesRequest & { userId: string }) {
      if (
        await repository.findByExerciseAndLocality(
          input.exercise,
          input.locality,
        )
      ) {
        throw new HumanResourcesError('HUMAN_RESOURCES_ALREADY_EXISTS')
      }
      const result = await repository.create(input)
      if (!result) {
        throw new HumanResourcesError('HUMAN_RESOURCES_ALREADY_EXISTS')
      }
      return result
    },
    async update(
      id: string,
      input: UpdateHumanResourcesRequest & { userId: string },
    ) {
      const result = await repository.update(id, input)
      if (!result) throw new HumanResourcesError('HUMAN_RESOURCES_NOT_FOUND')
      return result
    },
    async delete(id: string) {
      if (!(await repository.delete(id))) {
        throw new HumanResourcesError('HUMAN_RESOURCES_NOT_FOUND')
      }
    },
    async publishExercise(exercise: number, userId: string) {
      const result = await repository.publishExercise(exercise, userId)
      if (!result.length) {
        throw new HumanResourcesError('HUMAN_RESOURCES_EXERCISE_NOT_FOUND')
      }
      return result
    },
  }
}

export type HumanResourcesService = ReturnType<
  typeof createHumanResourcesService
>
