import type { ComponentProps, FocusEvent, KeyboardEvent } from 'react'

import { Input } from './input'
import {
  formatNumericDisplay,
  formatNumericInput,
  isAllowedNumericKey,
  parseNumericInput,
  type NumericInputKind,
} from '@/lib/numeric-format'

type NumericInputProps = Omit<
  ComponentProps<typeof Input>,
  'onBlur' | 'onChange' | 'onFocus' | 'onKeyDown' | 'type' | 'value'
> & {
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void
  kind: NumericInputKind
  onValueChange: (formattedValue: string, numericValue: number) => void
  value: string | number
}

export function NumericInput({
  kind,
  onBlur,
  onFocus,
  onValueChange,
  value,
  ...props
}: NumericInputProps) {
  const formattedValue = formatNumericInput(value, kind)

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isAllowedNumericKey(event.key, kind)) event.preventDefault()
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    const nextValue = formatNumericDisplay(event.currentTarget.value, kind)
    onValueChange(nextValue, parseNumericInput(nextValue, kind))
    onBlur?.(event)
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    if (parseNumericInput(String(value), kind) === 0) {
      onValueChange('', 0)
    }
    onFocus?.(event)
  }

  return (
    <Input
      {...props}
      inputMode={kind === 'amount' ? 'decimal' : 'numeric'}
      onChange={(event) => {
        const nextValue = formatNumericInput(event.target.value, kind)
        onValueChange(nextValue, parseNumericInput(nextValue, kind))
      }}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      type="text"
      value={formattedValue}
    />
  )
}
