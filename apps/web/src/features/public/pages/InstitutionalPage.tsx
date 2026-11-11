import { useQuery } from '@tanstack/react-query'

import { PublicPortalLayout } from '../components/PublicPortalLayout'
import { localPublicTransparencyRepository } from '../data/public.repository'
import '../public-portal.css'

export function InstitutionalPage() {
  const page = useQuery({
    queryFn: () => localPublicTransparencyRepository.getInstitutionalPage(),
    queryKey: ['public-transparency', 'institutional'],
    staleTime: Number.POSITIVE_INFINITY,
  })

  if (page.isPending) {
    return <p className="public-page-state">Carregando informações…</p>
  }

  if (page.isError) {
    return (
      <p className="public-page-state">
        Não foi possível carregar as informações.
      </p>
    )
  }

  return (
    <PublicPortalLayout summary={page.data.summary}>
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
