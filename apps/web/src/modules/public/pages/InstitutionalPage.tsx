import { useQuery } from '@tanstack/react-query'
import { PublicPageState } from '@/components/shared/public-page'

import { PublicPortalLayout } from '@/modules/public-shell/components/PublicPortalLayout'
import { localPublicTransparencyRepository } from '../data/public.repository'
import '../public-portal.css'

export function InstitutionalPage() {
  const page = useQuery({
    queryFn: () => localPublicTransparencyRepository.getInstitutionalPage(),
    queryKey: ['public-transparency', 'institutional'],
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
      <section
        aria-labelledby="institutional-presentation"
        className="institutional-content"
      >
        <h2 className="public-section-title" id="institutional-presentation">
          Apresentação da OAB/AL
        </h2>
        {page.data.content.introduction.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}

        <h2 className="public-section-title public-section-title--spaced">
          Normativos internos relacionados à gestão e transparência
        </h2>
        <ul className="regulation-list">
          {page.data.content.regulations.map((regulation) => (
            <li key={regulation}>{regulation}</li>
          ))}
        </ul>
      </section>
    </PublicPortalLayout>
  )
}
