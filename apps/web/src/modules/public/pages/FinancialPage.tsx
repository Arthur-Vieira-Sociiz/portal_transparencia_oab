import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import type { FinancialSectionId } from '@oab-transparencia/contracts'
import {
  PublicDownloadLink,
  PublicFilters,
  PublicPageState,
  PublicSectionHeader,
  PublicSelectField,
} from '@/components/shared/public-page'
import { getPublicFinancialPage } from '../../../lib/api'

import { PublicPortalLayout } from '@/modules/public-shell/components/PublicPortalLayout'
import { localPublicTransparencyRepository } from '../data/public.repository'
import '../public-portal.css'

function ChevronIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function FinancialPage() {
  const [exercise, setExercise] = useState(2026)
  const [sectionFilter, setSectionFilter] = useState<
    'all' | FinancialSectionId
  >('all')
  const [openSections, setOpenSections] = useState<Set<FinancialSectionId>>(
    () => new Set(['trial-balances']),
  )
  const page = useQuery({
    queryFn: () =>
      import.meta.env.MODE === 'test'
        ? localPublicTransparencyRepository.getFinancialPage()
        : getPublicFinancialPage(),
    queryKey: ['public-transparency', 'financial'],
    staleTime: Number.POSITIVE_INFINITY,
  })

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
          <div className="financial-accordion">
            {sections.map((section) => {
              const isOpen = openSections.has(section.id)

              return (
                <article className="financial-accordion__item" key={section.id}>
                  <h3>
                    <button
                      aria-expanded={isOpen}
                      className="financial-accordion__trigger"
                      onClick={() =>
                        setOpenSections((current) => {
                          const next = new Set(current)
                          if (next.has(section.id)) next.delete(section.id)
                          else next.add(section.id)
                          return next
                        })
                      }
                      type="button"
                    >
                      <span>{section.title}</span>
                      <ChevronIcon />
                    </button>
                  </h3>
                  {isOpen ? (
                    <div className="financial-accordion__content">
                      {section.items.map((item) => (
                        <div className="financial-document-row" key={item.id}>
                          <span>{item.title}</span>
                          <div className="financial-document-row__actions">
                            {item.documents.map((document) => (
                              <PublicDownloadLink
                                className="financial-download"
                                document={document}
                                key={document.id}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        ) : (
          <p className="financial-empty-state">
            Nenhuma informação publicada para os filtros selecionados.
          </p>
        )}
      </section>
    </PublicPortalLayout>
  )
}
