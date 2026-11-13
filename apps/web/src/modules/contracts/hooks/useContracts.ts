import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CreateContractRecordRequestSchema,
  type AdminContractRecord,
  type CreateContractRecordRequest,
  type Supplier,
  type UpdateContractRecordRequest,
  type UpdateSupplierRequest,
} from '@oab-transparencia/contracts/transparency'
import {
  createContract,
  deleteContract,
  deleteSupplier,
  getPublicContractsPage,
  listContracts,
  listSuppliers,
  publishContractExercise,
  updateContract,
  updateSupplier,
} from '../data/contracts.api'

export const contractsKeys = {
  all: ['contracts'] as const,
  admin: () => [...contractsKeys.all, 'admin'] as const,
  suppliers: () => [...contractsKeys.all, 'suppliers'] as const,
  public: () => [...contractsKeys.all, 'public'] as const,
}

function sortContracts(records: AdminContractRecord[]) {
  return records.toSorted(
    (first, second) =>
      second.exercise - first.exercise ||
      first.supplier.localeCompare(second.supplier, 'pt-BR'),
  )
}

function sortSuppliers(suppliers: Supplier[]) {
  return suppliers.toSorted((first, second) =>
    first.name.localeCompare(second.name, 'pt-BR'),
  )
}

export function useAdminContracts(token: string | undefined) {
  return useQuery({
    enabled: Boolean(token),
    queryFn: () => (token ? listContracts(token) : Promise.resolve([])),
    queryKey: contractsKeys.admin(),
  })
}

export function useAdminSuppliers(token: string | undefined) {
  return useQuery({
    enabled: Boolean(token),
    queryFn: () => (token ? listSuppliers(token) : Promise.resolve([])),
    queryKey: contractsKeys.suppliers(),
  })
}

export function usePublicContracts() {
  return useQuery({
    queryFn: getPublicContractsPage,
    queryKey: contractsKeys.public(),
    staleTime: Number.POSITIVE_INFINITY,
  })
}

export function useSaveContract(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id?: string
      input: CreateContractRecordRequest | UpdateContractRecordRequest
    }) => {
      if (!token) throw new Error('Sessão administrativa não encontrada.')
      return id
        ? updateContract(token, id, input)
        : createContract(token, CreateContractRecordRequestSchema.parse(input))
    },
    onSuccess(saved) {
      queryClient.setQueryData<AdminContractRecord[]>(
        contractsKeys.admin(),
        (records) =>
          sortContracts([
            ...(records ?? []).filter((record) => record.id !== saved.id),
            saved,
          ]),
      )
      void queryClient.invalidateQueries({
        queryKey: contractsKeys.suppliers(),
      })
    },
  })
}

export function useDeleteContract(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error('Sessão administrativa não encontrada.')
      await deleteContract(token, id)
      return id
    },
    onSuccess(deletedId) {
      queryClient.setQueryData<AdminContractRecord[]>(
        contractsKeys.admin(),
        (records) =>
          (records ?? []).filter((record) => record.id !== deletedId),
      )
      void queryClient.invalidateQueries({ queryKey: contractsKeys.public() })
    },
  })
}

export function usePublishContracts(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (exercise: number) => {
      if (!token) throw new Error('Sessão administrativa não encontrada.')
      return publishContractExercise(token, exercise)
    },
    onSuccess(published, exercise) {
      queryClient.setQueryData<AdminContractRecord[]>(
        contractsKeys.admin(),
        (records) =>
          sortContracts([
            ...(records ?? []).filter((record) => record.exercise !== exercise),
            ...published,
          ]),
      )
      void queryClient.invalidateQueries({ queryKey: contractsKeys.public() })
    },
  })
}

export function useUpdateSupplier(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
      previousCnpj,
    }: {
      id: string
      input: UpdateSupplierRequest
      previousCnpj: string
    }) => {
      if (!token) throw new Error('Sessão administrativa não encontrada.')
      return updateSupplier(token, id, input).then((supplier) => ({
        previousCnpj,
        supplier,
      }))
    },
    onSuccess({ previousCnpj, supplier }) {
      queryClient.setQueryData<Supplier[]>(
        contractsKeys.suppliers(),
        (suppliers) =>
          sortSuppliers([
            ...(suppliers ?? []).filter((item) => item.id !== supplier.id),
            supplier,
          ]),
      )
      queryClient.setQueryData<AdminContractRecord[]>(
        contractsKeys.admin(),
        (records) =>
          (records ?? []).map((record) =>
            record.cnpj === previousCnpj
              ? { ...record, supplier: supplier.name, cnpj: supplier.cnpj }
              : record,
          ),
      )
      void queryClient.invalidateQueries({ queryKey: contractsKeys.public() })
    },
  })
}

export function useDeleteSupplier(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error('Sessão administrativa não encontrada.')
      await deleteSupplier(token, id)
      return id
    },
    onSuccess(deletedId) {
      queryClient.setQueryData<Supplier[]>(
        contractsKeys.suppliers(),
        (suppliers) =>
          (suppliers ?? []).filter((supplier) => supplier.id !== deletedId),
      )
    },
  })
}
