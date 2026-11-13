import { useState } from 'react'

import type { TransparencyDocument } from '@oab-transparencia/contracts'
import {
  PublicFilters,
  PublicPageState,
  PublicSelectField,
} from '@/components/shared/public-page'

import { formatCurrency } from '../../../lib/formatters'
import { PublicPortalLayout } from '@/modules/public-shell/components/PublicPortalLayout'
import { usePublicContracts } from '../hooks/useContracts'
import '@/modules/public-shell/styles/public-portal.css'

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function ContractDocumentIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </svg>
  )
}

function ViewIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function DocumentLink({
  document,
  label,
}: {
  document: TransparencyDocument
  label: string
}) {
  return (
    <a
      aria-label={label}
      className="contracts-document-link"
      href={document.url}
      rel="noreferrer"
      target="_blank"
    >
      <ViewIcon />
      <span>{label}</span>
    </a>
  )
}

export function ContractsPage() {
  const [search, setSearch] = useState('')
  const [exercise, setExercise] = useState<'all' | number>(2026)
  const [supplier, setSupplier] = useState('all')
  const page = usePublicContracts()

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

  const suppliers = [
    ...new Set(page.data.contracts.map((contract) => contract.supplier)),
  ]
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR')
  const contracts = page.data.contracts.filter((contract) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [contract.supplier, contract.cnpj, contract.objectDescription ?? ''].some(
        (value) => value.toLocaleLowerCase('pt-BR').includes(normalizedSearch),
      )

    return (
      matchesSearch &&
      (exercise === 'all' || contract.exercise === exercise) &&
      (supplier === 'all' || contract.supplier === supplier)
    )
  })

  return (
    <PublicPortalLayout>
      <section aria-labelledby="contracts-title" className="contracts-content">
        <div className="contracts-top-bar">
          <div>
            <h2 className="public-section-title" id="contracts-title">
              Contratos e Licitacoes
            </h2>
            <p>
              Relatorio de contratos vigentes contendo informacoes sobre as
              partes, a data do contrato, sua vigencia e o valor.
            </p>
          </div>
          <label className="contracts-search" htmlFor="contracts-search-input">
            <SearchIcon />
            <span className="visually-hidden">Buscar contratos</span>
            <input
              id="contracts-search-input"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar"
              type="search"
              value={search}
            />
          </label>
        </div>

        <PublicFilters className="contracts-filters">
          <PublicSelectField
            containerClassName="contracts-filter"
            id="contracts-exercise"
            label="Ano"
            onChange={(event) =>
              setExercise(
                event.target.value === 'all'
                  ? 'all'
                  : Number(event.target.value),
              )
            }
            value={exercise}
          >
            <option value="all">Todos</option>
            {page.data.availableExercises.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </PublicSelectField>

          <PublicSelectField
            containerClassName="contracts-filter"
            id="contracts-supplier"
            label="Fornecedor"
            onChange={(event) => setSupplier(event.target.value)}
            value={supplier}
          >
            <option value="all">Todos os fornecedores</option>
            {suppliers.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </PublicSelectField>
        </PublicFilters>

        {contracts.length > 0 ? (
          <div className="contracts-grid">
            {contracts.map((contract) => (
              <article className="contract-card" key={contract.id}>
                <div className="contract-card__document">
                  <ContractDocumentIcon />
                  <span className="contract-card__pdf-badge">PDF</span>
                  {contract.contractDocument ? (
                    <DocumentLink
                      document={contract.contractDocument}
                      label="Visualizar contrato"
                    />
                  ) : null}
                </div>
                <div className="contract-card__info">
                  <h3>{contract.supplier}</h3>
                  <p>
                    <strong>CNPJ:</strong> {contract.cnpj}
                  </p>
                  <p>
                    <strong>Vigencia:</strong> {contract.term}
                  </p>
                  <p>
                    <strong>Valor:</strong> {formatCurrency(contract.value)}
                  </p>
                  {contract.amendments.length > 0 ? (
                    <div className="contract-card__amendments">
                      <span>Aditivos:</span>
                      {contract.amendments.map((amendment) => (
                        <a
                          aria-label={amendment.title}
                          className="contract-amendment-link"
                          href={amendment.url}
                          key={amendment.id}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <ContractDocumentIcon />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="contracts-empty-state">
            Nenhum contrato encontrado para os filtros selecionados.
          </p>
        )}
      </section>
    </PublicPortalLayout>
  )
}
