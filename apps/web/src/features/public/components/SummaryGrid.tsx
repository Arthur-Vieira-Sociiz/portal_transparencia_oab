import type { PublicSummary } from '@oab-transparencia/contracts'

import { formatCurrency, formatInteger } from '../../../lib/formatters'
import { PublicIcon, type PublicIconName } from './PublicIcon'

type SummaryGridProps = {
  summary: PublicSummary
}

type SummaryItem = {
  accent: 'blue' | 'green' | 'red'
  icon: PublicIconName
  label: string
  value: string
}

export function SummaryGrid({ summary }: SummaryGridProps) {
  const items: SummaryItem[] = [
    {
      accent: 'red',
      icon: 'expense',
      label: 'Despesas totais',
      value: formatCurrency(summary.totalExpenses),
    },
    {
      accent: 'green',
      icon: 'revenue',
      label: 'Receitas totais',
      value: formatCurrency(summary.totalRevenue),
    },
    {
      accent: 'blue',
      icon: 'budget',
      label: 'Orçamento',
      value: formatCurrency(summary.budget),
    },
    {
      accent: 'blue',
      icon: 'patrimony',
      label: 'Patrimônio',
      value: formatCurrency(summary.patrimony),
    },
    {
      accent: 'blue',
      icon: 'lawyers',
      label: 'Advogados ativos',
      value: formatInteger(summary.activeLawyers),
    },
    {
      accent: 'blue',
      icon: 'societies',
      label: 'Sociedades advocatícias ativas',
      value: formatInteger(summary.activeSocieties),
    },
    {
      accent: 'blue',
      icon: 'rooms',
      label: 'Salas de apoio',
      value: formatInteger(summary.supportRooms),
    },
    {
      accent: 'blue',
      icon: 'subscribers',
      label: 'Qts. de inscritos',
      value: formatInteger(summary.registeredMembers),
    },
  ]

  return (
    <section aria-labelledby="public-summary-title">
      <h1 className="public-page__lead" id="public-summary-title">
        Acesso público às informações financeiras e administrativas da OAB-AL
      </h1>
      <div className="summary-grid">
        {items.map((item) => (
          <article
            className={`summary-card summary-card--${item.accent}`}
            key={item.label}
          >
            <div className="summary-card__label">
              <PublicIcon name={item.icon} />
              <span>{item.label}</span>
            </div>
            <strong className="summary-card__value">{item.value}</strong>
            <span className="summary-card__exercise">
              Exercício {summary.exercise}
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}
