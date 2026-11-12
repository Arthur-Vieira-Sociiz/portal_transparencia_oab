import { useEffect, useMemo, useState } from 'react'
import {
  Eye,
  FileText,
  Pencil,
  Plus,
  Save,
  Send,
  RotateCcw,
  X,
} from 'lucide-react'
import { Navigate } from 'react-router-dom'

import type {
  AdminPatrimonialAsset,
  CreatePatrimonialAssetRequest,
} from '@oab-transparencia/contracts/transparency'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumericInput } from '@/components/ui/numeric-input'
import { useToast } from '@/components/ui/use-toast'
import {
  createPatrimonialAsset,
  listPatrimonialAssets,
  publishPatrimonialExercise,
  updatePatrimonialAsset,
} from '../../lib/api'
import { getStoredAuthSession } from './auth-session'
import { AdminShell } from './AdminShell'

const informationTypes = [
  'Imóvel',
  'Mobiliário',
  'Equipamentos de informática',
] as const
const assetStatuses = ['Ativo', 'Locado', 'Emprestado'] as const

function assetStatusClass(status: string) {
  if (status === 'Locado') return 'bg-[#dbeafe] text-[#1e40af]'
  if (status === 'Emprestado') return 'bg-[#fef3c7] text-[#854d0e]'
  return 'bg-[#dcfce7] text-[#166534]'
}

const emptyForm: CreatePatrimonialAssetRequest = {
  informationType: 'Imóvel',
  description: '',
  location: '',
  acquisitionValue: 0,
  status: 'Ativo',
  exercise: new Date().getFullYear(),
  documentTitle: '',
  documentUrl: '',
}

