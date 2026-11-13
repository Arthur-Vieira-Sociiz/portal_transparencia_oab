import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CreatePatrimonialAssetRequestSchema,
  type AdminPatrimonialAsset,
  type CreatePatrimonialAssetRequest,
  type UpdatePatrimonialAssetRequest,
} from '@oab-transparencia/contracts/transparency'
import {
  createPatrimonialAsset,
  getPublicPatrimonialPage,
  listPatrimonialAssets,
  publishPatrimonialExercise,
  updatePatrimonialAsset,
} from '../data/patrimonial.api'

export const patrimonialKeys = {
  all: ['patrimonial'] as const,
  admin: () => [...patrimonialKeys.all, 'admin'] as const,
  public: () => [...patrimonialKeys.all, 'public'] as const,
}

function sortAssets(assets: AdminPatrimonialAsset[]) {
  return assets.toSorted(
    (first, second) =>
      second.exercise - first.exercise ||
      first.informationType.localeCompare(second.informationType, 'pt-BR') ||
      first.description.localeCompare(second.description, 'pt-BR'),
  )
}

function upsertAsset(
  assets: AdminPatrimonialAsset[] | undefined,
  saved: AdminPatrimonialAsset,
) {
  return sortAssets([
    ...(assets ?? []).filter((asset) => asset.id !== saved.id),
    saved,
  ])
}

export function useAdminPatrimonial(token: string | undefined) {
  return useQuery({
    enabled: Boolean(token),
    queryFn: () => (token ? listPatrimonialAssets(token) : Promise.resolve([])),
    queryKey: patrimonialKeys.admin(),
  })
}

export function usePublicPatrimonial() {
  return useQuery({
    queryFn: getPublicPatrimonialPage,
    queryKey: patrimonialKeys.public(),
    staleTime: Number.POSITIVE_INFINITY,
  })
}

export function useSavePatrimonialAsset(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id?: string
      input: CreatePatrimonialAssetRequest | UpdatePatrimonialAssetRequest
    }) => {
      if (!token) throw new Error('Sessão administrativa não encontrada.')
      return id
        ? updatePatrimonialAsset(token, id, input)
        : createPatrimonialAsset(
            token,
            CreatePatrimonialAssetRequestSchema.parse(input),
          )
    },
    onSuccess(saved) {
      queryClient.setQueryData<AdminPatrimonialAsset[]>(
        patrimonialKeys.admin(),
        (assets) => upsertAsset(assets, saved),
      )
    },
  })
}

export function usePublishPatrimonialExercise(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (exercise: number) => {
      if (!token) throw new Error('Sessão administrativa não encontrada.')
      return publishPatrimonialExercise(token, exercise)
    },
    onSuccess(published, exercise) {
      queryClient.setQueryData<AdminPatrimonialAsset[]>(
        patrimonialKeys.admin(),
        (assets) =>
          sortAssets([
            ...(assets ?? []).filter((asset) => asset.exercise !== exercise),
            ...published,
          ]),
      )
      void queryClient.invalidateQueries({ queryKey: patrimonialKeys.public() })
    },
  })
}
