import { describe, expect, it } from 'vitest'

import {
  ADMINISTRATIVE_EMBED_URL,
  AdministrativeEmbed,
} from './AdministrativeEmbed'

describe('AdministrativeEmbed', () => {
  it('preserves the official iframe attributes', () => {
    const iframe = AdministrativeEmbed()

    expect(iframe.props).toMatchObject({
      height: '800',
      src: ADMINISTRATIVE_EMBED_URL,
      style: { border: 'none' },
      title: 'Quantitativo administrativo de inscritos da OAB-AL',
      width: '100%',
    })
  })
})
