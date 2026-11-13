import { useState } from 'react'

import type { FinancialSectionId } from '@oab-transparencia/contracts'
import {
  PublicFilters,
  PublicPageState,
  PublicSectionHeader,
  PublicSelectField,
} from '@/components/shared/public-page'

import { PublicPortalLayout } from '@/modules/public-shell/components/PublicPortalLayout'
import { FinancialAccordion } from '../components/FinancialAccordion'
import { usePublicFinancial } from '../hooks/useFinancial'
import '@/modules/public/public-portal.css'

export function FinancialPage() {
  const [exercise, setExercise] = useState(2026)
  const [sectionFilter, setSectionFilter] = useState<
    'all' | FinancialSectionId
  >('all')
  const page = usePublicFinancial()

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

  const period = page.data.periods.find((item) => item.exercise === exercise)
  const sections = period?.sections.filter(
    (section) => sectionFilter === 'all' || section.id === sectionFilter,
  )

  return (
    <PublicPortalLayout>
      <section aria-labelledby="financial-title" className="financial-content">
        <PublicSectionHeader
          description="Acompanhe as informações sobre receitas, despesas, balancetes e demonstrativos financeiros."
          id="financial-title"
          title="Financeiro"
        />

        <PublicFilters className="financial-filters">
          <PublicSelectField
            containerClassName="financial-filter"
            id="financial-exercise"
            label="Exercício/Ano"
            onChange={(event) => setExercise(Number(event.target.value))}
            value={exercise}
          >
            {page.data.availableExercises.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </PublicSelectField>

          <PublicSelectField
            containerClassName="financial-filter"
            id="financial-section"
            label="Tipo de informação"
            onChange={(event) =>
              setSectionFilter(event.target.value as 'all' | FinancialSectionId)
            }
            value={sectionFilter}
          >
            <option value="all">Todos</option>
            <option value="trial-balances">Balancetes</option>
            <option value="financial-statements">
              Demonstrativos Financeiros
            </option>
            <option value="revenues">Quadro Sintético de Receitas</option>
            <option value="expenses">Quadro Sintético de Despesas</option>
          </PublicSelectField>
        </PublicFilters>

        {sections && sections.length > 0 ? (
          <FinancialAccordion sections={sections} />
        ) : (
          <p className="financial-empty-state">
            Nenhuma informação publicada para os filtros selecionados.
          </p>
        )}
      </section>
    </PublicPortalLayout>
  )
}
