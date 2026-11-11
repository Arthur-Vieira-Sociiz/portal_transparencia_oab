import type {
  BudgetTransparency,
  PublicAdministrativePage,
  PublicFinancialPage,
  PublicInstitutionalPage,
} from '@oab-transparencia/contracts'

import { parsedAdministrativeFixture } from './administrative.fixture'
import { parsedBudgetFixture } from './budget.fixture'
import { parsedFinancialFixture } from './financial.fixture'
import { parsedInstitutionalFixture } from './institutional.fixture'

export interface PublicTransparencyRepository {
  getAdministrativePage(): Promise<PublicAdministrativePage>
  getBudgetPage(): Promise<BudgetTransparency>
  getFinancialPage(): Promise<PublicFinancialPage>
  getInstitutionalPage(): Promise<PublicInstitutionalPage>
}

export const localPublicTransparencyRepository: PublicTransparencyRepository = {
  async getAdministrativePage() {
    return parsedAdministrativeFixture
  },
  async getBudgetPage() {
    return parsedBudgetFixture
  },
  async getFinancialPage() {
    return parsedFinancialFixture
  },
  async getInstitutionalPage() {
    return parsedInstitutionalFixture
  },
}
