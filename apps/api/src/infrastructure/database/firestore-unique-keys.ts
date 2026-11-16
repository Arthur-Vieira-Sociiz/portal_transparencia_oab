import { createHash } from 'node:crypto'
import {
  Timestamp,
  type DocumentReference,
  type DocumentSnapshot,
  type Firestore,
  type Transaction,
} from 'firebase-admin/firestore'

const COLECAO_CHAVES_UNICAS = 'uniqueKeys'

export class ConflitoChaveUnicaError extends Error {
  constructor() {
    super('Já existe um registro com os mesmos dados únicos.')
  }
}

// Gera um ID determinístico para a reserva de unicidade.
function criarIdChaveUnica(
  dominio: string,
  valores: readonly (string | number)[],
): string {
  const hash = createHash('sha256')
    .update(JSON.stringify({ dominio, valores }))
    .digest('hex')
  return `${dominio}_${hash}`
}

// Aponta para o documento que reserva uma combinação única.
export function obterReferenciaChaveUnica(
  cliente: Firestore,
  dominio: string,
  valores: readonly (string | number)[],
): DocumentReference {
  return cliente
    .collection(COLECAO_CHAVES_UNICAS)
    .doc(criarIdChaveUnica(dominio, valores))
}

// Falha quando outro registro já reservou a mesma combinação.
export function garantirChaveDisponivel(documentoChave: DocumentSnapshot) {
  if (documentoChave.exists) throw new ConflitoChaveUnicaError()
}

// Confere se a reserva antiga realmente pertence ao registro que está sendo editado.
export function garantirPosseDaChave(
  documentoChave: DocumentSnapshot,
  idRegistro: string,
) {
  if (
    !documentoChave.exists ||
    documentoChave.get('resourceId') !== idRegistro
  ) {
    throw new Error('A reserva de unicidade do registro está inconsistente.')
  }
}

// Cria a reserva dentro da mesma transação que grava o registro.
export function reservarChave(
  transacao: Transaction,
  referencia: DocumentReference,
  dadosReserva: {
    dominio: string
    valoresChave: readonly (string | number)[]
    idRegistro: string
  },
) {
  transacao.create(referencia, {
    namespace: dadosReserva.dominio,
    values: dadosReserva.valoresChave,
    resourceId: dadosReserva.idRegistro,
    createdAt: Timestamp.now(),
  })
}

// Libera a combinação antiga quando o registro passa a usar outra chave.
export function liberarChave(
  transacao: Transaction,
  referencia: DocumentReference,
) {
  transacao.delete(referencia)
}
