import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { PatrimonialPage } from './PatrimonialPage'

describe('PatrimonialPage', () => {
  it('renders its assets and filters them by exercise and status', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url =
        input instanceof Request
          ? input.url
          : input instanceof URL
            ? input.href
            : input

      if (url.endsWith('/api/public/patrimonial')) {
        return new Response(
          JSON.stringify({
            availableExercises: [2026, 2025],
            assets: [
              {
                id: 'asset-headquarters-jacarecica',
                informationType: 'Imóvel',
                description: 'Sede administrativa da OAB/AL',
                location: 'Jacarecica, Maceió/AL',
                acquisitionValue: 8_750_000,
                status: 'Ativo',
                exercise: 2026,
              },
              {
                id: 'asset-support-room-arapiraca',
                informationType: 'Mobiliário',
                description: 'Mobiliário da sala de apoio à advocacia',
                location: 'Arapiraca/AL',
                acquisitionValue: 186_400,
                status: 'Locado',
                exercise: 2026,
              },
              {
                id: 'asset-it-equipment',
                informationType: 'Equipamentos de informática',
                description: 'Estações de trabalho e equipamentos de rede',
                location: 'Jacarecica, Maceió/AL',
                acquisitionValue: 242_800,
                status: 'Emprestado',
                exercise: 2025,
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
