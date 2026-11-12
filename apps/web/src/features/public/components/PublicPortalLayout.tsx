import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getPublicGeneralData } from '../../../lib/api'
import { emptyPublicSummary } from '../data/institutional.fixture'
import { CategoryNavigation } from './CategoryNavigation'
import { PublicPortalHero } from './PublicPortalHero'
import { SummaryGrid } from './SummaryGrid'

type PublicPortalLayoutProps = {
  children: ReactNode
}

export function PublicPortalLayout({ children }: PublicPortalLayoutProps) {
  const generalData = useQuery({
    queryFn: async () => {
      try {
        return await getPublicGeneralData()
      } catch (error) {
        const status =
          error instanceof Error && 'status' in error
            ? (error as Error & { status?: number }).status
            : undefined
        if (status === undefined || status === 404) return emptyPublicSummary
        throw error
      }
    },
    queryKey: ['public-transparency', 'general-data'],
    staleTime: 30_000,
  })

  const summary = generalData.data ?? emptyPublicSummary

  return (
    <main className="public-page">
      <PublicPortalHero />
      <SummaryGrid summary={summary} />
      <CategoryNavigation />
      {children}
    </main>
  )
}
