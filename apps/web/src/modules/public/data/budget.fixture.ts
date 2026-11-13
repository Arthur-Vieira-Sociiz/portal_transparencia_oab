import {
  BudgetTransparencySchema,
  type BudgetTransparency,
} from '@oab-transparencia/contracts'

const budgetFixture = {
  availableExercises: [2026, 2025, 2024, 2023, 2022, 2021, 2020],
  records: [
    {
      id: 'budget-2026-87-2',
      informationType: 'budget',
      annualBudget: 14_500_000,
      plannedAmount: 14_500_000,
      executedAmount: 12_637_611,
      executionPercentage: 87.2,
      exercise: 2026,
      document: {
        id: 'budget-proposal-2026',
        title: 'Proposta orçamentária 2026',
        format: 'pdf',
        url: 'https://oab-al.org.br/wp-content/uploads/2026/11/PropostaOrcamentaria-2026-assinada-6.pdf',
        category: 'budget',
        exercise: 2026,
      },
    },
    {
      id: 'budget-2026-95-5',
      informationType: 'budget',
      annualBudget: 14_500_000,
      plannedAmount: 14_500_000,
      executedAmount: 13_854_157,
      executionPercentage: 95.5,
      exercise: 2026,
      document: {
        id: 'budget-proposal-2026-revised',
        title: 'Proposta orçamentária 2026',
        format: 'pdf',
        url: 'https://oab-al.org.br/wp-content/uploads/2026/11/PropostaOrcamentaria-2026-assinada-6.pdf',
        category: 'budget',
        exercise: 2026,
      },
    },
  ],
} satisfies BudgetTransparency

export const parsedBudgetFixture = BudgetTransparencySchema.parse(budgetFixture)
