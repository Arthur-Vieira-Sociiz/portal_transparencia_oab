import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { BudgetPage } from './BudgetPage'

describe('BudgetPage', () => {
  it('renders an empty budget table when there are no published records', async () => {
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
    expect(
      screen.getByText(
        'Nenhuma informação publicada para os filtros selecionados.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Orçamentário' })).toHaveClass(
      'category-card--active',
    )
  })
})
