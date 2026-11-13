import { PublicPortalLayout } from '@/modules/public-shell/components/PublicPortalLayout'
import { institutionalContent } from '../data/institutional.content'
import '@/modules/public/public-portal.css'

export function InstitutionalPage() {
  return (
    <PublicPortalLayout>
      <section
        aria-labelledby="institutional-presentation"
        className="institutional-content"
      >
        <h2 className="public-section-title" id="institutional-presentation">
          Apresentação da OAB/AL
        </h2>
        {institutionalContent.introduction.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}

        <h2 className="public-section-title public-section-title--spaced">
          Normativos internos relacionados à gestão e transparência
        </h2>
        <ul className="regulation-list">
          {institutionalContent.regulations.map((regulation) => (
            <li key={regulation}>{regulation}</li>
          ))}
        </ul>
      </section>
    </PublicPortalLayout>
  )
}
