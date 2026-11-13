import { Navigate, createBrowserRouter } from 'react-router-dom'

import { FoundationPage } from '../modules/foundation/FoundationPage'

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
    lazy: async () => ({
      Component: (
        await import('../modules/institutional/pages/InstitutionalPage')
      ).InstitutionalPage,
    }),
  },
  {
    path: '/public/administrativo',
    lazy: async () => ({
      Component: (
        await import('../modules/administrative/pages/AdministrativePage')
      ).AdministrativePage,
    }),
  },
  {
    path: '/public/orcamentario',
    lazy: async () => ({
      Component: (await import('../modules/budget/pages/BudgetPage'))
        .BudgetPage,
    }),
  },
  {
    path: '/public/financeiro',
    lazy: async () => ({
      Component: (await import('../modules/financial/pages/FinancialPage'))
        .FinancialPage,
    }),
  },
  {
    path: '/public/patrimonial',
    lazy: async () => ({
      Component: (await import('../modules/patrimonial/pages/PatrimonialPage'))
        .PatrimonialPage,
    }),
  },
  {
    path: '/public/recursos-humanos',
    lazy: async () => ({
      Component: (
        await import('../modules/human-resources/pages/HumanResourcesPage')
      ).HumanResourcesPage,
    }),
  },
  {
    path: '/public/contratos-e-licitacoes',
    lazy: async () => ({
      Component: (await import('../modules/contracts/pages/ContractsPage'))
        .ContractsPage,
    }),
  },
  {
    path: '/public/glossario',
    lazy: async () => ({
      Component: (await import('../modules/glossary/pages/GlossaryPage'))
        .GlossaryPage,
    }),
  },
  {
    path: '/public/lgpd',
    lazy: async () => ({
      Component: (await import('../modules/lgpd/pages/LgpdPage')).LgpdPage,
    }),
  },
  {
    path: '/public/relatorios-e-indicadores',
    lazy: async () => ({
      Component: (
        await import('../modules/reports/pages/ReportsIndicatorsPage')
      ).ReportsIndicatorsPage,
    }),
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
    lazy: async () => ({
      Component: (await import('../modules/auth/LoginPage')).LoginPage,
    }),
  },
  {
    path: '/admin',
    lazy: async () => ({
      Component: (await import('../modules/general-data/pages/AdminHomePage'))
        .AdminHomePage,
    }),
  },
  {
    path: '/admin/orcamentario',
    lazy: async () => ({
      Component: (await import('../modules/budget/pages/AdminBudgetPage'))
        .AdminBudgetPage,
    }),
  },
  {
    path: '/admin/financeiro',
    lazy: async () => ({
      Component: (await import('../modules/financial/pages/AdminFinancialPage'))
        .AdminFinancialPage,
    }),
  },
  {
    path: '/admin/patrimonial',
    lazy: async () => ({
      Component: (
        await import('../modules/patrimonial/pages/AdminPatrimonialPage')
      ).AdminPatrimonialPage,
    }),
  },
  {
    path: '/admin/contratos-e-licitacoes',
    lazy: async () => ({
      Component: (await import('../modules/contracts/pages/AdminContractsPage'))
        .AdminContractsPage,
    }),
  },
  {
    path: '/admin/recursos-humanos',
    lazy: async () => ({
      Component: (
        await import('../modules/human-resources/pages/AdminHumanResourcesPage')
      ).AdminHumanResourcesPage,
    }),
  },
  {
    path: '/admin/relatorios-e-indicadores',
    lazy: async () => ({
      Component: (
        await import('../modules/reports/pages/AdminReportsIndicatorsPage')
      ).AdminReportsIndicatorsPage,
    }),
  },
  {
    path: '/admin/usuarios',
    lazy: async () => ({
      Component: (await import('../modules/auth/AdminUsersPage'))
        .AdminUsersPage,
    }),
  },
  {
    path: '/admin/:section',
    lazy: async () => ({
      Component: (await import('../modules/auth/AdminSectionRoute'))
        .AdminSectionRoute,
    }),
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