export function AdminPatrimonialPage() {
  const session = getStoredAuthSession()
  const [records, setRecords] = useState<AdminPatrimonialAsset[]>([])
  const [form, setForm] = useState<CreatePatrimonialAssetRequest>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  useEffect(() => {
    if (!session?.token) return
    listPatrimonialAssets(session.token)
      .then(setRecords)
      .catch(() =>
        toast({
          title: 'Não foi possível carregar o patrimônio',
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
  const recordsByExercise = useMemo(
    () =>
      records.reduce((groups, record) => {
        const current = groups.get(record.exercise) ?? []
        groups.set(record.exercise, [...current, record])
        return groups
      }, new Map<number, AdminPatrimonialAsset[]>()),
    [records],
  )
  const selectedRecords =
    selectedExercise === null
      ? []
      : (recordsByExercise.get(selectedExercise) ?? [])
  if (!session) return <Navigate replace to="/login" />
  const authenticatedSession = session

  function reset() {
    setForm({ ...emptyForm, exercise: form.exercise })
    setEditingId(null)
  }
  function edit(record: AdminPatrimonialAsset) {
    setEditingId(record.id)
    setForm({
      informationType: record.informationType,
      description: record.description,
      location: record.location,
      acquisitionValue: record.acquisitionValue,
      status: record.status,
      exercise: record.exercise,
      documentTitle: record.document?.title ?? '',
      documentUrl: record.document?.url ?? '',
    })
  }
  async function save() {
    setSaving(true)
    try {
      const result = editingId
        ? await updatePatrimonialAsset(
            authenticatedSession.token,
            editingId,
            form,
          )
        : await createPatrimonialAsset(authenticatedSession.token, form)
      setRecords((current) => [
        ...current.filter((item) => item.id !== result.id),
        result,
      ])
      setEditingId(result.id)
      toast({
        title: 'Bem patrimonial salvo',
        description: 'Confira o registro antes de publicar.',
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
      const published = await publishPatrimonialExercise(
        authenticatedSession.token,
        form.exercise,
      )
      setRecords((current) => [
        ...current.filter((item) => item.exercise !== form.exercise),
        ...published,
      ])
      toast({ title: 'Patrimônio publicado', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Não foi possível publicar',
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
      description="Cadastre e publique os bens patrimoniais."
      title="Patrimonial"
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <div>
              <CardTitle>1. Bens patrimoniais</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                Preencha os dados exibidos na tabela pública.
              </p>
            </div>
            <Button onClick={reset} type="button" variant="outline">
              <Plus size={16} /> Novo bem
            </Button>
          </CardHeader>
          <CardContent className="grid gap-5 pt-6">
            <div className="grid gap-4 sm:grid-cols-3">
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
                <Label htmlFor="asset-type">Tipo de bem</Label>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  id="asset-type"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      informationType: event.target.value,
                    }))
                  }
                  value={form.informationType}
                >
                  {informationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="asset-status">Situação</Label>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  id="asset-status"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                  value={form.status}
                >
                  {assetStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="asset-description">Descrição</Label>
                <Input
                  id="asset-description"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  value={form.description}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="asset-location">Localização</Label>
                <Input
                  id="asset-location"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                  value={form.location}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Valor de aquisição</Label>
                <NumericInput
                  kind="amount"
                  onValueChange={(_, value) =>
                    setForm((current) => ({
                      ...current,
                      acquisitionValue: value,
                    }))
                  }
                  value={form.acquisitionValue}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="asset-url">URL do documento (opcional)</Label>
                <Input
                  id="asset-url"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      documentUrl: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  type="url"
                  value={form.documentUrl ?? ''}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 border-t border-border pt-5">
              <Button
                disabled={saving || !form.description || !form.location}
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye size={18} /> Pré-visualização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border p-4 text-sm">
              <p className="font-semibold">
                {form.informationType || 'Tipo de bem'}
              </p>
              <p className="mt-2 text-muted-foreground">
                {form.description || 'Descrição do bem'}
              </p>
              <p className="mt-1 text-muted-foreground">
                {form.location || 'Localização'}
              </p>
              <p className="mt-2 font-semibold">
                R${' '}
                {form.acquisitionValue.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </p>
              <span
                className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${assetStatusClass(form.status)}`}
              >
                {form.status}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bens cadastrados</CardTitle>
            <p className="text-sm text-muted-foreground">
              {exercises.length
                ? `${records.length} registro(s) em ${exercises.length} exercício(s).`
                : 'Nenhum bem cadastrado.'}
            </p>
          </CardHeader>
          <CardContent className="grid gap-3">
            {exercises.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum bem cadastrado.
              </p>
            ) : (
              exercises.map((exercise) => {
                const count = recordsByExercise.get(exercise)?.length ?? 0
                return (
                  <button
                    className="flex w-full items-center justify-between rounded-lg border border-border p-4 text-left transition-colors hover:border-[#223149] hover:bg-[#f7f9fc]"
                    key={exercise}
                    onClick={() => setSelectedExercise(exercise)}
                    type="button"
                  >
                    <span>
                      <strong className="text-[#223149]">
                        Exercício {exercise}
                      </strong>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {count} bem(ns) cadastrado(s)
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-[#52617a]">
                      Ver registros →
                    </span>
                  </button>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
      {selectedExercise !== null ? (
        <div
          aria-label={`Bens cadastrados no exercício ${selectedExercise}`}
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#223149]/45 p-4"
          role="dialog"
        >
          <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-[#dfe4ea] bg-white shadow-xl">
            <div className="flex items-start justify-between gap-6 border-b border-[#e5e7eb] px-7 py-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#52617a]">
                  Exercício {selectedExercise} · Patrimonial
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#223149]">
                  Bens patrimoniais cadastrados
                </h2>
                <p className="mt-1 text-sm text-[#69727d]">
                  Consulte ou edite os bens registrados neste exercício.
                </p>
              </div>
              <button
                aria-label="Fechar detalhes do exercício"
                className="flex size-9 shrink-0 items-center justify-center rounded-md border border-[#d1d9e4] bg-[#f7f9fc] text-[#52617a] transition-colors hover:border-[#223149] hover:bg-white hover:text-[#223149] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#223149]"
                onClick={() => setSelectedExercise(null)}
                type="button"
              >
                <X size={17} />
              </button>
            </div>
            <div className="max-h-[min(60vh,520px)] overflow-auto px-7 py-6">
              <div className="overflow-hidden rounded-lg border border-[#e5e7eb]">
                <table className="w-full min-w-[760px] table-fixed text-left text-sm">
                  <thead className="bg-[#edeff1]">
                    <tr className="text-[13px] font-semibold text-[#52617a]">
                      <th className="w-[16%] px-4 py-3">Tipo</th>
                      <th className="w-[24%] px-4 py-3">Descrição</th>
                      <th className="w-[20%] px-4 py-3">Localização</th>
                      <th className="w-[14%] px-4 py-3">Situação</th>
                      <th className="w-[26%] px-4 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecords.map((record) => (
                      <tr
                        className="border-t border-[#e5e7eb] transition-colors hover:bg-[#f7f9fc]"
                        key={record.id}
                      >
                        <td className="px-4 py-4 font-medium text-[#223149]">
                          {record.informationType}
                        </td>
                        <td className="px-4 py-4 text-[#333]">
                          {record.description}
                        </td>
                        <td className="px-4 py-4 text-[#69727d]">
                          {record.location}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${assetStatusClass(record.status)}`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                            <Button
                              onClick={() => {
                                edit(record)
                                setSelectedExercise(null)
                              }}
                              type="button"
                              variant="outline"
                            >
                              <Pencil size={14} /> Editar
                            </Button>
                            {record.document && (
                              <a
                                className="inline-flex min-h-9 items-center gap-1 rounded-md border border-transparent px-2 text-[13px] font-semibold text-[#0284c7] underline-offset-2 transition-colors hover:border-[#cfe0ed] hover:bg-[#f0f8fc] hover:underline"
                                href={record.document.url}
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
        </div>
      ) : null}
    </AdminShell>
  )
}
