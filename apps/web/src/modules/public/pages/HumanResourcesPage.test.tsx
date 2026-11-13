import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { HumanResourcesPage } from './HumanResourcesPage'

describe('HumanResourcesPage', () => {
  it('renders the monthly records and filters by exercise and locality', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/public/recursos-humanos']}>
          <HumanResourcesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Recursos Humanos' }),
    ).toBeInTheDocument()
    expect(screen.getByText('JANEIRO')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Baixar PDF' })).toHaveLength(12)

    await userEvent.selectOptions(screen.getByLabelText('Ano'), '2025')
    expect(
      screen.getByText(
        'Nenhuma informação publicada para os filtros selecionados.',
      ),
    ).toBeInTheDocument()

    await userEvent.selectOptions(
      screen.getByLabelText('Localidade'),
      'MACEIÓ - CENTRO',
    )
    expect(
      screen.getByRole('heading', {
        name: '2025 - Sede OAB/AL - MACEIÓ - CENTRO',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Recursos Humanos' })).toHaveClass(
      'category-card--active',
    )
  })
})
