import {
  PublicAdministrativePageSchema,
  type PublicAdministrativePage,
} from '@oab-transparencia/contracts'

import { publicSummaryFixture } from './institutional.fixture'

const administrativeFixture = {
  summary: publicSummaryFixture,
  organogram: {
    description:
      'Acompanhe como a OAB/AL se organiza para melhor atender a advocacia.',
    document: {
      id: 'organogram-2025-2027',
      title: 'Organograma OAB-AL 2025–2027',
      format: 'pdf',
      url: 'https://oab-al.org.br/wp-content/uploads/2026/03/Organograma-OAB-AL-2025_2027.pdf',
      category: 'administrative',
      exercise: 2025,
    },
  },
} satisfies PublicAdministrativePage

export const parsedAdministrativeFixture = PublicAdministrativePageSchema.parse(
  administrativeFixture,
)
