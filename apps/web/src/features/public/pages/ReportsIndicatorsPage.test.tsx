import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ReportsIndicatorsPage } from './ReportsIndicatorsPage'
describe('ReportsIndicatorsPage', () => {
  it('renders the consolidated report', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/public/relatorios-e-indicadores']}>
          <ReportsIndicatorsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )
    expect(
      await screen.findByRole('heading', {
        name: 'Relatório Financeiro Consolidado',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Receita Total')).toBeInTheDocument()
    expect(
      screen.getByText('Total de Serviços Prestados à Advocacia em 2025'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Relatórios e Indicadores' }),
    ).toHaveClass('category-card--active')
  })
})
