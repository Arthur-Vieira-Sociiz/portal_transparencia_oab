import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Eye,
  FileText,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Send,
  X,
} from 'lucide-react'
import { Navigate } from 'react-router-dom'

import type {
  AdminFinancialDocumentRecord,
  CreateFinancialDocumentRequest,
} from '@oab-transparencia/contracts/transparency'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumericInput } from '@/components/ui/numeric-input'
import { useToast } from '@/components/ui/use-toast'
import {
  useAdminFinancial,
  usePublishFinancialExercise,
  useSaveFinancialDocument,
} from '../hooks/useFinancial'
import { useAuthSession } from '@/modules/auth/useAuth'
import { AdminShell } from '@/modules/auth/AdminShell'

const types = [
  ['trial-balances', 'Balancetes'],
  ['financial-statements', 'Demonstrativos financeiros'],
  ['revenues', 'Receitas'],
  ['expenses', 'Despesas'],
] as const
type FinancialType = (typeof types)[number][0]
const periods = [
  '1º trimestre',
  '2º trimestre',
  '3º trimestre',
  '4º trimestre',
] as const
type FinancialPeriod = (typeof periods)[number]
type Form = CreateFinancialDocumentRequest
const emptyForm: Form = {
  informationType: 'financial-statements',
  period: '1º trimestre',
  exercise: new Date().getFullYear(),
  pdfUrl: '',
  csvUrl: '',
}
const emptyRecords: AdminFinancialDocumentRecord[] = []

