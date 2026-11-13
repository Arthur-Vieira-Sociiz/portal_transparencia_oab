import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type GeneralDataPreviewItem = {
  icon: LucideIcon
  label: string
  value: string
}

type GeneralDataPreviewGridProps = {
  exercise: number
  items: GeneralDataPreviewItem[]
  variant?: 'panel' | 'dialog'
}

export function GeneralDataPreviewGrid({
  exercise,
  items,
  variant = 'panel',
}: GeneralDataPreviewGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3',
        variant === 'dialog' && 'sm:grid-cols-4',
      )}
    >
      {items.map(({ icon: Icon, label, value }) => (
        <div
          className={cn(
            'rounded-lg border p-3',
            variant === 'panel'
              ? 'min-h-[110px] border-[#1e3a67] bg-white'
              : 'border-[#1e3a67]/20 bg-[#f7f9fc]',
          )}
          key={label}
        >
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className="size-3.5 text-[#ff3557]" />
            {label}
          </p>
          <strong className="mt-2 block text-sm text-primary">{value}</strong>
          <span className="mt-1 block text-xs text-muted-foreground">
            Exercício {exercise}
          </span>
        </div>
      ))}
    </div>
  )
}
