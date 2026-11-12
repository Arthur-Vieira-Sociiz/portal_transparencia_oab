import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from './button'

type ConfirmationDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
  isLoading?: boolean
}

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Voltar',
  onConfirm,
  onCancel,
  children,
  isLoading = false,
}: ConfirmationDialogProps) {
  if (!open) return null

  return (
    <div
      aria-labelledby="confirmation-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0f1d32]/45 p-4 backdrop-blur-[2px]"
      role="dialog"
    >
      <div className="w-full max-w-2xl rounded-xl border border-border bg-white p-6 shadow-[0_24px_70px_rgba(15,29,50,0.24)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-lg font-semibold text-[#223149]"
              id="confirmation-dialog-title"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#52617a]">
              {description}
            </p>
          </div>
          <button
            aria-label="Fechar confirmação"
            className="flex size-8 shrink-0 appearance-none items-center justify-center rounded-md border-0 bg-transparent p-0 text-[#52617a] outline-none transition-colors hover:bg-black/5 hover:text-[#223149] focus-visible:ring-2 focus-visible:ring-[#223149]/30"
            onClick={onCancel}
            type="button"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>

        {children ? <div className="mt-5">{children}</div> : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-border pt-4">
          <Button
            disabled={isLoading}
            onClick={onCancel}
            type="button"
            variant="outline"
          >
            {cancelLabel}
          </Button>
          <Button disabled={isLoading} onClick={onConfirm} type="button">
            {isLoading ? 'Processando…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
