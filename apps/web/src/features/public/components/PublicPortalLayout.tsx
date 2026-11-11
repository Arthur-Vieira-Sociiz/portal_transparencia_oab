import type { PublicSummary } from '@oab-transparencia/contracts'
import type { ReactNode } from 'react'

import { CategoryNavigation } from './CategoryNavigation'
import { PublicPortalHero } from './PublicPortalHero'
import { SummaryGrid } from './SummaryGrid'

type PublicPortalLayoutProps = {
  children: ReactNode
  summary: PublicSummary
}

export function PublicPortalLayout({
  children,
  summary,
}: PublicPortalLayoutProps) {
  return (
    <main className="public-page">
      <PublicPortalHero />
      <SummaryGrid summary={summary} />
      <CategoryNavigation />
      {children}
    </main>
  )
}
