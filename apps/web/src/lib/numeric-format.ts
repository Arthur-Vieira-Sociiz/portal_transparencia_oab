export type NumericInputKind = 'amount' | 'integer' | 'year'

export function sanitizeNumericInput(value: string, kind: NumericInputKind) {
  if (kind === 'year' || kind === 'integer') return value.replace(/\D/g, '')

  const sanitized = value.replace(/[^\d,.]/g, '')
  const commaIndex = sanitized.indexOf(',')
  if (commaIndex < 0) return sanitized

  return `${sanitized.slice(0, commaIndex)},${sanitized
    .slice(commaIndex + 1)
    .replace(/[,.]/g, '')}`
}

function groupIntegerDigits(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('pt-BR') : ''
}

export function formatNumericInput(
  value: string | number,
  kind: NumericInputKind,
) {
  const raw = String(value)
  const sanitized = sanitizeNumericInput(raw, kind)
  if (kind === 'year') return sanitized
  if (kind === 'integer') return groupIntegerDigits(sanitized)

  const [whole, decimal] = sanitized.split(',')
  const groupedWhole = groupIntegerDigits(whole ?? '')
  return decimal === undefined
    ? groupedWhole
    : `${groupedWhole},${decimal.slice(0, 2)}`
}

export function parseNumericInput(value: string, kind: NumericInputKind) {
  const trimmed = value.trim()
  if (!trimmed) return 0
  if (kind === 'year' || kind === 'integer') {
    return Number(trimmed.replace(/\D/g, '')) || 0
  }

  const looksLikeThousands = /^-?\d{1,3}(\.\d{3})+$/.test(trimmed)
  const normalized = looksLikeThousands
    ? trimmed.replace(/\./g, '')
    : trimmed.includes(',')
      ? trimmed.replace(/\./g, '').replace(',', '.')
      : trimmed
  const parsed = Number(normalized.replace(/[^\d.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatNumericDisplay(
  value: string | number,
  kind: NumericInputKind,
) {
  if (kind !== 'amount') return formatNumericInput(value, kind)
  return parseNumericInput(String(value), kind).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function isAllowedNumericKey(key: string, kind: NumericInputKind) {
  if (
    [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Home',
      'End',
    ].includes(key)
  ) {
    return true
  }
  if (key.length !== 1) return true
  return kind === 'amount' ? /[\d,.]/.test(key) : /\d/.test(key)
}
