import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  PublicPageState,
  PublicSectionHeader,
  PublicSelectField,
} from './public-page'

describe('shared public page components', () => {
  it('connects a reusable select to its visible label', () => {
    render(
      <PublicSelectField
        id="exercise"
        label="Exercício"
        onChange={() => undefined}
        value="2026"
      >
        <option value="2026">2026</option>
      </PublicSelectField>,
    )

    expect(screen.getByLabelText('Exercício')).toHaveValue('2026')
  })

  it('exposes errors as alerts and keeps section headings addressable', () => {
    render(
      <>
        <PublicPageState kind="error">Falha ao carregar.</PublicPageState>
        <PublicSectionHeader
          description="Descrição da seção"
          id="section-title"
          title="Título da seção"
        />
      </>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao carregar.')
    expect(
      screen.getByRole('heading', { name: 'Título da seção' }),
    ).toHaveAttribute('id', 'section-title')
  })
})
