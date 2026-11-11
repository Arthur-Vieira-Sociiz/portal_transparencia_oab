import { Navigate, createBrowserRouter } from 'react-router-dom'

import { FoundationPage } from '../features/foundation/FoundationPage'
import { AdministrativePage } from '../features/public/pages/AdministrativePage'
import { BudgetPage } from '../features/public/pages/BudgetPage'
import { ContractsPage } from '../features/public/pages/ContractsPage'
import { FinancialPage } from '../features/public/pages/FinancialPage'
import { InstitutionalPage } from '../features/public/pages/InstitutionalPage'
import { HumanResourcesPage } from '../features/public/pages/HumanResourcesPage'
import { LgpdPage } from '../features/public/pages/LgpdPage'
import { GlossaryPage } from '../features/public/pages/GlossaryPage'
import { PatrimonialPage } from '../features/public/pages/PatrimonialPage'

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
    element: (
      <FoundationPage
        description="A autenticação será implementada após a API e o banco."
        title="Entrar no portal administrativo"
      />
    ),
  },
  {
    path: '/admin',
    element: (
      <FoundationPage
        description="A equipe da OAB-AL usará esta área para revisar e publicar informações."
        showApiStatus
        title="Gestão da transparência"
      />
    ),
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
