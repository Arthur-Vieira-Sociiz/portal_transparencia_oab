function digits(value: string, max: number) {
  return value.replace(/\D/g, '').slice(0, max)
}

export function formatCnpj(value: string) {
  const raw = digits(value, 14)
  return raw
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function formatContractDate(value: string) {
  const input = digits(value, 8)
  const day =
    input.length >= 2
      ? Math.min(Number(input.slice(0, 2)), 31)
          .toString()
          .padStart(2, '0')
      : input
  const month =
    input.length >= 4
      ? Math.min(Number(input.slice(2, 4)), 12)
          .toString()
          .padStart(2, '0')
      : input.slice(2)
  const raw = `${day}${month}${input.slice(4)}`.slice(0, 8)
  return raw
    .replace(/^(\d{2})(\d)/, '$1/$2')
    .replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3')
}

export function formatContractTerm(value: string) {
  const raw = digits(value, 16)
  if (raw.length <= 8) return formatContractDate(raw)
  return `${formatContractDate(raw.slice(0, 8))} a ${formatContractDate(raw.slice(8))}`
}
