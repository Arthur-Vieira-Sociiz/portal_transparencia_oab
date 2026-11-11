import {
  PublicFinancialPageSchema,
  type PublicFinancialPage,
} from '@oab-transparencia/contracts'

const sourceBaseUrl = 'https://oab-al.org.br/wp-content/uploads/2026/01'

function quarterlyDocuments(prefix: string, quarter: number) {
  return [
    {
      id: `${prefix}-${quarter}-pdf`,
      title: 'Baixar PDF',
      format: 'pdf' as const,
      url: `${sourceBaseUrl}/oab-teste.pdf`,
      category: 'financial' as const,
      exercise: 2026,
    },
    {
      id: `${prefix}-${quarter}-xlsx`,
      title: 'Baixar XLSX',
      format: 'xlsx' as const,
      url: `${sourceBaseUrl}/oabteste.xlsx`,
      category: 'financial' as const,
      exercise: 2026,
    },
  ]
}

const financialFixture = {
  availableExercises: [2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020],
  periods: [
    {
      exercise: 2026,
      sections: [
        {
          id: 'trial-balances',
          title: '2026 - Balancetes',
          items: [1, 2, 3, 4].map((quarter) => ({
            id: `trial-balance-${quarter}`,
            title: `Balancete - ${quarter}º trimestre`,
            period: `${quarter}º trimestre de 2026`,
            documents: quarterlyDocuments('trial-balance', quarter),
          })),
        },
        {
          id: 'financial-statements',
          title: '2026 - Demonstrativos financeiros',
          items: [1, 2, 3, 4].map((quarter) => ({
            id: `financial-statement-${quarter}`,
            title: `Demonstrativos financeiros - ${quarter}º trimestre`,
            period: `${quarter}º trimestre de 2026`,
            documents: quarterlyDocuments('financial-statement', quarter),
          })),
        },
        {
          id: 'revenues',
          title: '2026 - Quadro sintético de receitas',
          items: [
            {
              id: 'revenues-report',
              title: 'Relatório de Receitas',
              period: 'Exercício 2026',
              documents: [
                {
                  id: 'revenues-report-pdf',
                  title: 'Baixar PDF',
                  format: 'pdf',
                  url: `${sourceBaseUrl}/oab-teste.pdf`,
                  category: 'financial',
                  exercise: 2026,
                },
              ],
            },
          ],
        },
        {
          id: 'expenses',
          title: '2026 - Quadro sintético de despesas',
          items: [
            {
              id: 'expenses-report',
              title: 'Relatório de Despesas',
              period: 'Exercício 2026',
              documents: [
                {
                  id: 'expenses-report-pdf',
                  title: 'Baixar PDF',
                  format: 'pdf',
                  url: `${sourceBaseUrl}/oab-teste.pdf`,
                  category: 'financial',
                  exercise: 2026,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
} satisfies PublicFinancialPage

export const parsedFinancialFixture =
  PublicFinancialPageSchema.parse(financialFixture)
