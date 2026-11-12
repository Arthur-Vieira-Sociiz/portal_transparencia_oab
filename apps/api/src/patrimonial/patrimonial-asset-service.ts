import type {
  AdminPatrimonialAsset,
  CreatePatrimonialAssetRequest,
  PublicPatrimonialPage,
  UpdatePatrimonialAssetRequest,
} from '@oab-transparencia/contracts/transparency'

export class PatrimonialAssetError extends Error {
  constructor(
    public readonly code:
      | 'PATRIMONIAL_ASSET_ALREADY_EXISTS'
      | 'PATRIMONIAL_ASSET_NOT_FOUND'
      | 'PATRIMONIAL_EXERCISE_NOT_FOUND',
  ) {
    super(code)
  }
}

export type PatrimonialAssetRepository = {
  list(): Promise<AdminPatrimonialAsset[]>
  listPublished(): Promise<PublicPatrimonialPage>
  findDuplicate(
    informationType: string,
    description: string,
    exercise: number,
  ): Promise<AdminPatrimonialAsset | null>
  create(
    input: CreatePatrimonialAssetRequest & { userId: string },
  ): Promise<AdminPatrimonialAsset>
  update(
    id: string,
    input: UpdatePatrimonialAssetRequest & { userId: string },
  ): Promise<AdminPatrimonialAsset | null>
  publishExercise(
    exercise: number,
    userId: string,
  ): Promise<AdminPatrimonialAsset[]>
}

export function createPatrimonialAssetService(
  repository: PatrimonialAssetRepository,
) {
  return {
    list: () => repository.list(),
    listPublished: () => repository.listPublished(),
    async create(input: CreatePatrimonialAssetRequest & { userId: string }) {
      if (
        await repository.findDuplicate(
          input.informationType,
          input.description,
          input.exercise,
        )
      ) {
        throw new PatrimonialAssetError('PATRIMONIAL_ASSET_ALREADY_EXISTS')
      }
      return repository.create(input)
    },
    async update(
      id: string,
      input: UpdatePatrimonialAssetRequest & { userId: string },
    ) {
      const result = await repository.update(id, input)
      if (!result)
        throw new PatrimonialAssetError('PATRIMONIAL_ASSET_NOT_FOUND')
      return result
    },
    async publishExercise(exercise: number, userId: string) {
      const result = await repository.publishExercise(exercise, userId)
      if (!result.length)
        throw new PatrimonialAssetError('PATRIMONIAL_EXERCISE_NOT_FOUND')
      return result
    },
  }
}

export type PatrimonialAssetService = ReturnType<
  typeof createPatrimonialAssetService
>
