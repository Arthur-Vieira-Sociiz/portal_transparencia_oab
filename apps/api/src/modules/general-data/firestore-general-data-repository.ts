import { ExerciseSchema } from '@oab-transparencia/contracts/common'
import {
  GeneralDataStatusSchema,
  type CreateGeneralDataRequest,
  type GeneralData,
  type UpdateGeneralDataRequest,
} from '@oab-transparencia/contracts/transparency'
import {
  Timestamp,
  type DocumentSnapshot,
  type Firestore,
} from 'firebase-admin/firestore'
import { z } from 'zod'
import { getFirestoreClient } from '../../infrastructure/database/firestore.js'
import {
  converterParaCentavos,
  converterParaReais,
  converterTimestampParaIso,
  converterTimestampParaIsoOuNulo,
  removerCamposIndefinidos,
} from '../../infrastructure/database/firestore-converters.js'
import { erroFirestoreJaExiste } from '../../infrastructure/database/firestore-errors.js'
import {
  ConflitoChaveUnicaError,
  garantirChaveDisponivel,
  garantirPosseDaChave,
  liberarChave,
  obterReferenciaChaveUnica,
  reservarChave,
} from '../../infrastructure/database/firestore-unique-keys.js'
import {
  GeneralDataError,
  type GeneralDataRepository,
} from './general-data-service.js'

const COLECAO = 'generalData'
const DOMINIO_CHAVE_UNICA = 'generalData.exercise'

// Valida o documento no limite do banco para não devolver dados corrompidos como contrato válido.
const DadosGeraisArmazenadosSchema = z.object({
  exercise: ExerciseSchema,
  totalExpensesCents: z.number().int().nonnegative(),
  totalRevenueCents: z.number().int().nonnegative(),
  budgetCents: z.number().int().nonnegative(),
  patrimonyCents: z.number().int().nonnegative(),
  activeLawyers: z.number().int().nonnegative(),
  activeSocieties: z.number().int().nonnegative(),
  supportRooms: z.number().int().nonnegative(),
  registeredMembers: z.number().int().nonnegative(),
  status: GeneralDataStatusSchema,
  publishedAt: z.instanceof(Timestamp).nullable(),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
  createdById: z.string().min(1),
  updatedById: z.string().min(1),
})

type DadosGeraisArmazenados = z.infer<typeof DadosGeraisArmazenadosSchema>

type CamposMonetarios = Pick<
  DadosGeraisArmazenados,
  'totalExpensesCents' | 'totalRevenueCents' | 'budgetCents' | 'patrimonyCents'
>

// Converte o documento interno para o contrato consumido pelo frontend.
function converterParaContrato(
  registro: DadosGeraisArmazenados,
  id: string,
): GeneralData {
  return {
    id,
    exercise: registro.exercise,
    totalExpenses: converterParaReais(registro.totalExpensesCents),
    totalRevenue: converterParaReais(registro.totalRevenueCents),
    budget: converterParaReais(registro.budgetCents),
    patrimony: converterParaReais(registro.patrimonyCents),
    activeLawyers: registro.activeLawyers,
    activeSocieties: registro.activeSocieties,
    supportRooms: registro.supportRooms,
    registeredMembers: registro.registeredMembers,
    status: registro.status,
    createdAt: converterTimestampParaIso(registro.createdAt),
    updatedAt: converterTimestampParaIso(registro.updatedAt),
    publishedAt: converterTimestampParaIsoOuNulo(registro.publishedAt),
  }
}

// Lê e valida um documento antes de expor qualquer campo.
function lerDocumento(documento: DocumentSnapshot): DadosGeraisArmazenados {
  const resultado = DadosGeraisArmazenadosSchema.safeParse(documento.data())
  if (!resultado.success) {
    throw new Error(`Dados gerais inválidos no documento ${documento.id}.`, {
      cause: resultado.error,
    })
  }
  return resultado.data
}

// Monta somente os valores monetários enviados na edição, sempre em centavos.
function montarValoresMonetarios(dados: {
  totalExpenses?: number
  totalRevenue?: number
  budget?: number
  patrimony?: number
}): Partial<CamposMonetarios> {
  return removerCamposIndefinidos({
    totalExpensesCents:
      dados.totalExpenses === undefined
        ? undefined
        : converterParaCentavos(dados.totalExpenses),
    totalRevenueCents:
      dados.totalRevenue === undefined
        ? undefined
        : converterParaCentavos(dados.totalRevenue),
    budgetCents:
      dados.budget === undefined
        ? undefined
        : converterParaCentavos(dados.budget),
    patrimonyCents:
      dados.patrimony === undefined
        ? undefined
        : converterParaCentavos(dados.patrimony),
  })
}

// Identifica o conflito de unicidade sem esconder falhas de infraestrutura.
function ehConflitoDeChaveUnica(erro: unknown) {
  return erro instanceof ConflitoChaveUnicaError || erroFirestoreJaExiste(erro)
}

