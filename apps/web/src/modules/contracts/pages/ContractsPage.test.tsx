import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { ContractsPage } from './ContractsPage'

describe('ContractsPage', () => {
  it('filters contracts by exercise, supplier and search terms', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url =
        input instanceof Request
          ? input.url
          : input instanceof URL
            ? input.href
            : input

      if (url.endsWith('/api/public/contracts')) {
        const document = (id: string, title: string, exercise: number) => ({
          id,
          title,
          format: 'pdf',
          url: `https://example.com/${id}.pdf`,
          category: 'contracts-and-bids',
          exercise,
        })
        return new Response(
          JSON.stringify({
            availableExercises: [2026, 2025],
            contracts: [
              {
                id: 'contract-acom-2026',
                supplier: 'ACOM SISTEMAS CORPORATIVOS LTDA',
                cnpj: '00.000.000/0000-00',
                objectDescription:
                  'Licenciamento e suporte de sistemas corporativos.',
                signedAt: '02/01/2026',
                term: '02/01/2026 a 01/01/2027',
                value: 214_124,
                exercise: 2026,
                contractDocument: document(
                  'contract-acom-2026',
                  'Contrato ACOM 2026',
                  2026,
                ),
                amendments: [
                  document('amendment-acom-2026', '1º termo aditivo', 2026),
                ],
              },
              {
                id: 'contract-sociiz-2025',
                supplier: 'Sociiz',
                cnpj: '98.765.432/0001-10',
                objectDescription: 'Desenvolvimento web.',
                signedAt: '15/03/2025',
                term: '15/03/2025 a 14/03/2026',
                value: 72_000,
                exercise: 2025,
                contractDocument: document(
                  'contract-sociiz-2025',
                  'Contrato Sociiz 2025',
                  2025,
                ),
                amendments: [],
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
        <MemoryRouter initialEntries={['/public/contratos-e-licitacoes']}>
          <ContractsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Contratos e Licitacoes' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'ACOM SISTEMAS CORPORATIVOS LTDA' }),
    ).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText('Ano'), '2025')
    expect(screen.getByRole('heading', { name: 'Sociiz' })).toBeInTheDocument()

    await userEvent.type(
      screen.getByLabelText('Buscar contratos'),
      'inexistente',
    )
    expect(
      screen.getByText(
        'Nenhum contrato encontrado para os filtros selecionados.',
      ),
    ).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Contratos' })).toHaveClass(
      'category-card--active',
    )
  })
})