export function AdminFinancialPage() {
  const session = useAuthSession()
  const financial = useAdminFinancial(session?.token)
  const saveFinancial = useSaveFinancialDocument(session?.token)
  const publishFinancial = usePublishFinancialExercise(session?.token)
  const records = financial.data ?? emptyRecords
  const [form, setForm] = useState<Form>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null)
  const [pending, setPending] = useState<'clear' | 'publish' | null>(null)
  const { toast } = useToast()

  const recordsByExercise = useMemo(() => {
    return records.reduce((groups, record) => {
      const current = groups.get(record.exercise) ?? []
      groups.set(record.exercise, [...current, record])
      return groups
    }, new Map<number, AdminFinancialDocumentRecord[]>())
  }, [records])
  const exercises = [...recordsByExercise.keys()].sort((a, b) => b - a)
  const selectedRecords =
    selectedExercise === null
      ? []
      : (recordsByExercise.get(selectedExercise) ?? [])
  if (!session) return <Navigate replace to="/login" />
  const saving = saveFinancial.isPending || publishFinancial.isPending

  function reset() {
    setForm({ ...emptyForm, exercise: form.exercise })
    setEditingId(null)
  }

  function edit(record: AdminFinancialDocumentRecord) {
    setEditingId(record.id)
    setForm({
      informationType: record.informationType,
      period: record.period,
      exercise: record.exercise,
      pdfUrl:
        record.documents.find((document) => document.format === 'pdf')?.url ??
        '',
      csvUrl:
        record.documents.find((document) => document.format === 'csv')?.url ??
        '',
    })
  }

  async function save() {
    const duplicate = records.some(
      (record) =>
        record.id !== editingId &&
        record.exercise === form.exercise &&
        record.informationType === form.informationType &&
        record.period === form.period,
    )
    if (duplicate) {
      const typeLabel = types.find(
        ([value]) => value === form.informationType,
      )?.[1]
      toast({
        title: 'Documento duplicado',
        description: `Já existe ${typeLabel?.toLowerCase()} do ${form.period} cadastrado para o exercício ${form.exercise}.`,
        variant: 'warning',
      })
      return
    }
    try {
      const record = await saveFinancial.mutateAsync({
        id: editingId ?? undefined,
        input: form,
      })
      setEditingId(record.id)
      toast({
        title: 'Documento salvo',
        description: 'Confira o registro antes de publicar.',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Não foi possível salvar o documento',
        description:
          error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'error',
      })
    }
  }

  async function publish() {
    try {
      await publishFinancial.mutateAsync(form.exercise)
      toast({
        title: 'Financeiro publicado',
        description: 'Os documentos já estão disponíveis para publicação.',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Não foi possível publicar',
        description:
          error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'error',
      })
    } finally {
      setPending(null)
    }
  }

  function confirm() {
    if (pending === 'clear') {
      reset()
      setPending(null)
      toast({ title: 'Formulário limpo', variant: 'warning' })
      return
    }
    void publish()
  }

  return (
    <AdminShell
      description="Cadastre e publique os documentos financeiros por exercício."
      title="Financeiro"
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 border-b border-border sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>1. Documentos financeiros</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Cadastre o documento de cada tipo e exercício. O upload AWS
                  será integrado depois.
                </p>
              </div>
              <Button
                onClick={() => {
                  reset()
                  toast({ title: 'Novo documento iniciado', variant: 'info' })
                }}
                type="button"
                variant="outline"
              >
                <Plus size={16} /> Novo documento
              </Button>
            </CardHeader>
            <CardContent className="grid gap-5 pt-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="financial-exercise">Exercício</Label>
                  <NumericInput
                    id="financial-exercise"
                    kind="year"
                    onValueChange={(_, numericValue) =>
                      setForm((current) => ({
                        ...current,
                        exercise: numericValue || current.exercise,
                      }))
                    }
                    value={form.exercise}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="financial-type">Tipo de informação</Label>
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    id="financial-type"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        informationType: event.target.value as FinancialType,
                      }))
                    }
                    value={form.informationType}
                  >
                    {types.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="financial-period">Período</Label>
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    id="financial-period"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        period: event.target.value as FinancialPeriod,
                      }))
                    }
                    value={form.period}
                  >
                    {periods.map((period) => (
                      <option key={period} value={period}>
                        {period}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="financial-pdf">URL do PDF</Label>
                  <Input
                    id="financial-pdf"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        pdfUrl: event.target.value,
                      }))
                    }
                    placeholder="https://..."
                    type="url"
                    value={form.pdfUrl}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="financial-csv">URL do CSV</Label>
                  <Input
                    id="financial-csv"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        csvUrl: event.target.value,
                      }))
                    }
                    placeholder="https://..."
                    type="url"
                    value={form.csvUrl}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3 border-t border-border pt-5">
                <Button
                  disabled={
                    saving || (!form.pdfUrl.trim() && !form.csvUrl.trim())
                  }
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
                  onClick={() => setPending('publish')}
                  type="button"
                >
                  <Send size={16} /> Publicar exercício
                </Button>
                <Button
                  className="text-[#52617a]"
                  disabled={saving}
                  onClick={() => setPending('clear')}
                  type="button"
                  variant="outline"
                >
                  <RotateCcw size={16} /> Limpar formulário
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Exercícios cadastrados</CardTitle>
              <p className="text-sm text-muted-foreground">
                Selecione um exercício para escolher qual documento editar.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3">
              {financial.isPending ? (
                <p className="text-sm text-muted-foreground">
                  Carregando documentos…
                </p>
              ) : financial.isError ? (
                <p className="text-sm text-destructive" role="alert">
                  Não foi possível carregar os documentos financeiros.
                </p>
              ) : exercises.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum documento cadastrado.
                </p>
              ) : (
                exercises.map((exercise) => {
                  const exerciseRecords = recordsByExercise.get(exercise) ?? []
                  return (
                    <button
                      className="flex w-full items-center justify-between rounded-lg border border-border p-4 text-left transition-colors hover:border-[#223149] hover:bg-[#f7f9fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#223149]"
                      key={exercise}
                      onClick={() => setSelectedExercise(exercise)}
                      type="button"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-md bg-[#e2ecf8] text-[#223149]">
                          <CalendarDays size={19} />
                        </span>
                        <span>
                          <strong className="block text-base text-[#223149]">
                            Exercício {exercise}
                          </strong>
                          <span className="text-sm text-muted-foreground">
                            {exerciseRecords.length} documentos cadastrados
                          </span>
                        </span>
                      </span>
                      <span className="text-right text-xs text-muted-foreground">
                        Ver detalhes →
                      </span>
                    </button>
                  )
                })
              )}
            </CardContent>
          </Card>
        </section>
        <aside>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye size={18} /> Pré-visualização
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-lg border border-[#1e3a67] p-4">
                <FileText className="text-[#cc3366]" size={22} />
                <p className="mt-3 text-sm text-muted-foreground">
                  {types.find(([value]) => value === form.informationType)?.[1]}{' '}
                  — {form.period}
                </p>
                <a
                  className="mt-2 block text-sm font-semibold text-[#0284c7]"
                  href={form.pdfUrl || undefined}
                  rel="noreferrer"
                  target="_blank"
                >
                  Baixar PDF
                </a>
                {form.csvUrl ? (
                  <a
                    className="mt-1 block text-sm font-semibold text-[#0284c7]"
                    href={form.csvUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Baixar CSV
                  </a>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  Exercício {form.exercise}
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
      {selectedExercise !== null ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#223149]/45 p-4"
          role="dialog"
        >
          <div className="w-full max-w-xl rounded-xl border border-[#dfe4ea] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#52617a]">
                  Exercício {selectedExercise}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[#223149]">
                  Documentos cadastrados
                </h2>
              </div>
              <button
                aria-label="Fechar detalhes"
                className="flex size-9 items-center justify-center rounded-md border border-[#d1d9e4]"
                onClick={() => setSelectedExercise(null)}
                type="button"
              >
                <X size={17} />
              </button>
            </div>
            <div className="mt-6 grid gap-3">
              {selectedRecords.map((record) => (
                <div
                  className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
                  key={record.id}
                >
                  <div>
                    <strong className="text-[#223149]">
                      {
                        types.find(
                          ([value]) => value === record.informationType,
                        )?.[1]
                      }{' '}
                      — {record.period}
                    </strong>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {record.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      edit(record)
                      setSelectedExercise(null)
                    }}
                    type="button"
                    variant="outline"
                  >
                    <Pencil size={16} /> Editar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      <ConfirmationDialog
        confirmLabel={
          pending === 'publish' ? 'Publicar exercício' : 'Limpar formulário'
        }
        description={
          pending === 'publish'
            ? 'Todos os documentos deste exercício ficarão públicos.'
            : 'Os valores não salvos serão removidos.'
        }
        isLoading={saving}
        onCancel={() => setPending(null)}
        onConfirm={confirm}
        open={pending !== null}
        title={
          pending === 'publish' ? 'Publicar exercício?' : 'Limpar formulário?'
        }
      />
    </AdminShell>
  )
}
