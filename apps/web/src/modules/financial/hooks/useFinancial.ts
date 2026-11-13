import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CreateFinancialDocumentRequestSchema,
  type AdminFinancialDocumentRecord,
  type CreateFinancialDocumentRequest,
  type UpdateFinancialDocumentRequest,
} from '@oab-transparencia/contracts/transparency'
import {
  createFinancialDocument,
  getPublicFinancialPage,
  listFinancialDocuments,
  publishFinancialExercise,
  updateFinancialDocument,
} from '../data/financial.api'

export const financialKeys = {
  all: ['financial'] as const,
  admin: () => [...financialKeys.all, 'admin'] as const,
  public: () => [...financialKeys.all, 'public'] as const,
}

function sortRecords(records: AdminFinancialDocumentRecord[]) {
  return records.toSorted(
    (first, second) =>
      second.exercise - first.exercise ||
      first.informationType.localeCompare(second.informationType) ||
      first.period.localeCompare(second.period),
  )
}

function upsertRecord(
  records: AdminFinancialDocumentRecord[] | undefined,
  saved: AdminFinancialDocumentRecord,
) {
  return sortRecords([
    ...(records ?? []).filter((record) => record.id !== saved.id),
    saved,
  ])
}

export function useAdminFinancial(token: string | undefined) {
  return useQuery({
    enabled: Boolean(token),
    queryFn: () =>
      token ? listFinancialDocuments(token) : Promise.resolve([]),
    queryKey: financialKeys.admin(),
  })
}

export function usePublicFinancial() {
  return useQuery({
    queryFn: getPublicFinancialPage,
    queryKey: financialKeys.public(),
    staleTime: Number.POSITIVE_INFINITY,
  })
}

export function useSaveFinancialDocument(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id?: string
      input: CreateFinancialDocumentRequest | UpdateFinancialDocumentRequest
    }) => {
      if (!token) throw new Error('Sessão administrativa não encontrada.')
      return id
        ? updateFinancialDocument(token, id, input)
        : createFinancialDocument(
            token,
            CreateFinancialDocumentRequestSchema.parse(input),
          )
    },
    onSuccess(saved) {
      queryClient.setQueryData<AdminFinancialDocumentRecord[]>(
        financialKeys.admin(),
        (records) => upsertRecord(records, saved),
      )
    },
  })
}

export function usePublishFinancialExercise(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (exercise: number) => {
      if (!token) throw new Error('Sessão administrativa não encontrada.')
      return publishFinancialExercise(token, exercise)
    },
    onSuccess(published, exercise) {
      queryClient.setQueryData<AdminFinancialDocumentRecord[]>(
        financialKeys.admin(),
        (records) =>
          sortRecords([
            ...(records ?? []).filter((record) => record.exercise !== exercise),
            ...published,
          ]),
      )
      void queryClient.invalidateQueries({ queryKey: financialKeys.public() })
    },
  })
}
