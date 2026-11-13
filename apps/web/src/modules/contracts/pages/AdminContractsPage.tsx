import { useMemo, useState } from 'react'
import {
  Eye,
  FileText,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import { Navigate } from 'react-router-dom'
import type {
  AdminContractRecord,
  CreateContractRecordRequest,
  Supplier,
} from '@oab-transparencia/contracts/transparency'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumericInput } from '@/components/ui/numeric-input'
import { useToast } from '@/components/ui/use-toast'
import {
  formatCnpj,
  formatContractDate,
  formatContractTerm,
} from '../data/contracts.formatters'
import {
  useAdminContracts,
  useAdminSuppliers,
  useDeleteContract,
  usePublishContracts,
  useSaveContract,
} from '../hooks/useContracts'
import { SuppliersPanel } from '../components/SuppliersPanel'
import { AdminShell } from '@/modules/auth/AdminShell'
import { useAuthSession } from '@/modules/auth/useAuth'

const emptyForm: CreateContractRecordRequest = {
  supplierName: '',
  cnpj: '',
  signedAt: '',
  term: '',
  value: 0,
  exercise: new Date().getFullYear(),
  contractDocumentUrl: '',
  amendmentUrls: [],
}

const emptyContracts: AdminContractRecord[] = []
const emptySuppliers: Supplier[] = []

