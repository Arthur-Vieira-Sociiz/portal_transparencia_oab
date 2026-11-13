import { useState } from 'react'
import { Building2, Check, Pencil, Save, Trash2, X } from 'lucide-react'
import type { Supplier } from '@oab-transparencia/contracts/transparency'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { formatCnpj } from '../data/contracts.formatters'
import { useDeleteSupplier, useUpdateSupplier } from '../hooks/useContracts'

interface SuppliersPanelProps {
  isError: boolean
  isPending: boolean
  onSelect: (supplier: Supplier) => void
  onUpdated: (supplier: Supplier, previousCnpj: string) => void
  suppliers: Supplier[]
  token: string
}

export function SuppliersPanel({
  isError,
  isPending,
  onSelect,
  onUpdated,
  suppliers,
  token,
}: SuppliersPanelProps) {
  const updateSupplier = useUpdateSupplier(token)
  const removeSupplier = useDeleteSupplier(token)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [deleting, setDeleting] = useState<Supplier | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftCnpj, setDraftCnpj] = useState('')
  const { toast } = useToast()
  const saving = updateSupplier.isPending || removeSupplier.isPending

  function startEditing(supplier: Supplier) {
    setEditing(supplier)
    setDraftName(supplier.name)
    setDraftCnpj(supplier.cnpj)
  }

  async function save() {
    if (!editing) return
    try {
      const { supplier } = await updateSupplier.mutateAsync({
        id: editing.id,
        input: { name: draftName, cnpj: draftCnpj },
        previousCnpj: editing.cnpj,
      })
      onUpdated(supplier, editing.cnpj)
      setEditing(null)
      toast({ title: 'Fornecedor atualizado', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Não foi possível atualizar o fornecedor',
        description:
          error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'error',
      })
    }
  }

  async function remove() {
    if (!deleting) return
    try {
      await removeSupplier.mutateAsync(deleting.id)
      setDeleting(null)
      toast({ title: 'Fornecedor excluído', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Não foi possível excluir o fornecedor',
        description:
          error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'error',
      })
    }
  }

  return (
    <>
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 size={18} /> Fornecedores cadastrados
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {suppliers.length} fornecedor(es) disponível(is) para reutilização.
          </p>
        </CardHeader>
        <CardContent className="max-h-72 space-y-3 overflow-y-auto">
          {isPending ? (
            <p className="text-sm text-muted-foreground">
              Carregando fornecedores…
            </p>
          ) : isError ? (
            <p className="text-sm text-destructive" role="alert">
              Não foi possível carregar os fornecedores.
            </p>
          ) : suppliers.length ? (
            suppliers.map((supplier) => (
              <div
                className="rounded-lg border border-[#dfe4ea] bg-[#f8fafc] p-3 transition-colors hover:border-[#b8c7d9] hover:bg-white"
                key={supplier.id}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-white text-[#52617a] shadow-sm ring-1 ring-[#dfe4ea]">
                    <Building2 size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm text-[#223149]">
                      {supplier.name}
                    </strong>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      CNPJ: {supplier.cnpj}
                    </span>
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#e6ebf1] pt-3">
                  <Button
                    className="h-8 px-2.5 text-xs"
                    onClick={() => onSelect(supplier)}
                    type="button"
                    variant="outline"
                  >
                    <Check size={14} /> Usar
                  </Button>
                  <Button
                    className="h-8 px-2.5 text-xs"
                    onClick={() => startEditing(supplier)}
                    type="button"
                    variant="outline"
                  >
                    <Pencil size={14} /> Editar
                  </Button>
                  <Button
                    className="h-8 px-2.5 text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
                    onClick={() => setDeleting(supplier)}
                    type="button"
                    variant="outline"
                  >
                    <Trash2 size={14} /> Excluir
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum fornecedor cadastrado.
            </p>
          )}
        </CardContent>
      </Card>

      {editing ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#223149]/45 p-4"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-xl border border-[#dfe4ea] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#52617a]">
                  Cadastro de fornecedor
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[#223149]">
                  Editar fornecedor
                </h2>
              </div>
              <button
                aria-label="Fechar edição do fornecedor"
                className="flex size-9 items-center justify-center rounded-md border border-[#d1d9e4] text-[#52617a] hover:bg-[#f1f4f7]"
                onClick={() => setEditing(null)}
                type="button"
              >
                <X size={17} />
              </button>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-supplier-name">Nome</Label>
                <Input
                  id="edit-supplier-name"
                  onChange={(event) => setDraftName(event.target.value)}
                  value={draftName}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-supplier-cnpj">CNPJ</Label>
                <Input
                  id="edit-supplier-cnpj"
                  inputMode="numeric"
                  onChange={(event) =>
                    setDraftCnpj(formatCnpj(event.target.value))
                  }
                  value={draftCnpj}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-[#e6ebf1] pt-4">
              <Button
                onClick={() => setEditing(null)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                disabled={saving || !draftName.trim() || draftCnpj.length < 14}
                onClick={() => void save()}
                type="button"
              >
                <Save size={16} /> Salvar alterações
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmationDialog
        confirmLabel="Excluir fornecedor"
        description="O fornecedor será removido da lista de fornecedores cadastrados."
        isLoading={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void remove()}
        open={deleting !== null}
        title="Excluir fornecedor?"
      />
    </>
  )
}
