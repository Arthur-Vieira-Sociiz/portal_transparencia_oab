import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateGeneralDataRequest,
  GeneralData,
  UpdateGeneralDataRequest,
} from '@oab-transparencia/contracts/transparency'
import { CreateGeneralDataRequestSchema } from '@oab-transparencia/contracts/transparency'
import {
  createGeneralData,
  getPublicGeneralData,
  listGeneralData,
  publishGeneralData,
  updateGeneralData,
} from './api/general-data.api'

export const generalDataKeys = {
  all: ['general-data'] as const,
  admin: () => [...generalDataKeys.all, 'admin'] as const,
  public: (exercise?: number) =>
    [...generalDataKeys.all, 'public', exercise ?? 'latest'] as const,
}

function upsertRecord(records: GeneralData[] | undefined, saved: GeneralData) {
  return [
    ...(records ?? []).filter((record) => record.id !== saved.id),
    saved,
  ].sort((first, second) => second.exercise - first.exercise)
}

export function useAdminGeneralData(token: string | undefined) {
  return useQuery({
    enabled: Boolean(token),
    queryFn: () => listGeneralData(token as string),
    queryKey: generalDataKeys.admin(),
  })
}

export function usePublicGeneralData(exercise?: number) {
  return useQuery({
    queryFn: () => getPublicGeneralData(exercise),
    queryKey: generalDataKeys.public(exercise),
  })
}

export function useSaveGeneralData(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id?: string
      input: CreateGeneralDataRequest | UpdateGeneralDataRequest
    }) =>
      id
        ? updateGeneralData(token, id, input)
        : createGeneralData(token, CreateGeneralDataRequestSchema.parse(input)),
    onSuccess(saved) {
      queryClient.setQueryData<GeneralData[]>(
        generalDataKeys.admin(),
        (records) => upsertRecord(records, saved),
      )
    },
  })
}

export function usePublishGeneralData(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => publishGeneralData(token, id),
    onSuccess(published) {
      queryClient.setQueryData<GeneralData[]>(
        generalDataKeys.admin(),
        (records) => upsertRecord(records, published),
      )
      void queryClient.invalidateQueries({
        queryKey: [...generalDataKeys.all, 'public'],
      })
    },
  })
}
