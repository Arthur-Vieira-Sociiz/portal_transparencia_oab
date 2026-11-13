import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { FinancialPage } from './FinancialPage'

describe('FinancialPage', () => {
  it('renders its documents, accordion and empty filter state', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/public/financeiro']}>
          <FinancialPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Financeiro' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Balancete - 1º trimestre')).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'Baixar PDF' }),
    ).not.toHaveLength(0)

    await userEvent.click(
      screen.getByRole('button', { name: '2026 - Balancetes' }),
    )
    expect(
      screen.queryByText('Balancete - 1º trimestre'),
    ).not.toBeInTheDocument()

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
