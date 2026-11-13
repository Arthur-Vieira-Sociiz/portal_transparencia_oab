import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LockKeyhole } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from './data/auth.api'
import { saveAuthSession } from './auth-session'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const session = await login({ email, password })
      saveAuthSession(session)
      navigate('/admin', { replace: true })
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível entrar no portal.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6f9] p-7 sm:p-10">
      <Card
        aria-labelledby="login-title"
        className="w-full max-w-[446px] rounded-2xl border-0 shadow-xl shadow-[#071d48]/10"
      >
        <CardHeader className="flex flex-col items-center px-10 pt-10 text-center sm:px-12 sm:pt-11">
          <div className="flex size-14 items-center justify-center rounded-full bg-[#223149] text-base font-bold text-white">
            OAB
          </div>
          <CardTitle className="pt-1 text-2xl" id="login-title">
            Painel Administrativo
          </CardTitle>
          <CardDescription className="max-w-[310px] text-center text-sm leading-5">
            Sistema de Gestão do Portal da Transparência — OAB Alagoas
          </CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-10 sm:px-12 sm:pb-11">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Usuário ou E-mail</Label>
              <Input
                autoComplete="email"
                className="rounded-none border-0 border-b border-[#52617a] bg-[#f1f1f1] px-4 text-sm focus:border-[#223149] focus:ring-0"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                autoComplete="current-password"
                className="rounded-none border-0 border-b border-[#52617a] bg-[#f1f1f1] px-4 text-sm focus:border-[#223149] focus:ring-0"
                id="password"
                minLength={12}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </div>

            {errorMessage ? (
              <p
                aria-live="polite"
                className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm leading-5 text-rose-900"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}

            <Button
              className="mt-1 w-full rounded-full bg-[#223149]"
              disabled={isSubmitting}
              type="submit"
            >
              <LockKeyhole aria-hidden="true" size={17} />
              {isSubmitting ? 'Entrando…' : 'Entrar no Painel'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
