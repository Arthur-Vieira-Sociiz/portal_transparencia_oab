import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { InstitutionalPage } from './InstitutionalPage'

describe('InstitutionalPage', () => {
  it('renders the static institutional content and active category', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/public/institucional']}>
          <InstitutionalPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      await screen.findByRole('heading', { name: /acesso público/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Apresentação da OAB/AL' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Institucional' })).toHaveClass(
      'category-card--active',
    )
  })
})
