import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
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
  AdminHumanResourcesRecord,
  CreateHumanResourcesRequest,
} from '@oab-transparencia/contracts/transparency'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumericInput } from '@/components/ui/numeric-input'
import { useToast } from '@/components/ui/use-toast'
import {
  createHumanResources,
  deleteHumanResources,
  listHumanResources,
  publishHumanResourcesExercise,
  updateHumanResources,
} from '../../lib/api'
import { humanResourcesMonths } from '../public/data/human-resources.fixture'
import { getStoredAuthSession } from './auth-session'
import { AdminShell } from './AdminShell'

type Form = CreateHumanResourcesRequest
const emptyMonths = () =>
  humanResourcesMonths.map(({ id }) => ({ month: id, pdfUrl: '', xlsxUrl: '' }))
const emptyForm = (): Form => ({
  exercise: new Date().getFullYear(),
  locality: '',
  months: emptyMonths(),
})

export function AdminHumanResourcesPage() {
  const session = getStoredAuthSession()
  const [records, setRecords] = useState<AdminHumanResourcesRecord[]>([])
  const [form, setForm] = useState<Form>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<AdminHumanResourcesRecord | null>(
    null,
  )
  const [clearingMonth, setClearingMonth] = useState<{
    record: AdminHumanResourcesRecord
    monthIndex: number
  } | null>(null)
  const [pending, setPending] = useState<'clear' | 'publish' | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeMonthIndex, setActiveMonthIndex] = useState(0)
  const { toast } = useToast()
  useEffect(() => {
    if (!session?.token) return
    listHumanResources(session.token)
      .then(setRecords)
      .catch((error: unknown) =>
        toast({
          title: 'Não foi possível carregar recursos humanos',
          description:
            error instanceof Error ? error.message : 'Tente novamente.',
          variant: 'error',
        }),
      )
  }, [session?.token, toast])
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
  const token = session.token

  function reset() {
    setForm({ ...emptyForm(), exercise: form.exercise })
    setEditingId(null)
    setActiveMonthIndex(0)
  }
  function edit(record: AdminHumanResourcesRecord, monthIndex?: number) {
    setEditingId(record.id)
    setForm({
      exercise: record.exercise,
      locality: record.locality,
      months: record.months.map((month) => ({
        month: month.month,
        pdfUrl: month.documents.find((doc) => doc.format === 'pdf')?.url ?? '',
        xlsxUrl:
          month.documents.find((doc) => doc.format === 'xlsx')?.url ?? '',
      })),
    })
    setActiveMonthIndex(
      monthIndex ??
        Math.max(
          0,
          record.months.findIndex((month) => month.documents.length > 0),
        ),
    )
  }
  function setMonth(index: number, key: 'pdfUrl' | 'xlsxUrl', value: string) {
    setForm((current) => ({
      ...current,
      months: current.months.map((month, itemIndex) =>
        itemIndex === index ? { ...month, [key]: value } : month,
      ),
    }))
  }
  async function save() {
    if (
      !form.locality.trim() ||
      !form.months.some((month) => month.pdfUrl || month.xlsxUrl)
    ) {
      toast({
        title: 'Preencha os dados obrigatórios',
        description: 'Informe a localidade e pelo menos um arquivo.',
        variant: 'warning',
      })
      return
    }
    setSaving(true)
    try {
      const result = editingId
        ? await updateHumanResources(token, editingId, {
            ...form,
            status: 'DRAFT',
          })
        : await createHumanResources(token, form)
      setRecords((current) => [
        ...current.filter((item) => item.id !== result.id),
        result,
      ])
      setEditingId(result.id)
      toast({ title: 'Recursos humanos salvos', variant: 'success' })
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
      const published = await publishHumanResourcesExercise(
        token,
        form.exercise,
      )
      setRecords((current) => [
        ...current.filter((item) => item.exercise !== form.exercise),
        ...published,
      ])
      toast({ title: 'Recursos humanos publicados', variant: 'success' })
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
  async function remove() {
    if (!deleting) return
    setSaving(true)
    try {
      await deleteHumanResources(token, deleting.id)
      setRecords((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
      toast({ title: 'Cadastro excluído', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Não foi possível excluir',
        description:
          error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'error',
      })
    } finally {
      setSaving(false)
    }
  }
  async function clearMonth() {
    if (!clearingMonth) return
    setSaving(true)
    try {
      const { record, monthIndex } = clearingMonth
      const input = {
        exercise: record.exercise,
        locality: record.locality,
        months: record.months.map((month, index) => ({
          month: month.month,
          pdfUrl:
            index === monthIndex
              ? ''
              : (month.documents.find((doc) => doc.format === 'pdf')?.url ??
                ''),
          xlsxUrl:
            index === monthIndex
              ? ''
              : (month.documents.find((doc) => doc.format === 'xlsx')?.url ??
                ''),
        })),
      }
      const updated = await updateHumanResources(token, record.id, input)
      setRecords((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      if (editingId === record.id) {
        setForm({
          exercise: updated.exercise,
          locality: updated.locality,
          months: updated.months.map((month) => ({
            month: month.month,
            pdfUrl:
              month.documents.find((doc) => doc.format === 'pdf')?.url ?? '',
            xlsxUrl:
              month.documents.find((doc) => doc.format === 'xlsx')?.url ?? '',
          })),
        })
      }
      setClearingMonth(null)
      toast({ title: 'Arquivos do mês removidos', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Não foi possível limpar o mês',
        description:
          error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminShell
      description="Cadastre e publique os documentos de recursos humanos."
      title="Recursos humanos"
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 border-b border-border sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>1. Documentos de recursos humanos</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Cadastre os arquivos mensais por exercício e localidade.
                </p>
              </div>
              <Button onClick={reset} type="button" variant="outline">
                <Plus size={16} /> Novo cadastro
              </Button>
            </CardHeader>
            <CardContent className="grid gap-5 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Exercício</Label>
                  <NumericInput
                    kind="year"
                    onValueChange={(_, value) =>
                      setForm((current) => ({
                        ...current,
                        exercise: value || current.exercise,
                      }))
                    }
                    value={form.exercise}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hr-locality">Localidade</Label>
                  <Input
                    id="hr-locality"
                    onChange={(event) => {
                      const nextLocality = event.target.value
                      const changedExistingLocality =
                        editingId !== null &&
                        nextLocality.trim().toLocaleLowerCase('pt-BR') !==
                          form.locality.trim().toLocaleLowerCase('pt-BR')

                      if (changedExistingLocality) {
                        setEditingId(null)
                        setActiveMonthIndex(0)
                        setForm({
                          ...form,
                          locality: nextLocality,
                          months: emptyMonths(),
                        })
                        toast({
                          title: 'Novo cadastro iniciado',
                          description:
                            'Os arquivos mensais foram limpos para a nova localidade.',
                          variant: 'info',
                        })
                        return
                      }

                      setForm((current) => ({
                        ...current,
                        locality: nextLocality,
                      }))
                    }}
                    placeholder="Ex.: JACARECICA"
                    value={form.locality}
                  />
                </div>
              </div>
              <div className="grid gap-3">
                <div>
                  <Label htmlFor="hr-month">Arquivos mensais</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Selecione um mês por vez e informe os links disponíveis.
                  </p>
                </div>
                <div className="grid gap-4 rounded-lg border border-[#dfe4ea] bg-[#f8fafc] p-4">
                  <div className="grid gap-2 sm:grid-cols-[220px_1fr] sm:items-end">
                    <div className="grid gap-2">
                      <Label htmlFor="hr-month">Mês</Label>
                      <select
                        className="h-10 rounded-md border border-input bg-white px-3 text-sm"
                        id="hr-month"
                        onChange={(event) =>
                          setActiveMonthIndex(Number(event.target.value))
                        }
                        value={activeMonthIndex}
                      >
                        {humanResourcesMonths.map((month, index) => {
                          const current = form.months[index]
                          const filled = Boolean(
                            current?.pdfUrl || current?.xlsxUrl,
                          )
                          return (
                            <option key={month.id} value={index}>
                              {month.label} {filled ? '• preenchido' : ''}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                    <p className="text-xs text-muted-foreground sm:pb-2">
                      {form.months[activeMonthIndex]?.pdfUrl ||
                      form.months[activeMonthIndex]?.xlsxUrl
                        ? 'Este mês já possui arquivo cadastrado.'
                        : 'Nenhum arquivo cadastrado para este mês.'}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-1">
                      <Label className="text-xs">URL PDF</Label>
                      <Input
                        onChange={(event) =>
                          setMonth(
                            activeMonthIndex,
                            'pdfUrl',
                            event.target.value,
                          )
                        }
                        placeholder="https://..."
                        type="url"
                        value={form.months[activeMonthIndex]?.pdfUrl ?? ''}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">URL XLSX</Label>
                      <Input
                        onChange={(event) =>
                          setMonth(
                            activeMonthIndex,
                            'xlsxUrl',
                            event.target.value,
                          )
                        }
                        placeholder="https://..."
                        type="url"
                        value={form.months[activeMonthIndex]?.xlsxUrl ?? ''}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.months.map((month, index) => {
                    const filled = Boolean(month.pdfUrl || month.xlsxUrl)
                    return (
                      <button
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${index === activeMonthIndex ? 'border-[#223149] bg-[#223149] text-white' : filled ? 'border-[#b8dcc4] bg-[#e5f6ec] text-[#137333]' : 'border-[#dfe4ea] bg-white text-[#52617a] hover:border-[#9aabbe]'}`}
                        key={month.month}
                        onClick={() => setActiveMonthIndex(index)}
                        type="button"
                      >
                        {humanResourcesMonths[index]?.label ?? month.month}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 border-t border-border pt-5">
                <Button
                  disabled={saving}
                  onClick={() => void save()}
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
                Selecione um exercício para editar ou excluir uma localidade.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3">
              {exercises.length ? (
                exercises.map((exercise) => (
                  <button
                    className="flex w-full items-center justify-between rounded-lg border border-border p-4 text-left hover:bg-[#f7f9fc]"
                    key={exercise}
                    onClick={() => setSelectedExercise(exercise)}
                    type="button"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-md bg-[#e2ecf8] text-[#223149]">
                        <CalendarDays size={19} />
                      </span>
                      <span>
                        <strong className="block">Exercício {exercise}</strong>
                        <span className="text-sm text-muted-foreground">
                          {
                            records.filter(
                              (record) => record.exercise === exercise,
                            ).length
                          }{' '}
                          cadastro(s)
                        </span>
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-[#52617a]">
                      Ver detalhes →
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum cadastro realizado.
                </p>
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
            <CardContent>
              <div className="rounded-lg border border-[#1e3a67] p-4">
                <FileText className="text-[#cc3366]" size={22} />
                <p className="mt-3 font-semibold text-[#223149]">
                  {form.locality || 'Localidade'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Exercício {form.exercise}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {form.months.reduce(
                    (total, month) =>
                      total +
                      Number(Boolean(month.pdfUrl)) +
                      Number(Boolean(month.xlsxUrl)),
                    0,
                  )}{' '}
                  arquivo(s) em{' '}
                  {
                    form.months.filter((month) => month.pdfUrl || month.xlsxUrl)
                      .length
                  }{' '}
                  mês(es)
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
      {selectedExercise !== null && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#223149]/45 p-4"
          role="dialog"
        >
          <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#dfe4ea] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#52617a]">
                  Exercício {selectedExercise}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[#223149]">
                  Cadastros de recursos humanos
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
            <div
              className={`mt-6 grid gap-3 ${selectedRecords.length >= 3 ? 'max-h-[55dvh] overflow-y-auto pr-2' : ''}`}
            >
              {selectedRecords.map((record) => (
                <div
                  className="rounded-lg border border-border p-4"
                  key={record.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <strong className="text-[#223149]">
                        {record.locality}
                      </strong>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {
                          record.months.filter(
                            (month) => month.documents.length,
                          ).length
                        }{' '}
                        meses com documentos ·{' '}
                        {record.status === 'PUBLISHED'
                          ? 'Publicado'
                          : 'Rascunho'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          edit(record)
                          setSelectedExercise(null)
                        }}
                        type="button"
                        variant="outline"
                      >
                        <Pencil size={15} /> Editar
                      </Button>
                      <Button
                        className="text-red-700 hover:bg-red-50"
                        onClick={() => setDeleting(record)}
                        type="button"
                        variant="outline"
                      >
                        <Trash2 size={15} /> Excluir
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Selecione um mês para abrir o cadastro diretamente nele.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {record.months.map((month, index) => {
                        const filled = month.documents.length > 0
                        const isDraft = filled && record.status === 'DRAFT'
                        const label =
                          humanResourcesMonths.find(
                            (item) => item.id === month.month,
                          )?.label ?? month.month
                        return (
                          <div
                            className="flex items-center gap-1"
                            key={month.month}
                          >
                            <button
                              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${isDraft ? 'border-[#e8c77a] bg-[#fff6d8] text-[#8a5a00] hover:border-[#d8aa43]' : filled ? 'border-[#b8dcc4] bg-[#e5f6ec] text-[#137333] hover:border-[#83bf96]' : 'border-[#dfe4ea] bg-white text-[#52617a] hover:border-[#9aabbe]'}`}
                              onClick={() => {
                                edit(record, index)
                                setSelectedExercise(null)
                              }}
                              title={
                                isDraft
                                  ? 'Mês com arquivos em rascunho; ainda não publicado'
                                  : filled
                                    ? 'Mês publicado'
                                    : 'Mês sem arquivos'
                              }
                              type="button"
                            >
                              {label}{' '}
                              {isDraft
                                ? '• rascunho'
                                : filled
                                  ? '• publicado'
                                  : '• vazio'}
                            </button>
                            {filled && (
                              <button
                                aria-label={`Limpar arquivos de ${label}`}
                                className="flex size-7 items-center justify-center rounded-full border border-[#f0c3c3] text-[#b42318] transition-colors hover:bg-[#fff1f1]"
                                onClick={() =>
                                  setClearingMonth({
                                    record,
                                    monthIndex: index,
                                  })
                                }
                                title={`Limpar arquivos de ${label}`}
                                type="button"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <ConfirmationDialog
        confirmLabel={
          pending === 'publish' ? 'Publicar exercício' : 'Limpar formulário'
        }
        description={
          pending === 'publish'
            ? 'Todos os cadastros deste exercício ficarão públicos.'
            : 'Os valores não salvos serão removidos.'
        }
        isLoading={saving}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending === 'publish') void publish()
          else {
            reset()
            setPending(null)
            toast({ title: 'Formulário limpo', variant: 'warning' })
          }
        }}
        open={pending !== null}
        title={
          pending === 'publish' ? 'Publicar exercício?' : 'Limpar formulário?'
        }
      />
      <ConfirmationDialog
        confirmLabel="Excluir cadastro"
        description="O cadastro de recursos humanos será removido."
        isLoading={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void remove()}
        open={deleting !== null}
        title="Excluir cadastro?"
      />
      <ConfirmationDialog
        confirmLabel="Limpar arquivos"
        description={`Os arquivos de ${
          clearingMonth
            ? (humanResourcesMonths
                .find(
                  (month) =>
                    month.id ===
                    clearingMonth.record.months[clearingMonth.monthIndex]
                      ?.month,
                )
                ?.label.toLowerCase() ?? 'este mês')
            : 'este mês'
        } serão removidos. O mês continuará disponível para novo cadastro.`}
        isLoading={saving}
        onCancel={() => setClearingMonth(null)}
        onConfirm={() => void clearMonth()}
        open={clearingMonth !== null}
        title="Limpar arquivos do mês?"
      />
    </AdminShell>
  )
}
