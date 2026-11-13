import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { clearAuthSession } from './auth-session'
import { LoginPage } from './LoginPage'

afterEach(() => {
  cleanup()
  clearAuthSession()
  vi.unstubAllGlobals()
})

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route element={<LoginPage />} path="/login" />
        <Route element={<p>Área administrativa</p>} path="/admin" />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  it('shows the message returned by an invalid login', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ message: 'E-mail ou senha inválidos.' }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 401,
          },
        ),
      ),
    )
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(
      screen.getByLabelText('Usuário ou E-mail'),
      'admin@oab-al.org.br',
    )
    await user.type(screen.getByLabelText('Senha'), 'uma-senha-longa-de-teste')
    await user.click(screen.getByRole('button', { name: 'Entrar no Painel' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'E-mail ou senha inválidos.',
    )
  })

  it('saves a successful session and redirects to the admin area', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            expiresAt: '2030-01-01T00:00:00.000Z',
            token: 'token-de-teste',
            user: {
              email: 'admin@oab-al.org.br',
              id: 'user-1',
              name: 'Equipe OAB',
              role: 'ADMIN',
            },
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
          },
        ),
      ),
    )
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(
      screen.getByLabelText('Usuário ou E-mail'),
      'admin@oab-al.org.br',
    )
    await user.type(screen.getByLabelText('Senha'), 'uma-senha-longa-de-teste')
    await user.click(screen.getByRole('button', { name: 'Entrar no Painel' }))

    expect(await screen.findByText('Área administrativa')).toBeInTheDocument()
  })
})
