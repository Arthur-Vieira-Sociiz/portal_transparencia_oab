import { useMemo, useState } from 'react'
import { BarChart3, Eye, Pencil, Plus, Save, Send, Trash2 } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import type {
  CreateReportsIndicatorRequest,
  ReportsIndicator,
} from '@oab-transparencia/contracts/transparency'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { NumericInput } from '@/components/ui/numeric-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import {
  useAdminReports,
  useDeleteReportsIndicator,
  usePublishReports,
  useSaveReportsIndicator,
} from '../hooks/useReports'
import { AdminShell } from '@/modules/auth/AdminShell'
import { useAuthSession } from '@/modules/auth/useAuth'

const emptyForm = (): CreateReportsIndicatorRequest => ({
  exercise: new Date().getFullYear(),
  totalRevenue: 0,
  totalExpense: 0,
  exerciseResult: 0,
  plannedBudget: 0,
  executedBudget: 0,
  executionPercentage: 0,
  activeLawyers: 0,
  interns: 0,
  registeredSocieties: 0,
  appointments: 0,
  protocols: 0,
  certificates: 0,
  ombudsmanRequests: 0,
  activeContracts: 0,
  totalContractValue: 0,
  newBids: 0,
  closedContracts: 0,
  employees: 0,
})

const amountFields = [
  ['totalRevenue', 'Receita total'],
  ['totalExpense', 'Despesa total'],
  ['exerciseResult', 'Resultado do exercício'],
  ['plannedBudget', 'Orçamento previsto'],
  ['executedBudget', 'Orçamento executado'],
  ['totalContractValue', 'Valor total de contratos'],
] as const
const countFields = [
  ['activeLawyers', 'Advogados ativos'],
  ['interns', 'Estagiários'],
  ['registeredSocieties', 'Sociedades registradas'],
  ['appointments', 'Atendimentos'],
  ['protocols', 'Protocolos'],
  ['certificates', 'Certidões'],
  ['ombudsmanRequests', 'Ouvidoria'],
  ['activeContracts', 'Contratos ativos'],
  ['newBids', 'Novas licitações'],
  ['closedContracts', 'Contratos encerrados'],
  ['employees', 'Colaboradores'],
] as const
const emptyRecords: ReportsIndicator[] = []

