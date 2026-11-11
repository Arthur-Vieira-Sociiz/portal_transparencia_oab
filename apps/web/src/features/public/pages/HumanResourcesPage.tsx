import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import type { TransparencyDocument } from '@oab-transparencia/contracts'

import { PublicPortalLayout } from '../components/PublicPortalLayout'
import { humanResourcesMonths } from '../data/human-resources.fixture'
import { publicSummaryFixture } from '../data/institutional.fixture'
import { localPublicTransparencyRepository } from '../data/public.repository'
import '../public-portal.css'

const monthLabels = Object.fromEntries(
  humanResourcesMonths.map(({ id, label }) => [id, label]),
)

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

function DownloadLink({ document }: { document: TransparencyDocument }) {
  return (
    <a
      className="human-resources-download"
      href={document.url}
      rel="noreferrer"
      target="_blank"
    >
      <DownloadIcon />
      {document.title}
    </a>
  )
}

export function HumanResourcesPage() {
  const [exercise, setExercise] = useState(2026)
  const [locality, setLocality] = useState('JACARECICA')
  const page = useQuery({
    queryFn: () => localPublicTransparencyRepository.getHumanResourcesPage(),
    queryKey: ['public-transparency', 'human-resources'],
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

  const localities = [
    ...new Set(page.data.records.map((record) => record.locality)),
  ]
  const record = page.data.records.find(
    (item) => item.exercise === exercise && item.locality === locality,
  )

  return (
    <PublicPortalLayout summary={{ ...publicSummaryFixture, exercise }}>
      <section
        aria-labelledby="human-resources-title"
        className="human-resources-content"
      >
        <h2 className="public-section-title" id="human-resources-title">
          Recursos Humanos
        </h2>
        <p className="human-resources-content__intro">
          Acompanhe as informações sobre o quadro de pessoal, cargos, vínculos e
          remunerações.
        </p>

        <div className="human-resources-filters">
          <label
            className="human-resources-filter"
            htmlFor="human-resources-exercise"
          >
            <span>Ano</span>
            <select
              id="human-resources-exercise"
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

          <label
            className="human-resources-filter"
            htmlFor="human-resources-locality"
          >
            <span>Localidade</span>
            <select
              id="human-resources-locality"
              onChange={(event) => setLocality(event.target.value)}
              value={locality}
            >
              {localities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        {record ? (
          <div className="human-resources-list">
            <h3>{`${record.exercise} - Sede OAB/AL - ${record.locality}`}</h3>
            <div className="human-resources-list__body">
              {record.months.map((month) => (
                <div className="human-resources-month" key={month.month}>
                  <span>{monthLabels[month.month]}</span>
                  <div className="human-resources-month__actions">
                    {month.documents.map((document) => (
                      <DownloadLink document={document} key={document.id} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="human-resources-empty-state">
            Nenhuma informação publicada para os filtros selecionados.
          </p>
        )}
      </section>
    </PublicPortalLayout>
  )
}
