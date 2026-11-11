import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FoundationPage } from './FoundationPage'

describe('FoundationPage', () => {
  it('renders the route context', () => {
    const client = new QueryClient()

    render(
      <QueryClientProvider client={client}>
        <FoundationPage
          description="Conteúdo em construção"
          title="Portal da Transparência"
        />
      </QueryClientProvider>,
    )

    expect(
      screen.getByRole('heading', { name: 'Portal da Transparência' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Conteúdo em construção')).toBeInTheDocument()
  })
})
