import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { LgpdPage } from './LgpdPage'

describe('LgpdPage', () => {
  it('renders the static policy and expands its privacy sections', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/public/lgpd']}>
          <LgpdPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      await screen.findByRole('heading', { name: 'LGPD' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Nossa política de privacidade tem como compromisso/),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Preâmbulo' }))
    expect(screen.getByText(/conceitos de dados pessoais/)).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'LGPD' })).toHaveClass(
      'category-card--active',
    )
  })
})
