import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import type {
  FinancialSectionId,
  TransparencyDocument,
} from '@oab-transparencia/contracts'
import { getPublicFinancialPage } from '../../../lib/api'

import { PublicPortalLayout } from '../components/PublicPortalLayout'
import { localPublicTransparencyRepository } from '../data/public.repository'
import '../public-portal.css'

function DownloadIcon() {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5M12 15V3" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function DownloadLink({ document }: { document: TransparencyDocument }) {
  return (
    <a
      className="financial-download"
      href={document.url}
      rel="noreferrer"
      target="_blank"
    >
      <DownloadIcon />
      {document.title}
    </a>
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
    return <p className="public-page-state">Carregando informações…</p>
  }

  if (page.isError) {
    return (
      <p className="public-page-state">
        Não foi possível carregar as informações.
      </p>
    )
  }

  const period = page.data.periods.find((item) => item.exercise === exercise)
  const sections = period?.sections.filter(
    (section) => sectionFilter === 'all' || section.id === sectionFilter,
  )

  return (
    <PublicPortalLayout>
      <section aria-labelledby="financial-title" className="financial-content">
        <h2 className="public-section-title" id="financial-title">
          Financeiro
        </h2>
        <p className="financial-content__intro">
          Acompanhe as informações sobre receitas, despesas, balancetes e
          demonstrativos financeiros.
        </p>

        <div className="financial-filters">
          <label className="financial-filter" htmlFor="financial-exercise">
            <span>Exercício/Ano</span>
            <select
              id="financial-exercise"
              onChange={(event) => setExercise(Number(event.target.value))}
              value={exercise}
            >
              {page.data.availableExercises.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>

          <label className="financial-filter" htmlFor="financial-section">
            <span>Tipo de informação</span>
            <select
              id="financial-section"
              onChange={(event) =>
                setSectionFilter(
                  event.target.value as 'all' | FinancialSectionId,
                )
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
            </select>
          </label>
        </div>

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
                              <DownloadLink
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
