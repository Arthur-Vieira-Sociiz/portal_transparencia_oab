import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import {
  PublicFilters,
  PublicPageState,
  PublicSectionHeader,
  PublicSelectField,
  PublicTableScroll,
} from '@/components/shared/public-page'

import { formatCurrency } from '../../../lib/formatters'
import { getPublicPatrimonialPage } from '../../../lib/api'
import { PublicPortalLayout } from '@/modules/public-shell/components/PublicPortalLayout'
import { localPublicTransparencyRepository } from '../data/public.repository'
import '../public-portal.css'

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

function statusClass(status: string) {
  return `patrimonial-status patrimonial-status--${status
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()}`
}

export function PatrimonialPage() {
  const [exercise, setExercise] = useState(2026)
  const [informationType, setInformationType] = useState('all')
  const [status, setStatus] = useState('all')
  const page = useQuery({
    queryFn: () =>
      import.meta.env.MODE === 'test'
        ? localPublicTransparencyRepository.getPatrimonialPage()
        : getPublicPatrimonialPage(),
    queryKey: ['public-transparency', 'patrimonial'],
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

  const informationTypes = [
    'Imóvel',
    'Mobiliário',
    'Equipamentos de informática',
  ]
  const statuses = ['Ativo', 'Locado', 'Emprestado']
  const assets = page.data.assets.filter(
    (asset) =>
      asset.exercise === exercise &&
      (informationType === 'all' ||
        asset.informationType === informationType) &&
      (status === 'all' || asset.status === status),
  )
  return (
    <PublicPortalLayout>
      <section
        aria-labelledby="patrimonial-title"
        className="patrimonial-content"
      >
        <PublicSectionHeader
          description="Aqui você encontra os bens pertencentes à OAB Alagoas e informações consolidadas sobre o patrimônio institucional. Use os filtros abaixo para localizar dados por ano, tipo de bem ou situação."
          id="patrimonial-title"
          title="Patrimonial"
        />

        <PublicFilters className="patrimonial-filters">
          <PublicSelectField
            containerClassName="patrimonial-filter"
            id="patrimonial-exercise"
            label="Ano"
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
            containerClassName="patrimonial-filter"
            id="patrimonial-type"
            label="Tipo de bem"
            onChange={(event) => setInformationType(event.target.value)}
            value={informationType}
          >
            <option value="all">Todos os tipos</option>
            {informationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </PublicSelectField>

          <PublicSelectField
            containerClassName="patrimonial-filter"
            id="patrimonial-status"
            label="Situação"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            <option value="all">Todas</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </PublicSelectField>
        </PublicFilters>

        <PublicTableScroll className="patrimonial-table-scroll">
          <table className="patrimonial-table">
            <thead>
              <tr>
                <th>Tipo de informação</th>
                <th>Descrição</th>
                <th>Localização</th>
                <th>Aquisição (R$)</th>
                <th>Situação</th>
                <th>Exercício</th>
                <th>Documento</th>
              </tr>
            </thead>
            <tbody>
              {assets.length > 0 ? (
                assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.informationType}</td>
                    <td>{asset.description}</td>
                    <td>{asset.location}</td>
                    <td>{formatCurrency(asset.acquisitionValue)}</td>
                    <td>
                      <span className={statusClass(asset.status)}>
                        {asset.status}
                      </span>
                    </td>
                    <td>{asset.exercise}</td>
                    <td>
                      {asset.document ? (
                        <a
                          aria-label={`Visualizar ${asset.document.title}`}
                          className="patrimonial-document-link"
                          href={asset.document.url}
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
                  <td className="patrimonial-table__empty" colSpan={7}>
                    Nenhum bem encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </PublicTableScroll>
      </section>
    </PublicPortalLayout>
  )
}
