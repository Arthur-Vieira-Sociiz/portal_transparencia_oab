import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { AdministrativePage } from './AdministrativePage'

vi.mock('../components/AdministrativeEmbed', () => ({
  AdministrativeEmbed: () => (
    <div title="Quantitativo administrativo de inscritos da OAB-AL" />
  ),
}))

describe('AdministrativePage', () => {
  it('renders the organogram and the existing administrative iframe', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/public/administrativo']}>
          <AdministrativePage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Organograma' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /baixar organograma/i }),
    ).toHaveAttribute(
      'href',
      expect.stringContaining('Organograma-OAB-AL-2025_2027.pdf'),
    )
    expect(
      screen.getByTitle('Quantitativo administrativo de inscritos da OAB-AL'),
    ).toBeInTheDocument()
  })
})
