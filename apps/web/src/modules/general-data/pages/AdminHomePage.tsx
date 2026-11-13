import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Building2,
  CircleDollarSign,
  DoorOpen,
  Eye,
  GraduationCap,
  Landmark,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Send,
  TrendingDown,
  TrendingUp,
  UsersRound,
} from 'lucide-react'

import type {
  CreateGeneralDataRequest,
  GeneralData,
} from '@oab-transparencia/contracts/transparency'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Label } from '@/components/ui/label'
import { NumericInput } from '@/components/ui/numeric-input'
import { useToast } from '@/components/ui/use-toast'
import {
  formatNumericInput,
  parseNumericInput,
  sanitizeNumericInput,
} from '@/lib/numeric-format'
import {
  useAdminGeneralData,
  usePublishGeneralData,
  useSaveGeneralData,
} from '@/modules/general-data/hooks/useGeneralData'
import { GeneralDataPreviewGrid } from '@/modules/general-data/components/GeneralDataPreviewGrid'
import { getStoredAuthSession } from '@/modules/auth/auth-session'
import { AdminShell } from '@/modules/auth/AdminShell'

const emptyForm: CreateGeneralDataRequest = {
  exercise: new Date().getFullYear(),
  totalExpenses: 0,
  totalRevenue: 0,
  budget: 0,
  patrimony: 0,
  activeLawyers: 0,
  activeSocieties: 0,
  supportRooms: 0,
  registeredMembers: 0,
}

const fields: Array<{
  key: Exclude<keyof CreateGeneralDataRequest, 'exercise'>
  label: string
  kind: 'amount' | 'integer'
}> = [
  { key: 'totalExpenses', label: 'Despesas totais', kind: 'amount' },
  { key: 'totalRevenue', label: 'Receitas totais', kind: 'amount' },
  { key: 'budget', label: 'Orçamento', kind: 'amount' },
  { key: 'patrimony', label: 'Patrimônio', kind: 'amount' },
  { key: 'activeLawyers', label: 'Advogados ativos', kind: 'integer' },
  {
    key: 'activeSocieties',
    label: 'Sociedades advocatícias ativas',
    kind: 'integer',
  },
  { key: 'supportRooms', label: 'Salas de apoio', kind: 'integer' },
  {
    key: 'registeredMembers',
    label: 'Quantidade de inscritos',
    kind: 'integer',
  },
]

type NumericFieldKey = (typeof fields)[number]['key']

function getNumericInputValues(
  source: CreateGeneralDataRequest,
): Record<NumericFieldKey, string> {
  return Object.fromEntries(
    fields.map((field) => [
      field.key,
      formatNumericInput(source[field.key], field.kind),
    ]),
  ) as Record<NumericFieldKey, string>
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })
}

