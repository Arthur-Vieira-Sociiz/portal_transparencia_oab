import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { PatrimonialPage } from './PatrimonialPage'

describe('PatrimonialPage', () => {
  it('renders its assets and filters them by exercise and status', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/public/patrimonial']}>
          <PatrimonialPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Patrimonial' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Sede administrativa da OAB/AL'),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Locado')[1]).toHaveClass(
      'patrimonial-status--locado',
    )

    await userEvent.selectOptions(
      screen.getByLabelText('Situação'),
      'Emprestado',
    )
    expect(
      screen.getByText('Nenhum bem encontrado para os filtros selecionados.'),
    ).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText('Ano'), '2025')
    expect(
      screen.getByText('Estações de trabalho e equipamentos de rede'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Patrimonial' })).toHaveClass(
      'category-card--active',
    )
  })
})
