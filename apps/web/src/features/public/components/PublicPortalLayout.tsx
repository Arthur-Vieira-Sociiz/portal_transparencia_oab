import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getPublicGeneralData } from '../../../lib/api'
import { CategoryNavigation } from './CategoryNavigation'
import { PublicPortalHero } from './PublicPortalHero'
import { SummaryGrid } from './SummaryGrid'

type PublicPortalLayoutProps = {
  children: ReactNode
}

export function PublicPortalLayout({ children }: PublicPortalLayoutProps) {
  const generalData = useQuery({
    queryFn: getPublicGeneralData,
    queryKey: ['public-transparency', 'general-data'],
    staleTime: 30_000,
  })
  const errorStatus =
    generalData.error instanceof Error && 'status' in generalData.error
      ? (generalData.error as Error & { status?: number }).status
      : undefined

  return (
    <main className="public-page">
      <PublicPortalHero />
      <section aria-labelledby="public-summary-title">
        <h1 className="public-page__lead" id="public-summary-title">
          Acesso público às informações financeiras e administrativas da OAB-AL
        </h1>
        {generalData.data ? (
          <SummaryGrid summary={generalData.data} />
        ) : (
          <p className="public-page-state" role="status">
            {generalData.isPending
              ? 'Carregando resumo institucional…'
              : errorStatus === 404
                ? 'Nenhum resumo institucional foi publicado ainda.'
                : 'Não foi possível carregar o resumo institucional.'}
          </p>
        )}
      </section>
      <CategoryNavigation />
      {children}
    </main>
  )
}
