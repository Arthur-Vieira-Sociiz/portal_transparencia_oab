import {
  PublicContractsPageSchema,
  type PublicContractsPage,
} from '@oab-transparencia/contracts'

const sourceBaseUrl = 'https://oab-al.org.br/wp-content/uploads/2026/01'

const contractsFixture = {
  availableExercises: [2026, 2025, 2024, 2023, 2022, 2021, 2020],
  contracts: [
    {
      id: 'contract-acom-2026',
      supplier: 'ACOM SISTEMAS CORPORATIVOS LTDA',
      cnpj: '00.000.000/0000-00',
      objectDescription: 'Licenciamento e suporte de sistemas corporativos.',
      signedAt: '02/01/2026',
      term: 'DD/MM/AAAA - DD/MM/AAAA',
      value: 214_124,
      exercise: 2026,
      contractDocument: {
        id: 'contract-acom-2026-pdf',
        title: 'Contrato ACOM 2026',
        format: 'pdf',
        url: `${sourceBaseUrl}/oab-teste.pdf`,
        category: 'contracts-and-bids',
        exercise: 2026,
      },
      amendments: [
        {
          id: 'contract-acom-2026-amendment-1',
          title: '1º termo aditivo',
          format: 'pdf',
          url: `${sourceBaseUrl}/oab-teste.pdf`,
          category: 'contracts-and-bids',
          exercise: 2026,
        },
      ],
    },
    {
      id: 'contract-sociiz-2025',
      supplier: 'Sociiz',
      cnpj: '98.765.432/0001-10',
      objectDescription:
        'Serviços de comunicação digital e desenvolvimento web.',
      signedAt: '15/03/2025',
      term: '15/03/2025 a 14/03/2026',
      value: 72_000,
      exercise: 2025,
      contractDocument: {
        id: 'contract-sociiz-2025-pdf',
        title: 'Contrato Sociiz 2025',
        format: 'pdf',
        url: `${sourceBaseUrl}/oab-teste.pdf`,
        category: 'contracts-and-bids',
        exercise: 2025,
      },
      amendments: [
        {
          id: 'contract-sociiz-2025-amendment-1',
          title: '1º termo aditivo',
          format: 'pdf',
          url: `${sourceBaseUrl}/oab-teste.pdf`,
          category: 'contracts-and-bids',
          exercise: 2025,
        },
      ],
    },
  ],
} satisfies PublicContractsPage

export const parsedContractsFixture =
  PublicContractsPageSchema.parse(contractsFixture)
