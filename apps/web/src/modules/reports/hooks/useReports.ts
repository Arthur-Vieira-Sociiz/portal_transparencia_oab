import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CreateReportsIndicatorRequestSchema,
  type CreateReportsIndicatorRequest,
  type ReportsIndicator,
  type UpdateReportsIndicatorRequest,
} from '@oab-transparencia/contracts/transparency'
import {
  createReportsIndicator,
  deleteReportsIndicator,
  getPublicReportsPage,
  listReportsIndicators,
  publishReportsExercise,
  updateReportsIndicator,
} from '../data/reports.api'

export const reportsKeys = {
  all: ['reports'] as const,
  admin: () => [...reportsKeys.all, 'admin'] as const,
  public: () => [...reportsKeys.all, 'public'] as const,
}

function sortIndicators(indicators: ReportsIndicator[]) {
  return indicators.toSorted(
    (first, second) => second.exercise - first.exercise,
  )
}

export function useAdminReports(token: string | undefined) {
  return useQuery({
    enabled: Boolean(token),
    queryFn: () => (token ? listReportsIndicators(token) : Promise.resolve([])),
    queryKey: reportsKeys.admin(),
  })
}

export function usePublicReports() {
  return useQuery({
    queryFn: getPublicReportsPage,
    queryKey: reportsKeys.public(),
    staleTime: Number.POSITIVE_INFINITY,
  })
}

export function useSaveReportsIndicator(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id?: string
      input: CreateReportsIndicatorRequest | UpdateReportsIndicatorRequest
    }) => {
      if (!token) throw new Error('Sessão administrativa não encontrada.')
      return id
        ? updateReportsIndicator(token, id, input)
        : createReportsIndicator(
            token,
            CreateReportsIndicatorRequestSchema.parse(input),
          )
    },
    onSuccess(saved) {
      queryClient.setQueryData<ReportsIndicator[]>(
        reportsKeys.admin(),
        (indicators) =>
          sortIndicators([
            ...(indicators ?? []).filter(
              (indicator) => indicator.id !== saved.id,
            ),
            saved,
          ]),
      )
    },
  })
}

export function useDeleteReportsIndicator(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error('Sessão administrativa não encontrada.')
      await deleteReportsIndicator(token, id)
      return id
    },
    onSuccess(deletedId) {
      queryClient.setQueryData<ReportsIndicator[]>(
        reportsKeys.admin(),
        (indicators) =>
          (indicators ?? []).filter((indicator) => indicator.id !== deletedId),
      )
      void queryClient.invalidateQueries({ queryKey: reportsKeys.public() })
    },
  })
}

export function usePublishReports(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (exercise: number) => {
      if (!token) throw new Error('Sessão administrativa não encontrada.')
      return publishReportsExercise(token, exercise)
    },
    onSuccess(published, exercise) {
      queryClient.setQueryData<ReportsIndicator[]>(
        reportsKeys.admin(),
        (indicators) =>
          sortIndicators([
            ...(indicators ?? []).filter(
              (indicator) => indicator.exercise !== exercise,
            ),
            ...published,
          ]),
      )
      void queryClient.invalidateQueries({ queryKey: reportsKeys.public() })
    },
  })
}
