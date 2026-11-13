import { Navigate, createBrowserRouter, useParams } from 'react-router-dom'

import { FoundationPage } from '../modules/foundation/FoundationPage'
import { AdminHomePage } from '../modules/general-data/pages/AdminHomePage'
import { AdminBudgetPage } from '../modules/budget/pages/AdminBudgetPage'
import { AdminFinancialPage } from '../modules/financial/pages/AdminFinancialPage'
import { AdminPatrimonialPage } from '../modules/auth/AdminPatrimonialPage'
import { AdminContractsPage } from '../modules/auth/AdminContractsPage'
import { AdminHumanResourcesPage } from '../modules/auth/AdminHumanResourcesPage'
import { AdminReportsIndicatorsPage } from '../modules/auth/AdminReportsIndicatorsPage'
import { AdminUsersPage } from '../modules/auth/AdminUsersPage'
import { AdminSectionPlaceholderPage } from '../modules/auth/AdminSectionPlaceholderPage'
import { LoginPage } from '../modules/auth/LoginPage'
import { AdministrativePage } from '../modules/public/pages/AdministrativePage'
import { BudgetPage } from '../modules/budget/pages/BudgetPage'
import { ContractsPage } from '../modules/public/pages/ContractsPage'
import { FinancialPage } from '../modules/financial/pages/FinancialPage'
import { InstitutionalPage } from '../modules/public/pages/InstitutionalPage'
import { HumanResourcesPage } from '../modules/public/pages/HumanResourcesPage'
import { LgpdPage } from '../modules/public/pages/LgpdPage'
import { GlossaryPage } from '../modules/public/pages/GlossaryPage'
import { PatrimonialPage } from '../modules/public/pages/PatrimonialPage'
import { ReportsIndicatorsPage } from '../modules/public/pages/ReportsIndicatorsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate replace to="/public/institucional" />,
  },
  {
    path: '/public',
    element: <Navigate replace to="/public/institucional" />,
  },
  {
    path: '/public/institucional',
    element: <InstitutionalPage />,
  },
  {
    path: '/public/administrativo',
    element: <AdministrativePage />,
  },
  {
    path: '/public/orcamentario',
    element: <BudgetPage />,
  },
  {
    path: '/public/financeiro',
    element: <FinancialPage />,
  },
  {
    path: '/public/patrimonial',
    element: <PatrimonialPage />,
  },
  {
    path: '/public/recursos-humanos',
    element: <HumanResourcesPage />,
  },
  {
    path: '/public/contratos-e-licitacoes',
    element: <ContractsPage />,
  },
  {
    path: '/public/glossario',
    element: <GlossaryPage />,
  },
  {
    path: '/public/lgpd',
    element: <LgpdPage />,
  },
  {
    path: '/public/relatorios-e-indicadores',
    element: <ReportsIndicatorsPage />,
  },
  {
    path: '/public/:section',
    element: (
      <FoundationPage
        description="Esta categoria será reproduzida a partir do mesmo conjunto de componentes da página Institucional."
        title="Portal da Transparência OAB-AL"
      />
    ),
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <AdminHomePage />,
  },
  {
    path: '/admin/orcamentario',
    element: <AdminBudgetPage />,
  },
  {
    path: '/admin/financeiro',
    element: <AdminFinancialPage />,
  },
  {
    path: '/admin/patrimonial',
    element: <AdminPatrimonialPage />,
  },
  {
    path: '/admin/contratos-e-licitacoes',
    element: <AdminContractsPage />,
  },
  {
    path: '/admin/recursos-humanos',
    element: <AdminHumanResourcesPage />,
  },
  {
    path: '/admin/relatorios-e-indicadores',
    element: <AdminReportsIndicatorsPage />,
  },
  {
    path: '/admin/usuarios',
    element: <AdminUsersPage />,
  },
  {
    path: '/admin/:section',
    element: <AdminSectionRoute />,
  },
  {
    path: '*',
    element: (
      <FoundationPage
        description="Verifique o endereço ou volte para a área pública."
        title="Este endereço não existe"
      />
    ),
  },
])

function AdminSectionRoute() {
  const { section = 'dashboard' } = useParams()
  return <AdminSectionPlaceholderPage section={section} />
}
