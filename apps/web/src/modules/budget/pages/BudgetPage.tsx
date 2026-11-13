import { useState } from 'react'

import type { BudgetRecord } from '@oab-transparencia/contracts'
import {
  PublicFilters,
  PublicPageState,
  PublicSectionHeader,
  PublicSelectField,
  PublicTableScroll,
} from '@/components/shared/public-page'

import { formatCurrency } from '@/lib/formatters'
import { PublicPortalLayout } from '@/modules/public-shell/components/PublicPortalLayout'
import { usePublicBudget } from '../hooks/useBudget'
import '@/modules/public/public-portal.css'

const CURRENT_EXERCISE = new Date().getFullYear()

const informationTypeLabels = {
  'budget-proposal': 'Proposta Orçamentária por Exercício',
  budget: 'Orçamento',
  financial: 'Financeiro',
  'financial-statement': 'Balanço Financeiro',
  'patrimonial-statement': 'Balanço Patrimonial',
  'trial-balance': 'Balancetes',
} as const

type InformationType = BudgetRecord['informationType']

function DocumentIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function executionClass(percentage: number) {
  if (percentage >= 80) return 'budget-execution--high'
  if (percentage >= 50) return 'budget-execution--medium'

  return 'budget-execution--low'
}

export function BudgetPage() {
  const [exercise, setExercise] = useState(CURRENT_EXERCISE)
  const [informationType, setInformationType] = useState<
    'all' | InformationType
  >('all')
  const page = usePublicBudget()

  if (page.isPending) {
    return <PublicPageState>Carregando informações…</PublicPageState>
  }

  if (page.isError) {
    return (
      <PublicPageState kind="error">
        Não foi possível carregar as informações.
      </PublicPageState>
    )
  }

  const records = page.data.records.filter(
    (record) =>
      record.exercise === exercise &&
      (informationType === 'all' || record.informationType === informationType),
  )

  return (
    <PublicPortalLayout>
      <section aria-labelledby="budget-title" className="budget-content">
        <PublicSectionHeader
          description="Acompanhe o orçamento anual, a previsão e a execução financeira por categoria."
          id="budget-title"
          title="Visão orçamentária por exercício"
        />

        <PublicFilters className="budget-filters">
          <PublicSelectField
            containerClassName="budget-filter"
            id="budget-exercise"
            label="Exercício/Ano"
            onChange={(event) => setExercise(Number(event.target.value))}
            value={exercise}
          >
            {(page.data.availableExercises.length
              ? page.data.availableExercises
              : [exercise]
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </PublicSelectField>

          <PublicSelectField
            containerClassName="budget-filter"
            id="budget-information-type"
            label="Tipo de informação"
            onChange={(event) =>
              setInformationType(event.target.value as 'all' | InformationType)
            }
            value={informationType}
          >
            <option value="all">Todos</option>
            {(Object.keys(informationTypeLabels) as InformationType[]).map(
              (type) => (
                <option key={type} value={type}>
                  {informationTypeLabels[type]}
                </option>
              ),
            )}
          </PublicSelectField>
        </PublicFilters>

        <PublicTableScroll className="budget-table-scroll">
          <table className="budget-table">
            <thead>
              <tr>
                <th>Tipo de informação</th>
                <th>Orçamento anual (R$)</th>
                <th>Valor previsto (R$)</th>
                <th>Valor executado (R$)</th>
                <th>% de execução</th>
                <th>Acesso</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((record) => (
                  <tr key={record.id}>
                    <td>{informationTypeLabels[record.informationType]}</td>
                    <td>{formatCurrency(record.annualBudget)}</td>
                    <td>{formatCurrency(record.plannedAmount)}</td>
                    <td>{formatCurrency(record.executedAmount)}</td>
                    <td>
                      <span
                        className={`budget-execution ${executionClass(record.executionPercentage)}`}
                      >
                        {record.executionPercentage.toLocaleString('pt-BR', {
                          maximumFractionDigits: 1,
                          minimumFractionDigits: 1,
                        })}
                        %
                      </span>
                    </td>
                    <td>
                      {record.document ? (
                        <a
                          aria-label={`Visualizar ${record.document.title}`}
                          className="budget-document-link"
                          href={record.document.url}
                          rel="noreferrer"
                          target="_blank"
                          title="Visualizar documento"
                        >
                          <DocumentIcon />
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="budget-table__empty" colSpan={6}>
                    Nenhuma informação publicada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </PublicTableScroll>

        <p className="budget-note">
          *O percentual indica quanto do orçamento já foi utilizado no exercício
          selecionado.
        </p>
      </section>
    </PublicPortalLayout>
  )
}
