import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { logout } from '../../lib/api'
import { clearAuthSession, getStoredAuthSession } from './auth-session'

export function AdminHomePage() {
  const navigate = useNavigate()
  const session = getStoredAuthSession()
  const [isSigningOut, setIsSigningOut] = useState(false)

  if (!session) return <Navigate replace to="/login" />
  const authenticatedSession = session

  async function handleLogout() {
    setIsSigningOut(true)
    try {
      await logout(authenticatedSession.token)
    } finally {
      clearAuthSession()
      navigate('/login', { replace: true })
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-6 md:p-9">
      <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-bold tracking-[0.08em] text-[#ff3557]">
            OAB ALAGOAS
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-primary">
            Gestão da transparência
          </h1>
        </div>
        <Button
          disabled={isSigningOut}
          onClick={handleLogout}
          type="button"
          variant="outline"
        >
          <LogOut aria-hidden="true" size={16} />
          {isSigningOut ? 'Saindo…' : 'Sair'}
        </Button>
      </header>

      <Card className="mt-7 max-w-xl">
        <CardContent className="grid gap-1 p-6 text-muted-foreground">
          <p className="text-sm">Você entrou como</p>
          <strong className="text-xl text-primary">
            {authenticatedSession.user.name}
          </strong>
          <span className="text-sm">
            {authenticatedSession.user.email} · {authenticatedSession.user.role}
          </span>
        </CardContent>
      </Card>
    </main>
  )
}