export function AdminHomePage() {
  const session = getStoredAuthSession()
  const sessionToken = session?.token
  const [form, setForm] = useState<CreateGeneralDataRequest>(emptyForm)
  const [inputValues, setInputValues] = useState(() =>
    getNumericInputValues(emptyForm),
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pendingConfirmation, setPendingConfirmation] = useState<
    'clear' | 'publish' | null
  >(null)
  const { toast } = useToast()
  const recordsQuery = useAdminGeneralData(sessionToken)
  const saveMutation = useSaveGeneralData(sessionToken ?? '')
  const publishMutation = usePublishGeneralData(sessionToken ?? '')
  const records = recordsQuery.data ?? []
  const isSaving = saveMutation.isPending || publishMutation.isPending

  if (!session) return <Navigate replace to="/login" />

  const previewItems = [
    {
      label: 'Despesas totais',
      value: formatCurrency(form.totalExpenses),
      icon: TrendingDown,
    },
    {
      label: 'Receitas totais',
      value: formatCurrency(form.totalRevenue),
      icon: TrendingUp,
    },
    {
      label: 'Orçamento',
      value: formatCurrency(form.budget),
      icon: CircleDollarSign,
    },
    {
      label: 'Patrimônio',
      value: formatCurrency(form.patrimony),
      icon: Landmark,
    },
    {
      label: 'Advogados ativos',
      value: form.activeLawyers.toLocaleString('pt-BR'),
      icon: GraduationCap,
    },
    {
      label: 'Sociedades ativas',
      value: form.activeSocieties.toLocaleString('pt-BR'),
      icon: Building2,
    },
    {
      label: 'Salas de apoio',
      value: form.supportRooms.toLocaleString('pt-BR'),
      icon: DoorOpen,
    },
    {
      label: 'Inscritos',
      value: form.registeredMembers.toLocaleString('pt-BR'),
      icon: UsersRound,
    },
  ]

  function updateField(
    key: NumericFieldKey,
    value: string,
    kind: 'amount' | 'integer',
  ) {
    const formattedValue = formatNumericInput(value, kind)
    const numberValue = parseNumericInput(formattedValue, kind)
    setInputValues((current) => ({ ...current, [key]: formattedValue }))
    setForm((current) => ({
      ...current,
      [key]: numberValue,
    }))
  }

  function updateExercise(value: string) {
    const exercise = Number(sanitizeNumericInput(value, 'year'))
    setForm((current) => ({
      ...current,
      exercise: Number.isFinite(exercise) ? exercise : current.exercise,
    }))
  }

  function formatFieldOnBlur(key: NumericFieldKey, kind: 'amount' | 'integer') {
    setInputValues((current) => ({
      ...current,
      [key]: formatNumericInput(form[key], kind),
    }))
  }

  function startNew() {
    setEditingId(null)
    const newForm = { ...emptyForm, exercise: new Date().getFullYear() }
    setForm(newForm)
    setInputValues(getNumericInputValues(newForm))
    toast({
      title: 'Novo exercício iniciado',
      description: 'Preencha os indicadores e salve um novo rascunho.',
      variant: 'info',
    })
  }

  function clearForm() {
    const newForm = { ...emptyForm, exercise: new Date().getFullYear() }
    setEditingId(null)
    setForm(newForm)
    setInputValues(getNumericInputValues(newForm))
    toast({
      title: 'Formulário limpo',
      description: 'Os valores não salvos foram removidos.',
      variant: 'warning',
    })
  }

  function startEditing(record: GeneralData) {
    setEditingId(record.id)
    setForm({
      exercise: record.exercise,
      totalExpenses: record.totalExpenses,
      totalRevenue: record.totalRevenue,
      budget: record.budget,
      patrimony: record.patrimony,
      activeLawyers: record.activeLawyers,
      activeSocieties: record.activeSocieties,
      supportRooms: record.supportRooms,
      registeredMembers: record.registeredMembers,
    })
    setInputValues(
      getNumericInputValues({
        exercise: record.exercise,
        totalExpenses: record.totalExpenses,
        totalRevenue: record.totalRevenue,
        budget: record.budget,
        patrimony: record.patrimony,
        activeLawyers: record.activeLawyers,
        activeSocieties: record.activeSocieties,
        supportRooms: record.supportRooms,
        registeredMembers: record.registeredMembers,
      }),
    )
    toast({
      title: `Exercício ${record.exercise} carregado`,
      description: 'Você pode revisar os valores antes de salvar.',
      variant: 'info',
    })
  }

  async function saveDraft() {
    try {
      const saved = await saveMutation.mutateAsync({
        id: editingId ?? undefined,
        input: form,
      })
      setEditingId(saved.id)
      toast({
        title: 'Rascunho salvo',
        description: 'Revise a prévia antes de publicar os dados.',
        variant: 'success',
      })
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
    if (!editingId) {
      toast({
        title: 'Salve o rascunho antes de publicar',
        description:
          'A publicação só fica disponível depois do primeiro salvamento.',
        variant: 'warning',
      })
      return
    }
    try {
      await publishMutation.mutateAsync(editingId)
      toast({
        title: 'Dados gerais publicados',
        description: 'Os indicadores já estão disponíveis na área pública.',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Não foi possível publicar',
        description:
          error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'error',
      })
    }
  }

  function confirmPendingAction() {
    if (pendingConfirmation === 'clear') {
      clearForm()
      setPendingConfirmation(null)
      return
    }
    if (pendingConfirmation === 'publish') {
      void publish().finally(() => setPendingConfirmation(null))
    }
  }

  return (
    <AdminShell
      description="Preencha, confira e publique os indicadores da página inicial pública."
      title="Dados gerais"
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 border-b border-border sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>1. Dados gerais</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Preencha os indicadores que aparecem nos cards da página
                  inicial pública.
                </p>
              </div>
              <Button onClick={startNew} type="button" variant="outline">
                <Plus size={16} /> Novo exercício
              </Button>
            </CardHeader>
            <CardContent className="grid gap-5 pt-6">
              <div className="grid gap-2 sm:max-w-[180px]">
                <Label htmlFor="exercise">Exercício</Label>
                <NumericInput
                  kind="year"
                  id="exercise"
                  max={2100}
                  min={2000}
                  onValueChange={(_, numericValue) =>
                    updateExercise(String(numericValue))
                  }
                  value={form.exercise}
                />
              </div>
              <div className="grid items-start gap-x-5 gap-y-4 sm:grid-cols-2">
                {fields.map((field) => (
                  <div className="grid gap-2" key={field.key}>
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <NumericInput
                      kind={field.kind}
                      id={field.key}
                      min={0}
                      onValueChange={(formattedValue) =>
                        updateField(field.key, formattedValue, field.kind)
                      }
                      onBlur={() => formatFieldOnBlur(field.key, field.kind)}
                      value={inputValues[field.key]}
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 border-t border-border pt-5">
                <Button disabled={isSaving} onClick={saveDraft} type="button">
                  <Save size={16} />{' '}
                  {isSaving ? 'Salvando…' : 'Salvar rascunho'}
                </Button>
                <Button
                  className="bg-[#008236] hover:bg-[#006b2d]"
                  disabled={isSaving || !editingId}
                  onClick={() => setPendingConfirmation('publish')}
                  type="button"
                >
                  <Send size={16} /> Publicar dados
                </Button>
                <Button
                  className="text-[#52617a]"
                  disabled={isSaving}
                  onClick={() => setPendingConfirmation('clear')}
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
            </CardHeader>
            <CardContent className="grid gap-3">
              {recordsQuery.isPending ? (
                <p className="text-sm text-muted-foreground">
                  Carregando registros…
                </p>
              ) : null}
              {recordsQuery.isError ? (
                <p className="text-sm text-destructive" role="alert">
                  Não foi possível carregar os registros.
                </p>
              ) : null}
              {!recordsQuery.isPending && records.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum exercício cadastrado. Comece pelo formulário acima.
                </p>
              ) : null}
              {records.map((record) => (
                <div
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  key={record.id}
                >
                  <div>
                    <strong>Exercício {record.exercise}</strong>
                    <p className="text-sm text-muted-foreground">
                      {record.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                    </p>
                  </div>
                  <Button
                    onClick={() => startEditing(record)}
                    type="button"
                    variant="outline"
                  >
                    <Pencil size={16} /> Editar
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <aside>
          <Card className="sticky top-6 self-start">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye size={18} /> Pré-visualização
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                É assim que os cards serão exibidos no portal público.
              </p>
            </CardHeader>
            <CardContent>
              <GeneralDataPreviewGrid
                exercise={form.exercise}
                items={previewItems}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
      <ConfirmationDialog
        confirmLabel={
          pendingConfirmation === 'publish'
            ? 'Publicar dados'
            : 'Limpar formulário'
        }
        description={
          pendingConfirmation === 'publish'
            ? 'Confira a prévia abaixo. Depois da confirmação, estes valores ficarão disponíveis no portal público.'
            : 'Os valores preenchidos e ainda não salvos serão removidos. Essa ação não pode ser desfeita.'
        }
        isLoading={isSaving}
        onCancel={() => setPendingConfirmation(null)}
        onConfirm={confirmPendingAction}
        open={pendingConfirmation !== null}
        title={
          pendingConfirmation === 'publish'
            ? 'Publicar dados gerais?'
            : 'Limpar formulário?'
        }
      >
        {pendingConfirmation === 'publish' ? (
          <GeneralDataPreviewGrid
            exercise={form.exercise}
            items={previewItems}
            variant="dialog"
          />
        ) : null}
      </ConfirmationDialog>
    </AdminShell>
  )
}
