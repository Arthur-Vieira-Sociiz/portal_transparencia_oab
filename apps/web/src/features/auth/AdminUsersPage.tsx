import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Check, Copy, KeyRound, Plus, RefreshCw, X } from 'lucide-react'

import type { AdminUser } from '@oab-transparencia/contracts/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { createAdminUser, listAdminUsers } from '../../lib/api'
import { getStoredAuthSession } from './auth-session'
import { AdminShell } from './AdminShell'

const alphabet =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'

function generatePassword() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}

export function AdminUsersPage() {
  const session = getStoredAuthSession()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: generatePassword(),
    role: 'EDITOR' as 'ADMIN' | 'EDITOR',
  })
  const [created, setCreated] = useState<{
    email: string
    password: string
  } | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!session?.token) return
    listAdminUsers(session.token)
      .then(setUsers)
      .catch((error: unknown) =>
        toast({
          title: 'Não foi possível carregar os usuários',
          description:
            error instanceof Error ? error.message : 'Tente novamente.',
          variant: 'error',
        }),
      )
  }, [session?.token, toast])

  if (!session) return <Navigate replace to="/login" />
  if (session.user.role !== 'ADMIN') return <Navigate replace to="/admin" />
  const authenticatedSession = session

  async function submit() {
    setSaving(true)
    try {
      const result = await createAdminUser(authenticatedSession.token, form)
      setUsers((current) =>
        [...current, result.user].sort((a, b) => a.name.localeCompare(b.name)),
      )
      setCreated({
        email: result.user.email,
        password: result.temporaryPassword,
      })
      setForm({
        name: '',
        email: '',
        password: generatePassword(),
        role: 'EDITOR',
      })
    } catch (error) {
      toast({
        title: 'Não foi possível cadastrar o usuário',
        description:
          error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value)
    toast({
      title: `${label} copiado`,
      description: 'O valor foi copiado para a área de transferência.',
      variant: 'success',
    })
  }

  return (
    <AdminShell
      description="Cadastre e gerencie os usuários do painel administrativo."
      title="Usuários"
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Novo usuário</CardTitle>
            <p className="text-sm text-muted-foreground">
              Crie um acesso para a equipe alimentar o portal.
            </p>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="user-name">Nome</Label>
              <Input
                id="user-name"
                onChange={(e) =>
                  setForm((current) => ({ ...current, name: e.target.value }))
                }
                placeholder="Nome completo"
                value={form.name}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-email">E-mail</Label>
              <Input
                id="user-email"
                onChange={(e) =>
                  setForm((current) => ({ ...current, email: e.target.value }))
                }
                placeholder="pessoa@oab-al.org.br"
                type="email"
                value={form.email}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-password">Senha</Label>
              <div className="flex gap-2">
                <Input
                  id="user-password"
                  minLength={12}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      password: e.target.value,
                    }))
                  }
                  type="text"
                  value={form.password}
                />
                <Button
                  aria-label="Gerar senha aleatória"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      password: generatePassword(),
                    }))
                  }
                  title="Gerar senha aleatória"
                  type="button"
                  variant="outline"
                >
                  <RefreshCw size={16} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use pelo menos 12 caracteres. A senha será exibida uma única vez
                após o cadastro.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-role">Perfil</Label>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                id="user-role"
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    role: e.target.value as 'ADMIN' | 'EDITOR',
                  }))
                }
                value={form.role}
              >
                <option value="EDITOR">Editor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <Button
              disabled={
                saving ||
                !form.name.trim() ||
                !form.email.trim() ||
                form.password.length < 12
              }
              onClick={submit}
              type="button"
            >
              <Plus size={16} /> {saving ? 'Cadastrando…' : 'Cadastrar usuário'}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound size={18} /> Usuários cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum usuário cadastrado.
              </p>
            ) : (
              users.map((user) => (
                <div
                  className="rounded-lg border border-border p-3"
                  key={user.id}
                >
                  <strong className="block text-sm">{user.name}</strong>
                  <span className="text-xs text-muted-foreground">
                    {user.email} · {user.role}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {created ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0f1d32]/45 p-4 backdrop-blur-[2px]"
          role="dialog"
        >
          <div className="w-full max-w-lg rounded-xl border border-border bg-white p-6 shadow-[0_24px_70px_rgba(15,29,50,0.24)]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#223149]">
                  Usuário cadastrado
                </h2>
                <p className="mt-1 text-sm text-[#52617a]">
                  Envie estes dados com segurança. A senha não será exibida
                  novamente.
                </p>
              </div>
              <button
                aria-label="Fechar dados do usuário"
                className="flex size-8 items-center justify-center rounded-md border-0 bg-transparent text-[#52617a] hover:bg-black/5"
                onClick={() => setCreated(null)}
                type="button"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-5 grid gap-3">
              <CredentialRow
                label="E-mail"
                value={created.email}
                onCopy={() => copy(created.email, 'E-mail')}
              />
              <CredentialRow
                label="Senha"
                value={created.password}
                onCopy={() => copy(created.password, 'Senha')}
              />
            </div>
            <Button
              className="mt-6 w-full"
              onClick={() => setCreated(null)}
              type="button"
            >
              <Check size={16} /> Concluir
            </Button>
          </div>
        </div>
      ) : null}
    </AdminShell>
  )
}

function CredentialRow({
  label,
  value,
  onCopy,
}: {
  label: string
  value: string
  onCopy: () => void
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input readOnly value={value} />
        <Button
          aria-label={`Copiar ${label}`}
          onClick={onCopy}
          title={`Copiar ${label}`}
          type="button"
          variant="outline"
        >
          <Copy size={16} />
        </Button>
      </div>
    </div>
  )
}
