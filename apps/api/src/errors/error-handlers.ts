import type { ErrorRequestHandler, Response } from 'express'
import { ZodError } from 'zod'
import {
  AuthenticationError,
  BudgetError,
  ContractError,
  FinancialDocumentError,
  GeneralDataError,
  HumanResourcesError,
  PatrimonialAssetError,
  ReportsIndicatorsError,
} from './custom-errors.js'

function authenticationErrorResponse(
  error: AuthenticationError,
  response: Response,
) {
  const responses = {
    EMAIL_ALREADY_IN_USE: [409, 'Este e-mail já está cadastrado.'],
    INVALID_CREDENTIALS: [401, 'E-mail ou senha inválidos.'],
    INVALID_REGISTRATION_KEY: [403, 'Chave de cadastro inválida.'],
    REGISTRATION_UNAVAILABLE: [503, 'Cadastro inicial indisponível.'],
    UNAUTHENTICATED: [401, 'Autenticação necessária.'],
    FORBIDDEN: [403, 'Apenas administradores podem gerenciar usuários.'],
  } as const
  const [status, message] = responses[error.code]
  response.status(status).json({ message })
}

function generalDataErrorResponse(error: GeneralDataError, response: Response) {
  const responses = {
    EXERCISE_ALREADY_EXISTS: [
      409,
      'Já existe um cadastro para este exercício.',
    ],
    GENERAL_DATA_NOT_FOUND: [404, 'Cadastro de dados gerais não encontrado.'],
    GENERAL_DATA_ALREADY_PUBLISHED: [409, 'Este cadastro já foi publicado.'],
  } as const
  const [status, message] = responses[error.code]
  response.status(status).json({ message })
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: 'Dados inválidos.',
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
    return
  }
  if (error instanceof AuthenticationError) {
    authenticationErrorResponse(error, response)
    return
  }
  if (error instanceof GeneralDataError) {
    generalDataErrorResponse(error, response)
    return
  }
  if (error instanceof ReportsIndicatorsError) {
    const messages = {
      REPORTS_INDICATOR_ALREADY_EXISTS:
        'Já existe um cadastro de indicadores para este exercício.',
      REPORTS_INDICATOR_NOT_FOUND: 'Cadastro de indicadores não encontrado.',
      REPORTS_INDICATOR_EXERCISE_NOT_FOUND:
        'Nenhum cadastro de indicadores encontrado para este exercício.',
    } as const
    response
      .status(error.code === 'REPORTS_INDICATOR_ALREADY_EXISTS' ? 409 : 404)
      .json({ message: messages[error.code] })
    return
  }
  if (error instanceof BudgetError) {
    const messages = {
      BUDGET_RECORD_ALREADY_EXISTS:
        'Já existe um registro para este tipo e exercício.',
      BUDGET_RECORD_NOT_FOUND: 'Registro orçamentário não encontrado.',
      BUDGET_EXERCISE_NOT_FOUND:
        'Nenhum registro orçamentário encontrado para este exercício.',
    } as const
    const status = error.code === 'BUDGET_RECORD_ALREADY_EXISTS' ? 409 : 404
    response.status(status).json({ message: messages[error.code] })
    return
  }
  if (error instanceof FinancialDocumentError) {
    const messages = {
      FINANCIAL_DOCUMENT_ALREADY_EXISTS:
        'Já existe um documento para este tipo e exercício.',
      FINANCIAL_DOCUMENT_NOT_FOUND: 'Documento financeiro não encontrado.',
      FINANCIAL_EXERCISE_NOT_FOUND:
        'Nenhum documento financeiro encontrado para este exercício.',
    } as const
    const status =
      error.code === 'FINANCIAL_DOCUMENT_ALREADY_EXISTS' ? 409 : 404
    response.status(status).json({ message: messages[error.code] })
    return
  }
  if (error instanceof HumanResourcesError) {
    const messages = {
      HUMAN_RESOURCES_ALREADY_EXISTS:
        'Já existe um cadastro de recursos humanos para este exercício e localidade.',
      HUMAN_RESOURCES_NOT_FOUND: 'Cadastro de recursos humanos não encontrado.',
      HUMAN_RESOURCES_EXERCISE_NOT_FOUND:
        'Nenhum cadastro de recursos humanos encontrado para este exercício.',
    } as const
    response
      .status(error.code === 'HUMAN_RESOURCES_ALREADY_EXISTS' ? 409 : 404)
      .json({ message: messages[error.code] })
    return
  }
  if (error instanceof PatrimonialAssetError) {
    const messages = {
      PATRIMONIAL_ASSET_ALREADY_EXISTS:
        'Já existe um bem patrimonial com esse tipo, descrição e exercício.',
      PATRIMONIAL_ASSET_NOT_FOUND: 'Bem patrimonial não encontrado.',
      PATRIMONIAL_EXERCISE_NOT_FOUND:
        'Nenhum bem patrimonial encontrado para este exercício.',
    } as const
    const status = error.code === 'PATRIMONIAL_ASSET_ALREADY_EXISTS' ? 409 : 404
    response.status(status).json({ message: messages[error.code] })
    return
  }
  if (error instanceof ContractError) {
    const messages = {
      CONTRACT_ALREADY_EXISTS:
        'Já existe um contrato para este fornecedor, data e exercício.',
      CONTRACT_NOT_FOUND: 'Contrato não encontrado.',
      CONTRACT_EXERCISE_NOT_FOUND:
        'Nenhum contrato encontrado para este exercício.',
      SUPPLIER_ALREADY_EXISTS: 'Este CNPJ já está cadastrado.',
    } as const
    response
      .status(
        error.code === 'CONTRACT_ALREADY_EXISTS' ||
          error.code === 'SUPPLIER_ALREADY_EXISTS'
          ? 409
          : 404,
      )
      .json({ message: messages[error.code] })
    return
  }

  response.status(500).json({ message: 'Erro interno do servidor.' })
}
