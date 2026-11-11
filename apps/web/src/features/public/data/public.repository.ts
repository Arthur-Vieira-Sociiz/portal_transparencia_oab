import type {
  BudgetTransparency,
  PublicAdministrativePage,
  PublicInstitutionalPage,
} from '@oab-transparencia/contracts'

import { parsedAdministrativeFixture } from './administrative.fixture'
import { parsedBudgetFixture } from './budget.fixture'
import { parsedInstitutionalFixture } from './institutional.fixture'

export interface PublicTransparencyRepository {
  getAdministrativePage(): Promise<PublicAdministrativePage>
  getBudgetPage(): Promise<BudgetTransparency>
  getInstitutionalPage(): Promise<PublicInstitutionalPage>
}

export const localPublicTransparencyRepository: PublicTransparencyRepository = {
  async getAdministrativePage() {
    return parsedAdministrativeFixture
  },
  async getBudgetPage() {
    return parsedBudgetFixture
  },
  async getInstitutionalPage() {
    return parsedInstitutionalFixture
  },
}
