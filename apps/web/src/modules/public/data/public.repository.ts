import type { BudgetTransparency } from '@oab-transparencia/contracts'

import { parsedBudgetFixture } from './budget.fixture'

export interface PublicTransparencyRepository {
  getBudgetPage(): Promise<BudgetTransparency>
}

export const localPublicTransparencyRepository: PublicTransparencyRepository = {
  async getBudgetPage() {
    return parsedBudgetFixture
  },
}
