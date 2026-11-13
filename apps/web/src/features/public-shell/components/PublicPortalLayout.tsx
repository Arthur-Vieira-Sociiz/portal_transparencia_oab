import type { ReactNode } from 'react'

import { PublicPageState } from '@/components/shared/public-page'
import { usePublicGeneralData } from '@/features/general-data/general-data.queries'
import { CategoryNavigation } from './CategoryNavigation'
import { PublicPortalHero } from './PublicPortalHero'
import { SummaryGrid } from './SummaryGrid'

type PublicPortalLayoutProps = {
  children: ReactNode
}

export function PublicPortalLayout({ children }: PublicPortalLayoutProps) {
  const generalData = usePublicGeneralData()
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
          <PublicPageState
            kind={
              generalData.isPending
                ? 'loading'
                : errorStatus === 404
                  ? 'empty'
                  : 'error'
            }
          >
            {generalData.isPending
              ? 'Carregando resumo institucional…'
              : errorStatus === 404
                ? 'Nenhum resumo institucional foi publicado ainda.'
                : 'Não foi possível carregar o resumo institucional.'}
          </PublicPageState>
        )}
      </section>
      <CategoryNavigation />
      {children}
    </main>
  )
}
