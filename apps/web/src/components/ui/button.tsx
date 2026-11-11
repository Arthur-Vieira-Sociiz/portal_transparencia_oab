import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border-0 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#12326f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0097e8] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60',
  {
    defaultVariants: { variant: 'default' },
    variants: {
      variant: {
        default: '',
        outline:
          'border border-border bg-transparent text-primary hover:bg-muted',
      },
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

function Button({
  asChild = false,
  className,
  variant,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button'
  return (
    <Component
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
