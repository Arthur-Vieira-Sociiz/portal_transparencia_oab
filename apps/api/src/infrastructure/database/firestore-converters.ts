import { Timestamp } from 'firebase-admin/firestore'

// Limite equivalente ao Decimal(14, 2) usado no schema anterior.
const LIMITE_CENTAVOS = 99_999_999_999_999

// Converte reais para centavos. O contrato já limita os valores a duas casas decimais.
export function converterParaCentavos(valorEmReais: number): number {
  const centavos = Math.round(valorEmReais * 100)
  if (!Number.isSafeInteger(centavos) || centavos > LIMITE_CENTAVOS) {
    throw new Error('O valor monetário está fora do limite aceito.')
  }
  return centavos
}

// Devolve o valor em reais no mesmo formato numérico usado pelos contratos HTTP.
export function converterParaReais(centavos: number): number {
  return centavos / 100
}

// Converte o Timestamp do Firestore para o ISO 8601 esperado pela API.
export function converterTimestampParaIso(timestamp: Timestamp): string {
  return timestamp.toDate().toISOString()
}

// Trata timestamps opcionais sem transformar ausência em data inválida.
export function converterTimestampParaIsoOuNulo(
  timestamp: Timestamp | null,
): string | null {
  return timestamp ? converterTimestampParaIso(timestamp) : null
}

// Remove chaves indefinidas, que o Firestore rejeita em gravações.
export function removerCamposIndefinidos<T extends object>(
  registro: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(registro).filter(
      ([, valorDoCampo]) => valorDoCampo !== undefined,
    ),
  ) as Partial<T>
}
