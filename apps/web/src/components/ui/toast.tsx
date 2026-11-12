import { AlertTriangle, CheckCircle2, CircleX, Info, X } from 'lucide-react'
import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'
import {
  ToastContext,
  type ToastInput,
  type ToastVariant,
} from './toast-context'

type ToastRecord = ToastInput & { id: number }

const variantStyles: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; container: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle2,
    container: 'border-emerald-200 bg-emerald-50',
    iconColor: 'text-emerald-700',
  },
  error: {
    icon: CircleX,
    container: 'border-rose-200 bg-rose-50',
    iconColor: 'text-rose-700',
  },
  warning: {
    icon: AlertTriangle,
    container: 'border-amber-200 bg-amber-50',
    iconColor: 'text-amber-700',
  },
  info: {
    icon: Info,
    container: 'border-sky-200 bg-sky-50',
    iconColor: 'text-sky-700',
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback(
    (input: ToastInput) => {
      const id = Date.now() + Math.random()
      setToasts((current) => [...current.slice(-3), { ...input, id }])
      window.setTimeout(() => dismiss(id), 4500)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col items-end gap-3 sm:left-auto sm:w-[380px]"
      >
        {toasts.map((item) => {
          const style = variantStyles[item.variant ?? 'info']
          const Icon = style.icon
          return (
            <div
              className={cn(
                'pointer-events-auto flex w-full items-start gap-3 rounded-lg border p-4 text-[#223149] shadow-[0_12px_32px_rgba(34,49,73,0.14)]',
                style.container,
              )}
              key={item.id}
              role={item.variant === 'error' ? 'alert' : 'status'}
            >
              <Icon className={cn('mt-0.5 size-5 shrink-0', style.iconColor)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-xs leading-5 text-[#52617a]">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <button
                aria-label="Fechar aviso"
                className="flex size-7 shrink-0 appearance-none items-center justify-center rounded-md border-0 bg-transparent p-0 text-[#52617a] outline-none transition-colors hover:bg-black/5 hover:text-[#223149] focus-visible:ring-2 focus-visible:ring-[#223149]/30 focus-visible:ring-offset-1"
                onClick={() => dismiss(item.id)}
                type="button"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
