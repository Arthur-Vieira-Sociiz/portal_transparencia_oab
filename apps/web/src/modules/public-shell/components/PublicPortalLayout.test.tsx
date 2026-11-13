import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { PublicPortalLayout } from './PublicPortalLayout'

function renderLayout() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <PublicPortalLayout>
          <p>Conteúdo da página</p>
        </PublicPortalLayout>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('PublicPortalLayout', () => {
  it('renders the loading state while the API request is pending', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => undefined)),
    )

    renderLayout()

    expect(
      screen.getByText('Carregando resumo institucional…'),
    ).toBeInTheDocument()
  })

  it('renders the summary returned by the public API', async () => {
    renderLayout()

    expect(await screen.findByText('Despesas totais')).toBeInTheDocument()
    expect(screen.getAllByText('Exercício 2026')).toHaveLength(8)
  })

  it('renders an empty state when there is no published summary', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'Dados não encontrados.' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404,
        }),
      ),
    )

    renderLayout()

    expect(
      await screen.findByText(
        'Nenhum resumo institucional foi publicado ainda.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('Despesas totais')).not.toBeInTheDocument()
  })

  it('renders an explicit error instead of fixture values', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('API offline')))

    renderLayout()

    expect(
      await screen.findByText(
        'Não foi possível carregar o resumo institucional.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('Despesas totais')).not.toBeInTheDocument()
  })
})
