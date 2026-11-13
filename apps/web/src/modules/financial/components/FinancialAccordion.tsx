import { useState } from 'react'
import type {
  FinancialSectionId,
  PublicFinancialPage,
} from '@oab-transparencia/contracts/transparency'
import { PublicDownloadLink } from '@/components/shared/public-page'

type FinancialSection =
  PublicFinancialPage['periods'][number]['sections'][number]

function ChevronIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function FinancialDocumentRow({
  item,
}: {
  item: FinancialSection['items'][number]
}) {
  return (
    <div className="financial-document-row">
      <span>{item.title}</span>
      <div className="financial-document-row__actions">
        {item.documents.map((document) => (
          <PublicDownloadLink
            className="financial-download"
            document={document}
            key={document.id}
          />
        ))}
      </div>
    </div>
  )
}

export function FinancialAccordion({
  sections,
}: {
  sections: FinancialSection[]
}) {
  const [openSections, setOpenSections] = useState<Set<FinancialSectionId>>(
    () => new Set(['trial-balances']),
  )

  return (
    <div className="financial-accordion">
      {sections.map((section) => {
        const isOpen = openSections.has(section.id)

        return (
          <article className="financial-accordion__item" key={section.id}>
            <h3>
              <button
                aria-expanded={isOpen}
                className="financial-accordion__trigger"
                onClick={() =>
                  setOpenSections((current) => {
                    const next = new Set(current)
                    if (next.has(section.id)) next.delete(section.id)
                    else next.add(section.id)
                    return next
                  })
                }
                type="button"
              >
                <span>{section.title}</span>
                <ChevronIcon />
              </button>
            </h3>
            {isOpen ? (
              <div className="financial-accordion__content">
                {section.items.map((item) => (
                  <FinancialDocumentRow item={item} key={item.id} />
                ))}
              </div>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}
