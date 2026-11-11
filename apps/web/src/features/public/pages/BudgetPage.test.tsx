import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { BudgetPage } from './BudgetPage'

describe('BudgetPage', () => {
  it('renders the budget table and filters its published data', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/public/orcamentario']}>
          <BudgetPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Visão orçamentária por exercício',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('87,2%')).toBeInTheDocument()
    expect(screen.getByText('95,5%')).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', {
        name: /visualizar proposta orçamentária/i,
      })[0],
    ).toHaveAttribute('href', expect.stringContaining('PropostaOrcamentaria'))
    expect(screen.getByRole('link', { name: 'Orçamentário' })).toHaveClass(
      'category-card--active',
    )

    await userEvent.selectOptions(
      screen.getByLabelText('Exercício/Ano'),
      '2025',
    )

    expect(
      screen.getByText(
        'Nenhuma informação publicada para os filtros selecionados.',
      ),
    ).toBeInTheDocument()
  })
})
