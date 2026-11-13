import { X } from 'lucide-react'
import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'

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

const focusableSelector = [
  'a[href]',
  'button:not(:disabled)',
  'input:not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

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
  const dialogRef = useRef<HTMLDivElement>(null)
  const descriptionId = useId()
  const titleId = useId()

  useEffect(() => {
    if (!open) return

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    dialogRef.current
      ?.querySelector<HTMLElement>('[data-dialog-cancel]')
      ?.focus()

    return () => previousFocus?.focus()
  }, [open])

  if (!open) return null

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' && !isLoading) {
      event.preventDefault()
      onCancel()
      return
    }

    if (event.key !== 'Tab') return

    const focusableElements = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements.at(-1)
    if (!firstElement || !lastElement) return

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-[2px]">
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl"
        onKeyDown={handleKeyDown}
        ref={dialogRef}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold" id={titleId}>
              {title}
            </h2>
            <p
              className="mt-1 text-sm leading-6 text-muted-foreground"
              id={descriptionId}
            >
              {description}
            </p>
          </div>
          <button
            aria-label="Fechar confirmação"
            className="flex size-8 shrink-0 appearance-none items-center justify-center rounded-md border-0 bg-transparent p-0 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
            onClick={onCancel}
            type="button"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>

        {children ? <div className="mt-5">{children}</div> : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-border pt-4">
          <Button
            data-dialog-cancel
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
