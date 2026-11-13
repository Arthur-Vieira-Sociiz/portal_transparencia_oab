import { useQuery } from '@tanstack/react-query'
import { PublicPageState } from '@/components/shared/public-page'

import { AdministrativeEmbed } from '../components/AdministrativeEmbed'
import { PublicPortalLayout } from '@/modules/public-shell/components/PublicPortalLayout'
import { localPublicTransparencyRepository } from '../data/public.repository'
import '../public-portal.css'

function DocumentIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </svg>
  )
}

export function AdministrativePage() {
  const page = useQuery({
    queryFn: () => localPublicTransparencyRepository.getAdministrativePage(),
    queryKey: ['public-transparency', 'administrative'],
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
        aria-labelledby="organogram-title"
        className="administrative-content"
      >
        <h2 className="public-section-title" id="organogram-title">
          Organograma
        </h2>
        <p>{page.data.organogram.description}</p>
        <a
          className="document-download"
          href={page.data.organogram.document.url}
          rel="noreferrer"
          target="_blank"
        >
          Baixar Organograma
          <DocumentIcon />
        </a>
      </section>

      <div className="administrative-embed">
        <AdministrativeEmbed />
      </div>
    </PublicPortalLayout>
  )
}
