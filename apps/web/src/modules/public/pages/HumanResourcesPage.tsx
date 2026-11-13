import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import {
  PublicDownloadLink,
  PublicFilters,
  PublicPageState,
  PublicSectionHeader,
  PublicSelectField,
} from '@/components/shared/public-page'
import { getPublicHumanResourcesPage } from '../../../lib/api'

import { PublicPortalLayout } from '@/modules/public-shell/components/PublicPortalLayout'
import { humanResourcesMonths } from '../data/human-resources.fixture'
import { localPublicTransparencyRepository } from '../data/public.repository'
import '../public-portal.css'

const monthLabels = Object.fromEntries(
  humanResourcesMonths.map(({ id, label }) => [id, label]),
)

export function HumanResourcesPage() {
  const [exercise, setExercise] = useState(2026)
  const [locality, setLocality] = useState('JACARECICA')
  const page = useQuery({
    queryFn: () =>
      import.meta.env.MODE === 'test'
        ? localPublicTransparencyRepository.getHumanResourcesPage()
        : getPublicHumanResourcesPage(),
    queryKey: ['public-transparency', 'human-resources'],
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

  const localities = [
    ...new Set(page.data.records.map((record) => record.locality)),
  ]
  const selectedExercise = page.data.availableExercises.includes(exercise)
    ? exercise
    : page.data.availableExercises[0]
  const selectedLocality = localities.includes(locality)
    ? locality
    : localities[0]
  const record = page.data.records.find(
    (item) =>
      item.exercise === selectedExercise && item.locality === selectedLocality,
  )

  return (
    <PublicPortalLayout>
      <section
        aria-labelledby="human-resources-title"
        className="human-resources-content"
      >
        <PublicSectionHeader
          description="Acompanhe as informações sobre o quadro de pessoal, cargos, vínculos e remunerações."
          id="human-resources-title"
          title="Recursos Humanos"
        />

        <PublicFilters className="human-resources-filters">
          <PublicSelectField
            containerClassName="human-resources-filter"
            id="human-resources-exercise"
            label="Ano"
            onChange={(event) => setExercise(Number(event.target.value))}
            value={selectedExercise ?? ''}
          >
            {page.data.availableExercises.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </PublicSelectField>

          <PublicSelectField
            containerClassName="human-resources-filter"
            id="human-resources-locality"
            label="Localidade"
            onChange={(event) => setLocality(event.target.value)}
            value={selectedLocality ?? ''}
          >
            {localities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </PublicSelectField>
        </PublicFilters>

        {record ? (
          <div className="human-resources-list">
            <h3>{`${record.exercise} - Sede OAB/AL - ${record.locality}`}</h3>
            <div className="human-resources-list__body">
              {record.months.map((month) => (
                <div className="human-resources-month" key={month.month}>
                  <span>{monthLabels[month.month]}</span>
                  {month.documents.length > 0 && (
                    <div className="human-resources-month__actions">
                      {month.documents.map((document) => (
                        <PublicDownloadLink
                          className="human-resources-download"
                          document={document}
                          key={document.id}
                        />
                      ))}
                    </div>
                  )}
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