export function createFirestoreGeneralDataRepository(
  cliente: Firestore = getFirestoreClient(),
): GeneralDataRepository {
  const colecao = cliente.collection(COLECAO)

  return {
    async list() {
      const resultado = await colecao.orderBy('exercise', 'desc').get()
      return resultado.docs.map((documento) =>
        converterParaContrato(lerDocumento(documento), documento.id),
      )
    },

    async findByExercise(exercise) {
      const resultado = await colecao
        .where('exercise', '==', exercise)
        .limit(1)
        .get()
      const documento = resultado.docs[0]
      return documento
        ? converterParaContrato(lerDocumento(documento), documento.id)
        : null
    },

    async findPublishedByExercise(exercise) {
      // Há no máximo um registro por exercício; ordenar em memória evita um índice composto.
      const resultado = await colecao.where('status', '==', 'PUBLISHED').get()
      const documentos = resultado.docs.filter(
        (documento) =>
          exercise === undefined || documento.get('exercise') === exercise,
      )
      const documento = documentos.sort(
        (a, b) => Number(b.get('exercise')) - Number(a.get('exercise')),
      )[0]
      return documento
        ? converterParaContrato(lerDocumento(documento), documento.id)
        : null
    },

    async create(dadosEntrada: CreateGeneralDataRequest & { userId: string }) {
      const referenciaDocumento = colecao.doc()
      const referenciaChaveUnica = obterReferenciaChaveUnica(
        cliente,
        DOMINIO_CHAVE_UNICA,
        [dadosEntrada.exercise],
      )
      const agora = Timestamp.now()
      const documento: DadosGeraisArmazenados = {
        exercise: dadosEntrada.exercise,
        totalExpensesCents: converterParaCentavos(dadosEntrada.totalExpenses),
        totalRevenueCents: converterParaCentavos(dadosEntrada.totalRevenue),
        budgetCents: converterParaCentavos(dadosEntrada.budget),
        patrimonyCents: converterParaCentavos(dadosEntrada.patrimony),
        activeLawyers: dadosEntrada.activeLawyers,
        activeSocieties: dadosEntrada.activeSocieties,
        supportRooms: dadosEntrada.supportRooms,
        registeredMembers: dadosEntrada.registeredMembers,
        status: 'DRAFT',
        publishedAt: null,
        createdAt: agora,
        updatedAt: agora,
        createdById: dadosEntrada.userId,
        updatedById: dadosEntrada.userId,
      }

      try {
        await cliente.runTransaction(async (transacao) => {
          const reservaAtual = await transacao.get(referenciaChaveUnica)
          garantirChaveDisponivel(reservaAtual)

          transacao.create(referenciaDocumento, documento)
          reservarChave(transacao, referenciaChaveUnica, {
            dominio: DOMINIO_CHAVE_UNICA,
            valoresChave: [dadosEntrada.exercise],
            idRegistro: referenciaDocumento.id,
          })
        })
      } catch (erro) {
        if (ehConflitoDeChaveUnica(erro)) {
          throw new GeneralDataError('EXERCISE_ALREADY_EXISTS')
        }
        throw erro
      }

      return converterParaContrato(documento, referenciaDocumento.id)
    },

    async update(
      id: string,
      dadosEntrada: UpdateGeneralDataRequest & { userId: string },
    ) {
      const referenciaDocumento = colecao.doc(id)

      try {
        return await cliente.runTransaction(async (transacao) => {
          const documentoAtual = await transacao.get(referenciaDocumento)
          if (!documentoAtual.exists) return null

          const atual = lerDocumento(documentoAtual)
          const referenciaNovaChave = obterReferenciaChaveUnica(
            cliente,
            DOMINIO_CHAVE_UNICA,
            [dadosEntrada.exercise ?? atual.exercise],
          )
          const referenciaChaveAtual = obterReferenciaChaveUnica(
            cliente,
            DOMINIO_CHAVE_UNICA,
            [atual.exercise],
          )
          const reservaAtual = await transacao.get(referenciaChaveAtual)
          garantirPosseDaChave(reservaAtual, id)

          const exercicioMudou =
            referenciaChaveAtual.path !== referenciaNovaChave.path
          if (exercicioMudou) {
            const novaReserva = await transacao.get(referenciaNovaChave)
            garantirChaveDisponivel(novaReserva)
          }

          const camposAtualizados = removerCamposIndefinidos({
            ...montarValoresMonetarios(dadosEntrada),
            exercise: dadosEntrada.exercise,
            activeLawyers: dadosEntrada.activeLawyers,
            activeSocieties: dadosEntrada.activeSocieties,
            supportRooms: dadosEntrada.supportRooms,
            registeredMembers: dadosEntrada.registeredMembers,
          })
          const agora = Timestamp.now()
          const documentoAtualizado: DadosGeraisArmazenados = {
            ...atual,
            ...camposAtualizados,
            ...(dadosEntrada.status !== undefined
              ? { status: dadosEntrada.status }
              : {}),
            publishedAt:
              dadosEntrada.status === 'DRAFT' ? null : atual.publishedAt,
            updatedAt: agora,
            updatedById: dadosEntrada.userId,
          }

          transacao.update(referenciaDocumento, documentoAtualizado)
          if (exercicioMudou) {
            reservarChave(transacao, referenciaNovaChave, {
              dominio: DOMINIO_CHAVE_UNICA,
              valoresChave: [documentoAtualizado.exercise],
              idRegistro: id,
            })
            liberarChave(transacao, referenciaChaveAtual)
          }

          return converterParaContrato(documentoAtualizado, id)
        })
      } catch (erro) {
        if (ehConflitoDeChaveUnica(erro)) {
          throw new GeneralDataError('EXERCISE_ALREADY_EXISTS')
        }
        throw erro
      }
    },

    async publish(id, userId) {
      const referenciaDocumento = colecao.doc(id)

      return cliente.runTransaction(async (transacao) => {
        const documentoAtual = await transacao.get(referenciaDocumento)
        if (!documentoAtual.exists) return null

        const atual = lerDocumento(documentoAtual)
        const agora = Timestamp.now()
        const documentoAtualizado: DadosGeraisArmazenados = {
          ...atual,
          status: 'PUBLISHED',
          publishedAt: agora,
          updatedAt: agora,
          updatedById: userId,
        }
        transacao.update(referenciaDocumento, documentoAtualizado)

        return converterParaContrato(documentoAtualizado, id)
      })
    },
  }
}
