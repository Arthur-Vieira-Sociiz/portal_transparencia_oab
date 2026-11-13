import type {
  AdminFinancialDocumentRecord,
  CreateFinancialDocumentRequest,
  PublicFinancialPage,
  UpdateFinancialDocumentRequest,
} from '@oab-transparencia/contracts/transparency'

export class FinancialDocumentError extends Error {
  constructor(
    public readonly code:
      | 'FINANCIAL_DOCUMENT_ALREADY_EXISTS'
      | 'FINANCIAL_DOCUMENT_NOT_FOUND'
      | 'FINANCIAL_EXERCISE_NOT_FOUND',
  ) {
    super(code)
  }
}

export type FinancialDocumentRepository = {
  list(): Promise<AdminFinancialDocumentRecord[]>
  listPublished(): Promise<PublicFinancialPage>
  findByTypeAndExercise(
    type: string,
    period: string,
    exercise: number,
  ): Promise<AdminFinancialDocumentRecord | null>
  create(
    input: CreateFinancialDocumentRequest & { userId: string },
  ): Promise<AdminFinancialDocumentRecord | null>
  update(
    id: string,
    input: UpdateFinancialDocumentRequest & { userId: string },
  ): Promise<AdminFinancialDocumentRecord | null>
  publishExercise(
    exercise: number,
    userId: string,
  ): Promise<AdminFinancialDocumentRecord[]>
}

export function createFinancialDocumentService(
  repository: FinancialDocumentRepository,
) {
  return {
    list: () => repository.list(),
    listPublished: () => repository.listPublished(),
    async create(input: CreateFinancialDocumentRequest & { userId: string }) {
      if (
        await repository.findByTypeAndExercise(
          input.informationType,
          input.period,
          input.exercise,
        )
      ) {
        throw new FinancialDocumentError('FINANCIAL_DOCUMENT_ALREADY_EXISTS')
      }
      const result = await repository.create(input)
      if (!result) {
        throw new FinancialDocumentError('FINANCIAL_DOCUMENT_ALREADY_EXISTS')
      }
      return result
    },
    async update(
      id: string,
      input: UpdateFinancialDocumentRequest & { userId: string },
    ) {
      const result = await repository.update(id, input)
      if (!result)
        throw new FinancialDocumentError('FINANCIAL_DOCUMENT_NOT_FOUND')
      return result
    },
    async publishExercise(exercise: number, userId: string) {
      const result = await repository.publishExercise(exercise, userId)
      if (!result.length) {
        throw new FinancialDocumentError('FINANCIAL_EXERCISE_NOT_FOUND')
      }
      return result
    },
  }
}

export type FinancialDocumentService = ReturnType<
  typeof createFinancialDocumentService
>
