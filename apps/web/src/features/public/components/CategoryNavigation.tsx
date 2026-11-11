import { NavLink } from 'react-router-dom'

import { PublicIcon, type PublicIconName } from './PublicIcon'

const categories: Array<{ icon: PublicIconName; label: string; slug: string }> =
  [
    { icon: 'institutional', label: 'Institucional', slug: 'institucional' },
    { icon: 'administrative', label: 'Administrativo', slug: 'administrativo' },
    { icon: 'budget', label: 'Orçamentário', slug: 'orcamentario' },
    { icon: 'financial', label: 'Financeiro', slug: 'financeiro' },
    { icon: 'patrimony', label: 'Patrimonial', slug: 'patrimonial' },
    { icon: 'contracts', label: 'Contratos', slug: 'contratos-e-licitacoes' },
    { icon: 'lawyers', label: 'Recursos Humanos', slug: 'recursos-humanos' },
    {
      icon: 'reports',
      label: 'Relatórios e Indicadores',
      slug: 'relatorios-e-indicadores',
    },
    { icon: 'glossary', label: 'Glossário', slug: 'glossario' },
    { icon: 'lgpd', label: 'LGPD', slug: 'lgpd' },
  ]

export function CategoryNavigation() {
  return (
    <nav
      aria-labelledby="category-navigation-title"
      className="category-navigation"
    >
      <h2 className="public-section-title" id="category-navigation-title">
        Explorar por categoria
      </h2>
      <div className="category-grid">
        {categories.map(({ icon, label, slug }) => (
          <NavLink
            className={({ isActive }) =>
              `category-card${isActive ? ' category-card--active' : ''}`
            }
            key={slug}
            to={`/public/${slug}`}
          >
            <PublicIcon name={icon} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
