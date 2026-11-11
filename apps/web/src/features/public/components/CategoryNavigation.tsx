import { NavLink } from 'react-router-dom'

import administrativeIcon from '../../../assets/category-icons/administrative.png'
import budgetIcon from '../../../assets/category-icons/budget.png'
import contractsIcon from '../../../assets/category-icons/contracts.png'
import financialIcon from '../../../assets/category-icons/financial.png'
import glossaryIcon from '../../../assets/category-icons/glossary.png'
import humanResourcesIcon from '../../../assets/category-icons/human-resources.png'
import institutionalIcon from '../../../assets/category-icons/institutional.png'
import lgpdIcon from '../../../assets/category-icons/lgpd.png'
import patrimonialIcon from '../../../assets/category-icons/patrimonial.png'
import reportsIcon from '../../../assets/category-icons/reports.png'

const categories: Array<{ icon: string; label: string; slug: string }> = [
  { icon: institutionalIcon, label: 'Institucional', slug: 'institucional' },
  { icon: administrativeIcon, label: 'Administrativo', slug: 'administrativo' },
  { icon: budgetIcon, label: 'Orçamentário', slug: 'orcamentario' },
  { icon: financialIcon, label: 'Financeiro', slug: 'financeiro' },
  { icon: patrimonialIcon, label: 'Patrimonial', slug: 'patrimonial' },
  { icon: contractsIcon, label: 'Contratos', slug: 'contratos-e-licitacoes' },
  {
    icon: humanResourcesIcon,
    label: 'Recursos Humanos',
    slug: 'recursos-humanos',
  },
  {
    icon: reportsIcon,
    label: 'Relatórios e Indicadores',
    slug: 'relatorios-e-indicadores',
  },
  { icon: glossaryIcon, label: 'Glossário', slug: 'glossario' },
  { icon: lgpdIcon, label: 'LGPD', slug: 'lgpd' },
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
            <img alt="" className="category-card__icon" src={icon} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
