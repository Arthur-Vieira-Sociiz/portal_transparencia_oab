import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CreateBudgetRecordRequestSchema,
  type AdminBudgetRecord,
  type CreateBudgetRecordRequest,
  type PublicBudgetRecords,
  type UpdateBudgetRecordRequest,
} from '@oab-transparencia/contracts/transparency'
import type { ApiError } from '@/lib/api-client'
import {
  createBudgetRecord,
  getPublicBudgetRecords,
  listBudgetRecords,
  publishBudgetExercise,
  updateBudgetRecord,
} from '../data/budget.api'

const emptyPublicBudget: PublicBudgetRecords = {
  availableExercises: [],
  records: [],
}

export const budgetKeys = {
  all: ['budget'] as const,
  admin: () => [...budgetKeys.all, 'admin'] as const,
  public: (exercise?: number) =>
    [...budgetKeys.all, 'public', exercise ?? 'all'] as const,
}

function sortRecords(records: AdminBudgetRecord[]) {
  return records.toSorted(
    (first, second) =>
      second.exercise - first.exercise ||
      first.informationType.localeCompare(second.informationType),
  )
}

function upsertRecord(
  records: AdminBudgetRecord[] | undefined,
  saved: AdminBudgetRecord,
) {
  return sortRecords([
    ...(records ?? []).filter((record) => record.id !== saved.id),
    saved,
  ])
}

export function useAdminBudget(token: string | undefined) {
  return useQuery({
    enabled: Boolean(token),
    queryFn: () => (token ? listBudgetRecords(token) : Promise.resolve([])),
    queryKey: budgetKeys.admin(),
  })
}

export function usePublicBudget(exercise?: number) {
  return useQuery({
    queryFn: async () => {
      try {
        return await getPublicBudgetRecords(exercise)
      } catch (error) {
        if ((error as ApiError).status === 404) return emptyPublicBudget
        throw error
      }
    },
    queryKey: budgetKeys.public(exercise),
    staleTime: 30_000,
  })
}

export function useSaveBudgetRecord(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id?: string
      input: CreateBudgetRecordRequest | UpdateBudgetRecordRequest
    }) => {
      if (!token) throw new Error('Sessão administrativa não encontrada.')
      return id
        ? updateBudgetRecord(token, id, input)
        : createBudgetRecord(
            token,
            CreateBudgetRecordRequestSchema.parse(input),
          )
    },
    onSuccess(saved) {
      queryClient.setQueryData<AdminBudgetRecord[]>(
        budgetKeys.admin(),
        (records) => upsertRecord(records, saved),
      )
    },
  })
}

export function usePublishBudgetExercise(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (exercise: number) => {
      if (!token) throw new Error('Sessão administrativa não encontrada.')
      return publishBudgetExercise(token, exercise)
    },
    onSuccess(published, exercise) {
      queryClient.setQueryData<AdminBudgetRecord[]>(
        budgetKeys.admin(),
        (records) =>
          sortRecords([
            ...(records ?? []).filter((record) => record.exercise !== exercise),
            ...published,
          ]),
      )
      void queryClient.invalidateQueries({
        queryKey: [...budgetKeys.all, 'public'],
      })
    },
  })
}
