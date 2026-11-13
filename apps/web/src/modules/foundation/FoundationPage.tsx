import { useQuery } from '@tanstack/react-query'

import { getApiHealth } from './data/foundation.api'

type FoundationPageProps = {
  description: string
  showApiStatus?: boolean
  title: string
}

export function FoundationPage({
  description,
  showApiStatus = false,
  title,
}: FoundationPageProps) {
  const health = useQuery({
    enabled: showApiStatus,
    queryFn: getApiHealth,
    queryKey: ['api-health'],
  })

  return (
    <main className="foundation-page">
      <div className="foundation-page__content">
        <h1>{title}</h1>
        <p className="foundation-page__description">{description}</p>

        {showApiStatus ? (
          <p aria-live="polite" className="foundation-page__status">
            API:{' '}
            {health.isPending
              ? 'verificando…'
              : health.isError
                ? 'indisponível'
                : 'conectada'}
          </p>
        ) : null}
      </div>
    </main>
  )
}
