import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { BudgetPage } from './BudgetPage'

describe('BudgetPage', () => {
  it('renders an empty budget table when there are no published records', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url =
        input instanceof Request
          ? input.url
          : input instanceof URL
            ? input.href
            : input

      if (url.endsWith('/api/public/budget')) {
        return new Response(
          JSON.stringify({ code: 'NOT_FOUND', message: 'Não encontrado.' }),
          { headers: { 'Content-Type': 'application/json' }, status: 404 },
        )
      }

      if (url.endsWith('/api/public/general-data')) {
        return new Response(
          JSON.stringify({
            id: 'general-data-test',
            exercise: 2026,
            totalExpenses: 17_111_470.67,
            totalRevenue: 17_436_491.03,
            budget: 17_600_000,
            patrimony: 8_250_000,
            activeLawyers: 17_345,
            activeSocieties: 1_240,
            supportRooms: 12,
            registeredMembers: 18_585,
            status: 'PUBLISHED',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            publishedAt: '2026-01-01T00:00:00.000Z',
          }),
          { headers: { 'Content-Type': 'application/json' }, status: 200 },
        )
      }

      throw new Error(`Requisição não simulada no teste: ${url}`)
    })

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
