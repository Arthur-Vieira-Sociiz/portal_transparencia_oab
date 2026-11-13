import type { ReactNode } from 'react'
import { Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ClipboardList,
  FileCheck2,
  LogOut,
  PanelLeft,
  Users,
  WalletCards,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { clearAuthSession } from './auth-session'
import { useAuthSession } from './useAuth'
import { logout } from './data/auth.api'

type AdminShellProps = {
  children: ReactNode
  title: string
  description: string
  eyebrow?: string
}

const menuItems = [
  { label: 'Dados gerais', path: '/admin', icon: BarChart3 },
  { label: 'Orçamentário', path: '/admin/orcamentario', icon: WalletCards },
  { label: 'Financeiro', path: '/admin/financeiro', icon: WalletCards },
  { label: 'Patrimonial', path: '/admin/patrimonial', icon: ClipboardList },
  {
    label: 'Contratos e licitações',
    path: '/admin/contratos-e-licitacoes',
    icon: FileCheck2,
  },
  { label: 'Recursos humanos', path: '/admin/recursos-humanos', icon: Users },
  {
    label: 'Relatórios e indicadores',
    path: '/admin/relatorios-e-indicadores',
    icon: BarChart3,
  },
]

const publicPathByAdminPath: Record<string, string> = {
  '/admin': '/public/institucional',
  '/admin/dashboard': '/public/institucional',
  '/admin/administrativo': '/public/administrativo',
  '/admin/orcamentario': '/public/orcamentario',
  '/admin/financeiro': '/public/financeiro',
  '/admin/patrimonial': '/public/patrimonial',
  '/admin/contratos-e-licitacoes': '/public/contratos-e-licitacoes',
  '/admin/recursos-humanos': '/public/recursos-humanos',
  '/admin/relatorios-e-indicadores': '/public/relatorios-e-indicadores',
  '/admin/glossario': '/public/glossario',
  '/admin/lgpd': '/public/lgpd',
}

export function AdminShell({
  children,
  title,
  description,
  eyebrow = 'PAINEL ADMINISTRATIVO • OAB/AL',
}: AdminShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useAuthSession()
  const publicPath =
    publicPathByAdminPath[location.pathname] ?? '/public/institucional'

  if (!session) return <Navigate replace to="/login" />

  async function handleLogout() {
    if (session) {
      try {
        await logout(session.token)
      } finally {
        clearAuthSession()
      }
    }
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-[100dvh] bg-[#f4f6f9] text-[#223149] lg:flex lg:h-[100dvh] lg:overflow-hidden">
      <aside className="hidden h-[100dvh] max-h-[100dvh] w-[270px] shrink-0 flex-col bg-[#223149] text-white lg:flex">
        <div className="flex h-[88px] items-center border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-white text-sm font-extrabold text-[#223149]">
              OAB
            </span>
            <div>
              <strong className="block text-[15px] font-semibold tracking-[-0.01em]">
                OAB Alagoas
              </strong>
              <span className="text-[11px] tracking-[0.02em] text-white/60">
                Gestão da transparência
              </span>
            </div>
          </div>
        </div>
        <nav
          aria-label="Módulos administrativos"
          className="flex-1 space-y-1 overflow-y-auto px-3 py-5"
        >
          {[
            ...menuItems,
            ...(session.user.role === 'ADMIN'
              ? [{ label: 'Usuários', path: '/admin/usuarios', icon: Users }]
              : []),
          ].map((item) => (
            <AdminNavLink item={item} key={item.path} />
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 lg:h-[100dvh] lg:overflow-y-auto">
        <header className="sticky top-0 z-20 h-[88px] border-b border-[#dfe4ea] bg-white px-5 md:px-8 lg:px-10">
          <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#52617a]">
                {eyebrow}
              </p>
              <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.025em] text-[#223149]">
                {title}
              </h1>
              <p className="sr-only">{description}</p>
            </div>
            <div className="flex items-center gap-5">
              <div className="hidden items-center gap-3 sm:flex">
                <span className="flex size-9 items-center justify-center rounded-full bg-[#223149] text-xs font-bold text-white">
                  {session?.user.name
                    .split(' ')
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('') ?? 'OA'}
                </span>
                <div className="hidden text-right md:block">
                  <strong className="block text-[13px] font-semibold tracking-[-0.01em] text-[#223149]">
                    {session?.user.name}
                  </strong>
                  <span className="text-[11px] uppercase tracking-[0.08em] text-[#69727d]">
                    {session?.user.role}
                  </span>
                </div>
              </div>
              <span
                aria-hidden="true"
                className="hidden text-lg font-light text-[#cbd5e1] md:inline"
              >
                |
              </span>
              <a
                aria-label="Ver tela pública deste módulo"
                className="hidden min-h-10 items-center gap-2 rounded-md border border-[#d1d9e4] px-3 text-[13px] font-semibold tracking-[-0.005em] text-[#223149] transition-colors hover:border-[#223149] hover:bg-[#f4f6f9] md:flex"
                href={publicPath}
                rel="noreferrer"
                target="_blank"
              >
                <PanelLeft size={15} /> Ver tela pública
              </a>
              <Button
                aria-label="Sair do painel"
                className="size-10 min-h-10 border border-[#d1d9e4] bg-white p-0 text-[#223149] hover:bg-[#f4f6f9]"
                onClick={handleLogout}
                type="button"
                title="Sair do painel"
                variant="outline"
              >
                <LogOut size={15} />
              </Button>
            </div>
          </div>
        </header>
        <div className="border-b border-[#dfe4ea] bg-white px-4 py-2 lg:hidden">
          <nav
            aria-label="Módulos administrativos"
            className="flex gap-2 overflow-x-auto pb-1"
          >
            {[
              ...menuItems,
              ...(session.user.role === 'ADMIN'
                ? [{ label: 'Usuários', path: '/admin/usuarios', icon: Users }]
                : []),
            ].map((item) => (
              <AdminNavLink item={item} key={item.path} mobile />
            ))}
          </nav>
        </div>
        <main className="mx-auto w-full max-w-[1440px] p-5 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  )
}

function AdminNavLink({
  item,
  mobile = false,
}: {
  item: (typeof menuItems)[number]
  mobile?: boolean
}) {
  const Icon = item.icon
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          'group flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-[13px] font-semibold leading-5 tracking-[0.005em] transition-colors',
          mobile
            ? 'border border-[#dfe4ea] py-2 text-xs'
            : 'text-white/75 hover:bg-white/10 hover:text-white',
          isActive &&
            (mobile
              ? 'border-[#223149] bg-[#223149] text-white'
              : 'bg-white text-[#223149]'),
        )
      }
      end={item.path === '/admin'}
      to={item.path}
    >
      <Icon
        className={cn(
          'shrink-0 text-[#ff3557]',
          mobile ? 'size-4' : 'size-[17px]',
        )}
      />
      <span>{item.label}</span>
    </NavLink>
  )
}
