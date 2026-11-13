import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import type { LgpdSectionGroup } from '@oab-transparencia/contracts'
import { PublicPageState } from '@/components/shared/public-page'

import { PublicPortalLayout } from '@/modules/public-shell/components/PublicPortalLayout'
import { localPublicTransparencyRepository } from '../data/public.repository'
import '../public-portal.css'

function ToggleIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M5 12h14" />
      {!isOpen ? <path d="M12 5v14" /> : null}
    </svg>
  )
}

function LgpdAccordionGroup({ group }: { group: LgpdSectionGroup }) {
  const [openSectionId, setOpenSectionId] = useState(group.sections[0]?.id)

  return (
    <div className="lgpd-accordion">
      {group.sections.map((section) => {
        const isOpen = openSectionId === section.id
        const contentId = `${group.id}-${section.id}-content`

        return (
          <article className="lgpd-accordion__item" key={section.id}>
            <h3>
              <button
                aria-controls={contentId}
                aria-expanded={isOpen}
                className="lgpd-accordion__trigger"
                onClick={() =>
                  setOpenSectionId(isOpen ? undefined : section.id)
                }
                type="button"
              >
                <span>{section.title}</span>
                <ToggleIcon isOpen={isOpen} />
              </button>
            </h3>
            {isOpen ? (
              <div className="lgpd-accordion__content" id={contentId}>
                <p>{section.content}</p>
              </div>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}

export function LgpdPage() {
  const page = useQuery({
    queryFn: () => localPublicTransparencyRepository.getLgpdPage(),
    queryKey: ['public-transparency', 'lgpd'],
    staleTime: Number.POSITIVE_INFINITY,
  })

  if (page.isPending) {
    return <PublicPageState>Carregando informações…</PublicPageState>
  }

  if (page.isError) {
    return (
      <PublicPageState kind="error">
        Não foi possível carregar as informações.
      </PublicPageState>
    )
  }

  return (
    <PublicPortalLayout>
      <section aria-labelledby="lgpd-title" className="lgpd-content">
        <h2 className="public-section-title" id="lgpd-title">
          LGPD
        </h2>
        <div className="lgpd-content__intro">
          {page.data.introduction.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {page.data.groups.map((group) => (
          <LgpdAccordionGroup group={group} key={group.id} />
        ))}
      </section>
    </PublicPortalLayout>
  )
}
