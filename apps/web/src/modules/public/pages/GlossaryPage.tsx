import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { PublicPageState } from '@/components/shared/public-page'

import { PublicPortalLayout } from '@/modules/public-shell/components/PublicPortalLayout'
import { localPublicTransparencyRepository } from '../data/public.repository'
import '../public-portal.css'

const alphabet = Array.from({ length: 26 }, (_, index) =>
  String.fromCharCode(65 + index),
)

function initialLetter(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .at(0)
    ?.toUpperCase()
}

export function GlossaryPage() {
  const [activeLetter, setActiveLetter] = useState('A')
  const page = useQuery({
    queryFn: () => localPublicTransparencyRepository.getGlossaryPage(),
    queryKey: ['public-transparency', 'glossary'],
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

  const entries = page.data.entries.filter(
    (entry) => initialLetter(entry.term) === activeLetter,
  )

  return (
    <PublicPortalLayout>
      <section aria-labelledby="glossary-title" className="glossary-content">
        <h2 className="public-section-title" id="glossary-title">
          Glossário Contábil e Administrativo
        </h2>
        <p className="glossary-content__intro">{page.data.introduction}</p>

        <div
          className="glossary-tabs"
          role="tablist"
          aria-label="Letras do glossário"
        >
          {alphabet.map((letter) => {
            const isActive = activeLetter === letter

            return (
              <button
                aria-controls="glossary-panel"
                aria-selected={isActive}
                className="glossary-tabs__tab"
                id={`glossary-tab-${letter}`}
                key={letter}
                onClick={() => setActiveLetter(letter)}
                onKeyDown={(event) => {
                  if (
                    !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(
                      event.key,
                    )
                  ) {
                    return
                  }

                  event.preventDefault()
                  const currentIndex = alphabet.indexOf(letter)
                  const nextIndex =
                    event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? alphabet.length - 1
                        : (currentIndex +
                            (event.key === 'ArrowRight' ? 1 : -1) +
                            alphabet.length) %
                          alphabet.length
                  const nextLetter = alphabet[nextIndex] ?? activeLetter

                  setActiveLetter(nextLetter)
                  document.getElementById(`glossary-tab-${nextLetter}`)?.focus()
                }}
                role="tab"
                tabIndex={isActive ? 0 : -1}
                type="button"
              >
                {letter}
              </button>
            )
          })}
        </div>

        <div
          aria-labelledby={`glossary-tab-${activeLetter}`}
          className="glossary-panel"
          id="glossary-panel"
          role="tabpanel"
        >
          <h3>{activeLetter}</h3>
          <div className="glossary-panel__entries">
            {entries.length > 0 ? (
              entries.map((entry) => (
                <p key={entry.term}>
                  <strong>{entry.term}</strong>
                  <br />
                  {entry.definition}
                </p>
              ))
            ) : (
              <p>Nenhum termo publicado para esta letra.</p>
            )}
          </div>
        </div>
      </section>
    </PublicPortalLayout>
  )
}
