import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { FinancialPage } from './FinancialPage'

describe('FinancialPage', () => {
  it('renders its documents, accordion and empty filter state', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url =
        input instanceof Request
          ? input.url
          : input instanceof URL
            ? input.href
            : input

      if (url.endsWith('/api/public/financial')) {
        return new Response(
          JSON.stringify({
            availableExercises: [2026, 2025],
            periods: [
              {
                exercise: 2026,
                sections: [
                  {
                    id: 'trial-balances',
                    title: '2026 - Balancetes',
                    items: [
                      {
                        id: 'trial-balance-1',
                        title: 'Balancete - 1º trimestre',
                        period: '1º trimestre de 2026',
                        documents: [
                          {
                            id: 'trial-balance-1-pdf',
                            title: 'Baixar PDF',
                            format: 'pdf',
                            url: 'https://example.com/balancete.pdf',
                            category: 'financial',
                            exercise: 2026,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          }),
          { headers: { 'Content-Type': 'application/json' }, status: 200 },
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
