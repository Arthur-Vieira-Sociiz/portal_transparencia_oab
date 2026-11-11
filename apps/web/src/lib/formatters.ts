const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  minimumFractionDigits: 2,
  style: 'currency',
})

const integerFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
})

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

export function formatInteger(value: number) {
  return integerFormatter.format(value)
}
