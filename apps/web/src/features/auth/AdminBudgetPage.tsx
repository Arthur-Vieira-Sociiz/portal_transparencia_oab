import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  CalendarDays,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Send,
  X,
} from 'lucide-react'

import type {
  AdminBudgetRecord,
  CreateBudgetRecordRequest,
} from '@oab-transparencia/contracts/transparency'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumericInput } from '@/components/ui/numeric-input'
import { useToast } from '@/components/ui/use-toast'
import { formatNumericInput, parseNumericInput } from '@/lib/numeric-format'
import {
  createBudgetRecord,
  listBudgetRecords,
  publishBudgetExercise,
  updateBudgetRecord,
} from '../../lib/api'
import { getStoredAuthSession } from './auth-session'
import { AdminShell } from './AdminShell'

const types = [
  ['budget-proposal', 'Proposta orçamentária'],
  ['budget', 'Orçamento'],
  ['financial', 'Financeiro'],
  ['financial-statement', 'Balanço financeiro'],
  ['patrimonial-statement', 'Balanço patrimonial'],
  ['trial-balance', 'Balancetes'],
] as const
type BudgetType = (typeof types)[number][0]
type Form = CreateBudgetRecordRequest
const emptyForm: Form = {
  informationType: 'budget',
  annualBudget: 0,
  plannedAmount: 0,
  executedAmount: 0,
  exercise: new Date().getFullYear(),
}
const displayMoney = (value: number) =>
  value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export function AdminBudgetPage() {
  const session = getStoredAuthSession()
  const [records, setRecords] = useState<AdminBudgetRecord[]>([])
  const [form, setForm] = useState<Form>(emptyForm)
  const [values, setValues] = useState({
    annualBudget: '0,00',
    plannedAmount: '0,00',
    executedAmount: '0,00',
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pending, setPending] = useState<'clear' | 'publish' | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!session?.token) return
    listBudgetRecords(session.token)
      .then(setRecords)
      .catch((error: unknown) =>
        toast({
          title: 'Não foi possível carregar o orçamento',
          description:
            error instanceof Error ? error.message : 'Tente novamente.',
          variant: 'error',
        }),
      )
      .finally(() => undefined)
  }, [session?.token, toast])
  if (!session) return <Navigate replace to="/login" />
  const authenticatedSession = session
  const currentRecords = records.filter(
    (record) => record.exercise === form.exercise,
  )
  const recordsByExercise = records.reduce((groups, record) => {
    const current = groups.get(record.exercise) ?? []
    groups.set(record.exercise, [...current, record])
    return groups
  }, new Map<number, AdminBudgetRecord[]>())
  const exercises = [...recordsByExercise.keys()].sort((a, b) => b - a)
  const selectedRecords =
    selectedExercise === null
      ? []
      : (recordsByExercise.get(selectedExercise) ?? [])
  const percent = form.plannedAmount
    ? Math.min(100, (form.executedAmount / form.plannedAmount) * 100)
    : 0

  function setMoney(
    key: 'annualBudget' | 'plannedAmount' | 'executedAmount',
    raw: string,
  ) {
    const formatted = formatNumericInput(raw, 'amount')
    setValues((current) => ({ ...current, [key]: formatted }))
    setForm((current) => ({
      ...current,
      [key]: parseNumericInput(formatted, 'amount'),
    }))
  }
  function reset() {
    setForm({ ...emptyForm, exercise: form.exercise })
    setValues({
      annualBudget: '0,00',
      plannedAmount: '0,00',
      executedAmount: '0,00',
    })
    setEditingId(null)
  }
  function edit(record: AdminBudgetRecord) {
    setEditingId(record.id)
    setForm({
      informationType: record.informationType,
      annualBudget: record.annualBudget,
      plannedAmount: record.plannedAmount,
      executedAmount: record.executedAmount,
      exercise: record.exercise,
      documentTitle: record.document?.title,
      documentUrl: record.document?.url,
    })
    setValues({
      annualBudget: displayMoney(record.annualBudget),
      plannedAmount: displayMoney(record.plannedAmount),
      executedAmount: displayMoney(record.executedAmount),
    })
  }
  async function save() {
    const duplicate = records.some(
      (record) =>
        record.id !== editingId &&
        record.exercise === form.exercise &&
        record.informationType === form.informationType,
    )
    if (duplicate) {
      const typeLabel =
        types.find(([value]) => value === form.informationType)?.[1] ??
        form.informationType
      toast({
        title: 'Registro duplicado',
        description: `Já existe um cadastro de ${typeLabel} para o exercício ${form.exercise}. Escolha outro tipo ou exercício.`,
        variant: 'warning',
      })
      return
    }
    setSaving(true)
    try {
      const record = editingId
        ? await updateBudgetRecord(authenticatedSession.token, editingId, form)
        : await createBudgetRecord(authenticatedSession.token, form)
      setRecords((current) => [
        ...current.filter((item) => item.id !== record.id),
        record,
      ])
      setEditingId(record.id)
      toast({
        title: 'Rascunho salvo',
        description: 'Confira os valores antes de publicar.',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Não foi possível salvar',
        description:
          error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'error',
      })
    } finally {
      setSaving(false)
    }
  }
  async function publish() {
    setSaving(true)
    try {
      const published = await publishBudgetExercise(
        authenticatedSession.token,
        form.exercise,
      )
      setRecords((current) => [
        ...current.filter((item) => item.exercise !== form.exercise),
        ...published,
      ])
      toast({
        title: 'Orçamentário publicado',
        description: 'Os dados já estão disponíveis no portal público.',
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
      setSaving(false)
      setPending(null)
    }
  }
  function confirm() {
    if (pending === 'clear') {
      reset()
      setPending(null)
      toast({
        title: 'Formulário limpo',
        description: 'Os valores não salvos foram removidos.',
        variant: 'warning',
      })
    } else void publish()
  }

  return (
    <AdminShell
      description="Cadastre e publique as informações orçamentárias por exercício."
      title="Orçamentário"
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 border-b border-border sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>1. Informações orçamentárias</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Preencha os valores e, quando disponível, o link do documento
                  oficial.
                </p>
              </div>
              <Button
                onClick={() => {
                  reset()
                  toast({ title: 'Novo registro iniciado', variant: 'info' })
                }}
                type="button"
                variant="outline"
              >
                <Plus size={16} /> Novo registro
              </Button>
            </CardHeader>
            <CardContent className="grid gap-5 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="budget-exercise-admin">Exercício</Label>
                  <NumericInput
                    kind="year"
                    id="budget-exercise-admin"
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
                  <Label htmlFor="budget-type-admin">Tipo de informação</Label>
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    id="budget-type-admin"
                    onChange={(e) =>
                      setForm((c) => ({
                        ...c,
                        informationType: e.target.value as BudgetType,
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
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {(
                  ['annualBudget', 'plannedAmount', 'executedAmount'] as const
                ).map((key) => (
                  <div className="grid gap-2" key={key}>
                    <Label htmlFor={key}>
                      {key === 'annualBudget'
                        ? 'Orçamento anual'
                        : key === 'plannedAmount'
                          ? 'Valor previsto'
                          : 'Valor executado'}
                    </Label>
                    <NumericInput
                      kind="amount"
                      id={key}
                      onValueChange={(formattedValue) =>
                        setMoney(key, formattedValue)
                      }
                      value={values[key]}
                    />
                  </div>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="budget-document-title">
                    Título do documento (opcional)
                  </Label>
                  <Input
                    id="budget-document-title"
                    onChange={(e) =>
                      setForm((c) => ({ ...c, documentTitle: e.target.value }))
                    }
                    value={form.documentTitle ?? ''}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="budget-document-url">
                    URL do documento (opcional)
                  </Label>
                  <Input
                    id="budget-document-url"
                    onChange={(e) =>
                      setForm((c) => ({ ...c, documentUrl: e.target.value }))
                    }
                    type="url"
                    value={form.documentUrl ?? ''}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3 border-t border-border pt-5">
                <Button disabled={saving} onClick={save} type="button">
                  <Save size={16} /> {saving ? 'Salvando…' : 'Salvar rascunho'}
                </Button>
                <Button
                  className="bg-[#008236] hover:bg-[#006b2d]"
                  disabled={saving || currentRecords.length === 0}
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
              <CardTitle>Registros cadastrados</CardTitle>
              <p className="text-sm text-muted-foreground">
                Selecione um exercício para ver os tipos de informação
                cadastrados.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3">
              {records.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum registro cadastrado.
                </p>
              ) : (
                exercises.map((exercise) => {
                  const exerciseRecords = recordsByExercise.get(exercise) ?? []
                  const publishedCount = exerciseRecords.filter(
                    (record) => record.status === 'PUBLISHED',
                  ).length
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
                            {exerciseRecords.length}{' '}
                            {exerciseRecords.length === 1
                              ? 'tipo cadastrado'
                              : 'tipos cadastrados'}
                          </span>
                        </span>
                      </span>
                      <span className="text-right text-xs text-muted-foreground">
                        <span className="block font-semibold text-[#223149]">
                          {publishedCount}/{exerciseRecords.length} publicados
                        </span>
                        <span className="mt-1 block">Ver detalhes →</span>
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
                <p className="text-sm text-muted-foreground">% de execução</p>
                <strong className="mt-2 block text-2xl text-primary">
                  {percent.toLocaleString('pt-BR', {
                    maximumFractionDigits: 1,
                  })}
                  %
                </strong>
                <p className="mt-1 text-xs text-muted-foreground">
                  Exercício {form.exercise}
                </p>
              </div>
              <div className="grid gap-2 text-sm">
                <p>
                  Orçamento anual{' '}
                  <strong>R$ {displayMoney(form.annualBudget)}</strong>
                </p>
                <p>
                  Valor previsto{' '}
                  <strong>R$ {displayMoney(form.plannedAmount)}</strong>
                </p>
                <p>
                  Valor executado{' '}
                  <strong>R$ {displayMoney(form.executedAmount)}</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
      {selectedExercise !== null ? (
        <div
          aria-label={`Informações cadastradas no exercício ${selectedExercise}`}
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#223149]/45 p-4"
          role="dialog"
        >
          <div className="w-full max-w-xl rounded-xl border border-[#dfe4ea] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#52617a]">
                  Exercício {selectedExercise}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[#223149]">
                  Tipos de informação cadastrados
                </h2>
              </div>
              <button
                aria-label="Fechar detalhes do exercício"
                className="flex size-9 items-center justify-center rounded-md border border-[#d1d9e4] text-[#52617a] transition-colors hover:bg-[#f4f6f9] hover:text-[#223149] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#223149]"
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
                      {types.find(
                        ([value]) => value === record.informationType,
                      )?.[1] ?? record.informationType}
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
            ? 'Confira a prévia. Todos os registros deste exercício ficarão públicos.'
            : 'Os valores ainda não salvos serão removidos.'
        }
        isLoading={saving}
        onCancel={() => setPending(null)}
        onConfirm={confirm}
        open={pending !== null}
        title={
          pending === 'publish' ? 'Publicar exercício?' : 'Limpar formulário?'
        }
      >
        {pending === 'publish' ? (
          <div className="rounded-lg border border-border bg-[#f7f9fc] p-4 text-sm">
            <p>
              Exercício: <strong>{form.exercise}</strong>
            </p>
            <p>
              Execução:{' '}
              <strong>
                {percent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%
              </strong>
            </p>
            <p>
              Registros no exercício: <strong>{currentRecords.length}</strong>
            </p>
          </div>
        ) : null}
      </ConfirmationDialog>
    </AdminShell>
  )
}
