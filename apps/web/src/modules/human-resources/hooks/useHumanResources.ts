import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CreateHumanResourcesRequestSchema,
  type AdminHumanResourcesRecord,
  type CreateHumanResourcesRequest,
  type UpdateHumanResourcesRequest,
} from '@oab-transparencia/contracts/transparency'
import {
  createHumanResources,
  deleteHumanResources,
  getPublicHumanResourcesPage,
  listHumanResources,
  publishHumanResourcesExercise,
  updateHumanResources,
} from '../data/human-resources.api'

export const humanResourcesKeys = {
  all: ['human-resources'] as const,
  admin: () => [...humanResourcesKeys.all, 'admin'] as const,
  public: () => [...humanResourcesKeys.all, 'public'] as const,
}

function sortRecords(records: AdminHumanResourcesRecord[]) {
  return records.toSorted(
    (first, second) =>
      second.exercise - first.exercise ||
      first.locality.localeCompare(second.locality, 'pt-BR'),
  )
}

function upsertRecord(
  records: AdminHumanResourcesRecord[] | undefined,
  saved: AdminHumanResourcesRecord,
) {
  return sortRecords([
    ...(records ?? []).filter((record) => record.id !== saved.id),
    saved,
  ])
}

export function useAdminHumanResources(token: string | undefined) {
  return useQuery({
    enabled: Boolean(token),
    queryFn: () => (token ? listHumanResources(token) : Promise.resolve([])),
    queryKey: humanResourcesKeys.admin(),
  })
}

export function usePublicHumanResources() {
  return useQuery({
    queryFn: getPublicHumanResourcesPage,
    queryKey: humanResourcesKeys.public(),
    staleTime: Number.POSITIVE_INFINITY,
  })
}

export function useSaveHumanResources(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id?: string
      input: CreateHumanResourcesRequest | UpdateHumanResourcesRequest
    }) => {
      if (!token) throw new Error('Sessão administrativa não encontrada.')
      return id
        ? updateHumanResources(token, id, input)
        : createHumanResources(
            token,
            CreateHumanResourcesRequestSchema.parse(input),
          )
    },
    onSuccess(saved) {
      queryClient.setQueryData<AdminHumanResourcesRecord[]>(
        humanResourcesKeys.admin(),
        (records) => upsertRecord(records, saved),
      )
    },
  })
}

export function useDeleteHumanResources(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error('Sessão administrativa não encontrada.')
      await deleteHumanResources(token, id)
      return id
    },
    onSuccess(deletedId) {
      queryClient.setQueryData<AdminHumanResourcesRecord[]>(
        humanResourcesKeys.admin(),
        (records) =>
          (records ?? []).filter((record) => record.id !== deletedId),
      )
      void queryClient.invalidateQueries({
        queryKey: humanResourcesKeys.public(),
      })
    },
  })
}

export function usePublishHumanResources(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (exercise: number) => {
      if (!token) throw new Error('Sessão administrativa não encontrada.')
      return publishHumanResourcesExercise(token, exercise)
    },
    onSuccess(published, exercise) {
      queryClient.setQueryData<AdminHumanResourcesRecord[]>(
        humanResourcesKeys.admin(),
        (records) =>
          sortRecords([
            ...(records ?? []).filter((record) => record.exercise !== exercise),
            ...published,
          ]),
      )
      void queryClient.invalidateQueries({
        queryKey: humanResourcesKeys.public(),
      })
    },
  })
}