export function AdminReportsIndicatorsPage() {
  const session = useAuthSession()
  const reports = useAdminReports(session?.token)
  const saveIndicator = useSaveReportsIndicator(session?.token)
  const publishReports = usePublishReports(session?.token)
  const removeIndicator = useDeleteReportsIndicator(session?.token)
  const records = reports.data ?? emptyRecords
  const [form, setForm] = useState<CreateReportsIndicatorRequest>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pending, setPending] = useState<'publish' | 'delete' | null>(null)
  const [target, setTarget] = useState<ReportsIndicator | null>(null)
  const { toast } = useToast()
  const exercises = useMemo(
    () =>
      [...new Set(records.map((item) => item.exercise))].sort((a, b) => b - a),
    [records],
  )
  if (!session) return <Navigate replace to="/login" />
  const saving =
    saveIndicator.isPending ||
    publishReports.isPending ||
    removeIndicator.isPending
  const startEdit = (record: ReportsIndicator) => {
    const {
      id: _id,
      status: _status,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      publishedAt: _publishedAt,
      ...data
    } = record
    setForm(data)
    setEditingId(record.id)
  }
  const save = async () => {
    try {
      const normalizedForm = {
        ...form,
        executionPercentage:
          form.plannedBudget > 0
            ? Math.min(100, (form.executedBudget / form.plannedBudget) * 100)
            : 0,
      }
      const result = await saveIndicator.mutateAsync({
        id: editingId ?? undefined,
        input: editingId
          ? { ...normalizedForm, status: 'DRAFT' }
          : normalizedForm,
      })
      setEditingId(result.id)
      toast({ title: 'Indicadores salvos como rascunho', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Não foi possível salvar',
        description:
          error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'error',
      })
    }
  }
  const publish = async () => {
    try {
      await publishReports.mutateAsync(form.exercise)
      toast({ title: 'Indicadores publicados', variant: 'success' })
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
  const remove = async () => {
    if (!target) return
    try {
      await removeIndicator.mutateAsync(target.id)
      if (editingId === target.id) {
        setEditingId(null)
        setForm(emptyForm())
      }
      toast({ title: 'Cadastro excluído', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Não foi possível excluir',
        description:
          error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'error',
      })
    } finally {
      setPending(null)
      setTarget(null)
    }
  }
  const field = (
    key: keyof CreateReportsIndicatorRequest,
    label: string,
    amount = false,
  ) => (
    <div className="grid gap-1" key={key}>
      <Label>{label}</Label>
      <NumericInput
        kind={amount ? 'amount' : 'integer'}
        min={0}
        onValueChange={(_formattedValue, numericValue) =>
          setForm((current) => ({ ...current, [key]: numericValue }))
        }
        value={form[key]}
      />
      {amount ? (
        <span className="text-xs text-muted-foreground">Valor em reais</span>
      ) : null}
    </div>
  )
  return (
    <AdminShell
      description="Preencha, confira e publique os indicadores dos relatórios públicos."
      title="Relatórios e indicadores"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={21} /> Indicadores do exercício
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Cadastre os números que alimentam os gráficos e cards da
                  página pública.
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditingId(null)
                  setForm(emptyForm())
                }}
                variant="outline"
              >
                <Plus size={16} /> Novo exercício
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="max-w-xs grid gap-1">
              <Label>Exercício</Label>
              <Input
                inputMode="numeric"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    exercise:
                      Number(event.target.value.replace(/\D/g, '')) || 0,
                  }))
                }
                value={form.exercise}
              />
            </div>
            <section>
              <h3 className="mb-3 font-semibold text-[#223149]">
                Financeiro e orçamento
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {amountFields.map(([key, label]) => field(key, label, true))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Execução calculada automaticamente:{' '}
                {form.plannedBudget > 0
                  ? ((form.executedBudget / form.plannedBudget) * 100).toFixed(
                      1,
                    )
                  : '0,0'}
                %.
              </p>
            </section>
            <section>
              <h3 className="mb-3 font-semibold text-[#223149]">
                Indicadores administrativos
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {countFields.map(([key, label]) => field(key, label))}
              </div>
            </section>
            <div className="flex flex-wrap gap-3 border-t border-border pt-5">
              <Button disabled={saving} onClick={() => void save()}>
                <Save size={16} /> Salvar rascunho
              </Button>
              <Button
                className="bg-emerald-700 hover:bg-emerald-800"
                disabled={saving}
                onClick={() => setPending('publish')}
              >
                <Send size={16} /> Publicar exercício
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye size={19} /> Pré-visualização
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {amountFields.slice(0, 3).map(([key, label]) => (
              <div className="rounded-lg border p-3" key={key}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <strong className="text-lg text-[#223149]">
                  {Number(form[key]).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </strong>
                <p className="text-xs text-muted-foreground">
                  Exercício {form.exercise}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6 min-w-0 max-w-full overflow-hidden xl:max-w-[calc(100%_-_21.5rem)]">
        <CardHeader>
          <CardTitle>Exercícios cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {reports.isPending ? (
            <p className="text-sm text-muted-foreground">
              Carregando indicadores…
            </p>
          ) : reports.isError ? (
            <p className="text-sm text-destructive" role="alert">
              Não foi possível carregar os indicadores.
            </p>
          ) : exercises.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum exercício cadastrado.
            </p>
          ) : (
            exercises.map((exercise) => {
              const record = records.find((item) => item.exercise === exercise)!
              return (
                <div
                  className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 p-4"
                  key={record.id}
                >
                  <div className="min-w-0">
                    <strong>Exercício {exercise}</strong>
                    <p className="text-sm text-muted-foreground">
                      {record.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                    </p>
                  </div>
                  <div className="flex max-w-full flex-wrap gap-2">
                    <Button onClick={() => startEdit(record)} variant="outline">
                      <Pencil size={15} /> Editar
                    </Button>
                    <Button
                      className="text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setTarget(record)
                        setPending('delete')
                      }}
                      variant="outline"
                    >
                      <Trash2 size={15} /> Excluir
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
      <ConfirmationDialog
        confirmLabel={
          pending === 'publish' ? 'Publicar exercício' : 'Excluir cadastro'
        }
        description={
          pending === 'publish'
            ? 'Os indicadores deste exercício ficarão públicos.'
            : 'O cadastro deste exercício será removido.'
        }
        isLoading={saving}
        onCancel={() => {
          setPending(null)
          setTarget(null)
        }}
        onConfirm={() =>
          pending === 'publish' ? void publish() : void remove()
        }
        open={pending !== null}
        title={
          pending === 'publish' ? 'Publicar exercício?' : 'Excluir cadastro?'
        }
      />
    </AdminShell>
  )
}
