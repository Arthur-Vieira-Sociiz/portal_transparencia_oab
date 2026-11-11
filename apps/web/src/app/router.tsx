import { Navigate, createBrowserRouter } from 'react-router-dom'

import { FoundationPage } from '../features/foundation/FoundationPage'

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
    path: '/public/:section',
    element: (
      <FoundationPage
        description="A reprodução fiel das dez páginas públicas começa na próxima etapa."
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
