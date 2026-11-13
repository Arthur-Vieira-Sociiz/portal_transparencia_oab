import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { GlossaryPage } from './GlossaryPage'

describe('GlossaryPage', () => {
  it('shows the static terms grouped by their initial letter', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/public/glossario']}>
          <GlossaryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Glossário Contábil e Administrativo',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Acesso público')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'B' }))
    expect(screen.getByText('Baixar CSV')).toBeInTheDocument()
    expect(screen.queryByText('Acesso público')).not.toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Glossário' })).toHaveClass(
      'category-card--active',
    )
  })
})
