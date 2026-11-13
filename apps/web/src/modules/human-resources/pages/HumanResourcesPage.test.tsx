import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { HumanResourcesPage } from './HumanResourcesPage'
import { humanResourcesMonths } from '../data/human-resources.constants'

describe('HumanResourcesPage', () => {
  it('renders the monthly records and filters by exercise and locality', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url =
        input instanceof Request
          ? input.url
          : input instanceof URL
            ? input.href
            : input

      if (url.endsWith('/api/public/human-resources')) {
        const record = (exercise: number, locality: string) => ({
          exercise,
          locality,
          months: humanResourcesMonths.map(({ id, label }) => ({
            month: id,
            documents: [
              {
                id: `hr-${exercise}-${id}-pdf`,
                title: 'Baixar PDF',
                format: 'pdf',
                url: `https://example.com/${exercise}/${label}.pdf`,
                category: 'human-resources',
                exercise,
              },
            ],
          })),
        })

        return new Response(
          JSON.stringify({
            availableExercises: [2026, 2025],
            records: [
              record(2026, 'JACARECICA'),
              record(2025, 'MACEIÓ - CENTRO'),
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
