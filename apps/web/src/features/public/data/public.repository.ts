import type {
  BudgetTransparency,
  PublicAdministrativePage,
  PublicFinancialPage,
  PublicInstitutionalPage,
  PublicPatrimonialPage,
} from '@oab-transparencia/contracts'

import { parsedAdministrativeFixture } from './administrative.fixture'
import { parsedBudgetFixture } from './budget.fixture'
import { parsedFinancialFixture } from './financial.fixture'
import { parsedInstitutionalFixture } from './institutional.fixture'
import { parsedPatrimonialFixture } from './patrimonial.fixture'

export interface PublicTransparencyRepository {
  getAdministrativePage(): Promise<PublicAdministrativePage>
  getBudgetPage(): Promise<BudgetTransparency>
  getFinancialPage(): Promise<PublicFinancialPage>
  getInstitutionalPage(): Promise<PublicInstitutionalPage>
  getPatrimonialPage(): Promise<PublicPatrimonialPage>
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
  async getPatrimonialPage() {
    return parsedPatrimonialFixture
  },
}
