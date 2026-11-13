import { useState } from 'react'
import { PublicPageState } from '@/components/shared/public-page'
import { PublicPortalLayout } from '@/modules/public-shell/components/PublicPortalLayout'
import { AdministrativeReportSection } from '../components/AdministrativeReportSection'
import { ContractsReportSection } from '../components/ContractsReportSection'
import { FinancialReportSection } from '../components/FinancialReportSection'
import { HumanResourcesReportSection } from '../components/HumanResourcesReportSection'
import { usePublicReports } from '../hooks/useReports'
import '@/modules/public/public-portal.css'

export function ReportsIndicatorsPage() {
  const [exercise, setExercise] = useState<number | null>(null)
  const page = usePublicReports()

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

  const selectedExercise =
    exercise !== null && page.data.availableExercises.includes(exercise)
      ? exercise
      : Math.max(...page.data.availableExercises)
  const history = page.data.indicators.toSorted(
    (first, second) => first.exercise - second.exercise,
  )
  const current = history.find(
    (indicator) => indicator.exercise === selectedExercise,
  )

  if (!current) {
    return (
      <PublicPortalLayout>
        <PublicPageState kind="empty">
          Nenhum relatório ou indicador foi publicado ainda.
        </PublicPageState>
      </PublicPortalLayout>
    )
  }

  const previous = history
    .filter((indicator) => indicator.exercise < current.exercise)
    .at(-1)

  return (
    <PublicPortalLayout>
      <section className="reports-content" aria-labelledby="reports-title">
        <div className="reports-title">
          <h2 id="reports-title">Relatório Financeiro Consolidado</h2>
          <label>
            Ano
            <select
              value={selectedExercise}
              onChange={(event) => setExercise(Number(event.target.value))}
            >
              {page.data.availableExercises
                .toSorted((first, second) => second - first)
                .map((year) => (
                  <option key={year}>{year}</option>
                ))}
            </select>
          </label>
        </div>
        <FinancialReportSection
          current={current}
          history={history}
          selectedExercise={selectedExercise}
        />
        <AdministrativeReportSection
          current={current}
          history={history}
          previous={previous}
          selectedExercise={selectedExercise}
        />
        <ContractsReportSection
          current={current}
          history={history}
          selectedExercise={selectedExercise}
        />
        <HumanResourcesReportSection
          current={current}
          selectedExercise={selectedExercise}
        />
      </section>
    </PublicPortalLayout>
  )
}