export function AdminContractsPage() {
  const session = useAuthSession()
  const contracts = useAdminContracts(session?.token)
  const supplierList = useAdminSuppliers(session?.token)
  const saveContract = useSaveContract(session?.token)
  const publishContracts = usePublishContracts(session?.token)
  const removeContractMutation = useDeleteContract(session?.token)
  const records = contracts.data ?? emptyContracts
  const suppliers = supplierList.data ?? emptySuppliers
  const [form, setForm] = useState<CreateContractRecordRequest>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null)
  const [deletingContract, setDeletingContract] =
    useState<AdminContractRecord | null>(null)
  const { toast } = useToast()
  const exercises = useMemo(
    () =>
      [...new Set(records.map((record) => record.exercise))].sort(
        (a, b) => b - a,
      ),
    [records],
  )
  const selectedRecords =
    selectedExercise === null
      ? []
      : records.filter((record) => record.exercise === selectedExercise)
  if (!session) return <Navigate replace to="/login" />
  const saving =
    saveContract.isPending ||
    publishContracts.isPending ||
    removeContractMutation.isPending
  function setField<K extends keyof CreateContractRecordRequest>(
    key: K,
    value: CreateContractRecordRequest[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }
  function reset() {
    setForm({ ...emptyForm, exercise: form.exercise })
    setEditingId(null)
  }
  function edit(record: AdminContractRecord) {
    setEditingId(record.id)
    setForm({
      supplierName: record.supplier,
      cnpj: record.cnpj,
      signedAt: record.signedAt,
      term: record.term,
      value: record.value,
      exercise: record.exercise,
      contractDocumentUrl: record.contractDocument?.url ?? '',
      amendmentUrls: record.amendments.map((item) => item.url),
    })
  }
  async function save() {
    try {
      const result = await saveContract.mutateAsync({
        id: editingId ?? undefined,
        input: editingId ? { ...form, publicationStatus: 'DRAFT' } : form,
      })
      setEditingId(result.id)
      toast({ title: 'Contrato salvo', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Não foi possível salvar',
        description:
          error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'error',
      })
    }
  }
  async function publish() {
    try {
      await publishContracts.mutateAsync(form.exercise)
      toast({ title: 'Contratos publicados', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Não foi possível publicar',
        description:
          error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'error',
      })
    }
  }
  async function removeContract() {
    if (!deletingContract) return
    try {
      await removeContractMutation.mutateAsync(deletingContract.id)
      setDeletingContract(null)
      toast({ title: 'Contrato excluído', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Não foi possível excluir o contrato',
        description:
          error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'error',
      })
    }
  }
  return (
    <AdminShell
      description="Cadastre e publique os contratos e licitações."
      title="Contratos e licitações"
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 grid gap-8">
          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border">
              <div>
                <CardTitle>1. Contratos</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  O fornecedor é cadastrado automaticamente ao salvar um novo
                  CNPJ.
                </p>
              </div>
              <Button onClick={reset} type="button" variant="outline">
                <Plus size={16} /> Novo contrato
              </Button>
            </CardHeader>
            <CardContent className="grid gap-5 pt-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="contract-supplier">Fornecedor</Label>
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    id="contract-supplier"
                    onChange={(event) =>
                      (() => {
                        const supplier = suppliers.find(
                          (item) => item.id === event.target.value,
                        )
                        if (supplier) {
                          setField('supplierName', supplier.name)
                          setField('cnpj', supplier.cnpj)
                        } else {
                          setField('supplierName', '')
                          setField('cnpj', '')
                        }
                      })()
                    }
                    value={
                      suppliers.find((item) => item.cnpj === form.cnpj)?.id ??
                      ''
                    }
                  >
                    <option value="">Selecione um fornecedor</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                    <option value="__new__">Cadastrar novo fornecedor</option>
                  </select>
                  {!suppliers.some((item) => item.cnpj === form.cnpj) && (
                    <Input
                      aria-label="Nome do novo fornecedor"
                      onChange={(event) =>
                        setField('supplierName', event.target.value)
                      }
                      placeholder="Nome do novo fornecedor"
                      value={form.supplierName}
                    />
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contract-cnpj">CNPJ</Label>
                  <Input
                    id="contract-cnpj"
                    inputMode="numeric"
                    onChange={(event) =>
                      setField('cnpj', formatCnpj(event.target.value))
                    }
                    readOnly={suppliers.some((item) => item.cnpj === form.cnpj)}
                    value={form.cnpj}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label>Exercício</Label>
                  <NumericInput
                    kind="year"
                    onValueChange={(_, value) =>
                      setField('exercise', value || form.exercise)
                    }
                    value={form.exercise}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contract-signed">Data do contrato</Label>
                  <Input
                    id="contract-signed"
                    inputMode="numeric"
                    onChange={(event) => {
                      const start = formatContractDate(event.target.value)
                      setField('signedAt', start)
                      const end = form.term.split(' a ')[1] ?? ''
                      setField('term', `${start} a ${end}`)
                    }}
                    placeholder="DD/MM/AAAA"
                    value={form.signedAt}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contract-term">Vigência</Label>
                  <Input
                    id="contract-term"
                    inputMode="numeric"
                    onChange={(event) =>
                      setField('term', formatContractTerm(event.target.value))
                    }
                    placeholder="DD/MM/AAAA a DD/MM/AAAA"
                    value={form.term}
                  />
                </div>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Valor</Label>
                  <NumericInput
                    kind="amount"
                    onValueChange={(_, value) => setField('value', value)}
                    value={form.value}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="contract-document">
                    URL do contrato (PDF)
                  </Label>
                  <Input
                    id="contract-document"
                    onChange={(event) =>
                      setField('contractDocumentUrl', event.target.value)
                    }
                    type="url"
                    value={form.contractDocumentUrl ?? ''}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contract-amendment">
                    URL do aditivo (opcional)
                  </Label>
                  <Input
                    id="contract-amendment"
                    onChange={(event) =>
                      setField(
                        'amendmentUrls',
                        event.target.value ? [event.target.value] : [],
                      )
                    }
                    type="url"
                    value={form.amendmentUrls[0] ?? ''}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3 border-t border-border pt-5">
                <Button
                  disabled={saving || !form.supplierName || !form.cnpj}
                  onClick={save}
                  type="button"
                >
                  <Save size={16} /> {saving ? 'Salvando…' : 'Salvar rascunho'}
                </Button>
                <Button
                  className="bg-[#008236] hover:bg-[#006b2d]"
                  disabled={
                    saving ||
                    !records.some((record) => record.exercise === form.exercise)
                  }
                  onClick={publish}
                  type="button"
                >
                  <Send size={16} /> Publicar exercício
                </Button>
                <Button onClick={reset} type="button" variant="outline">
                  <RotateCcw size={16} /> Limpar formulário
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="min-w-0">
            <Card className="min-w-0">
              <CardHeader>
                <CardTitle>Contratos cadastrados</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Selecione um exercício para ver os contratos.
                </p>
              </CardHeader>
              <CardContent className="grid gap-3">
                {contracts.isPending ? (
                  <p className="text-sm text-muted-foreground">
                    Carregando contratos…
                  </p>
                ) : contracts.isError ? (
                  <p className="text-sm text-destructive" role="alert">
                    Não foi possível carregar os contratos.
                  </p>
                ) : exercises.length ? (
                  exercises.map((exercise) => (
                    <button
                      className="flex w-full items-center justify-between rounded-lg border border-border p-4 text-left hover:bg-[#f7f9fc]"
                      key={exercise}
                      onClick={() => setSelectedExercise(exercise)}
                      type="button"
                    >
                      <span>
                        <strong>Exercício {exercise}</strong>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {
                            records.filter(
                              (record) => record.exercise === exercise,
                            ).length
                          }{' '}
                          contrato(s)
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-[#52617a]">
                        Ver contratos →
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum contrato cadastrado.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <aside className="grid content-start gap-8">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye size={18} /> Pré-visualização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border bg-[#f7f9fc] p-4 text-sm">
                <p className="font-semibold text-[#223149]">
                  {form.supplierName || 'Fornecedor'}
                </p>
                <p className="mt-2">
                  <strong>CNPJ:</strong> {form.cnpj || '—'}
                </p>
                <p>
                  <strong>Vigência:</strong> {form.term || '—'}
                </p>
                <p>
                  <strong>Valor:</strong> R${' '}
                  {form.value.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
          <SuppliersPanel
            isError={supplierList.isError}
            isPending={supplierList.isPending}
            onSelect={(supplier) => {
              setField('supplierName', supplier.name)
              setField('cnpj', supplier.cnpj)
            }}
            onUpdated={(supplier, previousCnpj) => {
              if (form.cnpj === previousCnpj) {
                setField('supplierName', supplier.name)
                setField('cnpj', supplier.cnpj)
              }
            }}
            suppliers={suppliers}
            token={session.token}
          />
        </aside>
      </div>
      {selectedExercise !== null && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#223149]/45 p-4"
          role="dialog"
        >
          <div className="w-full max-w-5xl rounded-xl border border-[#dfe4ea] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#52617a]">
                  Exercício {selectedExercise}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#223149]">
                  Contratos cadastrados
                </h2>
              </div>
              <button
                aria-label="Fechar contratos"
                className="flex size-9 items-center justify-center rounded-md border border-[#d1d9e4]"
                onClick={() => setSelectedExercise(null)}
                type="button"
              >
                <X size={17} />
              </button>
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-[#f1f4f7]">
                  <tr className="border-b border-[#dfe4ea] text-xs uppercase tracking-[0.06em] text-[#52617a]">
                    <th className="rounded-tl-md p-3">Fornecedor</th>
                    <th className="p-3">Vigência</th>
                    <th className="p-3">Valor</th>
                    <th className="rounded-tr-md p-3">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRecords.map((record) => (
                    <tr
                      className="border-b border-[#e8edf2] transition-colors last:border-0 hover:bg-[#f8fafc]"
                      key={record.id}
                    >
                      <td className="p-3 font-medium text-[#223149]">
                        <div>{record.supplier}</div>
                        <div className="mt-1 text-xs font-normal text-muted-foreground">
                          CNPJ: {record.cnpj}
                        </div>
                      </td>
                      <td className="p-3 text-[#52617a]">{record.term}</td>
                      <td className="p-3 font-medium text-[#223149]">
                        R${' '}
                        {record.value.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            className="h-9"
                            onClick={() => {
                              edit(record)
                              setSelectedExercise(null)
                            }}
                            type="button"
                            variant="outline"
                          >
                            <Pencil size={14} /> Editar
                          </Button>
                          <Button
                            className="h-9 text-red-700 hover:bg-red-50 hover:text-red-800"
                            onClick={() => setDeletingContract(record)}
                            type="button"
                            variant="outline"
                          >
                            <Trash2 size={14} /> Excluir
                          </Button>
                          {record.contractDocument && (
                            <a
                              className="inline-flex items-center gap-1 text-[#0284c7] hover:underline"
                              href={record.contractDocument.url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              <FileText size={14} /> Documento
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <ConfirmationDialog
        confirmLabel="Excluir contrato"
        description="O contrato será removido permanentemente deste exercício."
        isLoading={saving}
        onCancel={() => setDeletingContract(null)}
        onConfirm={() => void removeContract()}
        open={deletingContract !== null}
        title="Excluir contrato?"
      />
    </AdminShell>
  )
}
