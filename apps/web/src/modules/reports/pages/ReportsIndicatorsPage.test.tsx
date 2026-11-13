import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ReportsIndicatorsPage } from './ReportsIndicatorsPage'
describe('ReportsIndicatorsPage', () => {
  it('renders the consolidated report', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url =
        input instanceof Request
          ? input.url
          : input instanceof URL
            ? input.href
            : input

      if (url.endsWith('/api/public/reports')) {
        const indicator = (exercise: number) => ({
          exercise,
          totalRevenue: 17_436_491.03,
          totalExpense: 17_111_470.67,
          exerciseResult: 325_020.36,
          plannedBudget: 17_600_000,
          executedBudget: 17_111_470.67,
          executionPercentage: 97.2,
          activeLawyers: 17_345,
          interns: 120,
          registeredSocieties: 1_240,
          appointments: 250,
          protocols: 80,
          certificates: 60,
          ombudsmanRequests: 20,
          activeContracts: 15,
          totalContractValue: 2_500_000,
          newBids: 5,
          closedContracts: 3,
          employees: 75,
        })

        return new Response(
          JSON.stringify({
            availableExercises: [2025, 2024],
            indicators: [indicator(2024), indicator(2025)],
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
        <MemoryRouter initialEntries={['/public/relatorios-e-indicadores']}>
          <ReportsIndicatorsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )
    expect(
      await screen.findByRole('heading', {
        name: 'Relatório Financeiro Consolidado',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Receita Total')).toBeInTheDocument()
    expect(
      screen.getByText('Total de Serviços Prestados à Advocacia em 2025'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Relatórios e Indicadores' }),
    ).toHaveClass('category-card--active')
  })
})
