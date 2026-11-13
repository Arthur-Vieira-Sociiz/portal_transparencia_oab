import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { ContractsPage } from './ContractsPage'

describe('ContractsPage', () => {
  it('filters contracts by exercise, supplier and search terms', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/public/contratos-e-licitacoes']}>
          <ContractsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Contratos e Licitacoes' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'ACOM SISTEMAS CORPORATIVOS LTDA' }),
    ).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText('Ano'), '2025')
    expect(screen.getByRole('heading', { name: 'Sociiz' })).toBeInTheDocument()

    await userEvent.type(
      screen.getByLabelText('Buscar contratos'),
      'inexistente',
    )
    expect(
      screen.getByText(
        'Nenhum contrato encontrado para os filtros selecionados.',
      ),
    ).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Contratos' })).toHaveClass(
      'category-card--active',
    )
  })
})
