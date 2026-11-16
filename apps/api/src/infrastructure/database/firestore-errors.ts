// Código gRPC 6: o documento que se tentou criar já existe.
const CODIGO_JA_EXISTE = 6

// Identifica conflito de documento já existente sem esconder outros erros do Firestore.
export function erroFirestoreJaExiste(erro: unknown): boolean {
  if (typeof erro !== 'object' || erro === null || !('code' in erro)) {
    return false
  }

  // O Admin SDK pode expor o código como número ou texto, dependendo da camada que gerou o erro.
  return (
    erro.code === CODIGO_JA_EXISTE || erro.code === String(CODIGO_JA_EXISTE)
  )
}
