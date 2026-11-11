import type {
  BudgetTransparency,
  PublicAdministrativePage,
  PublicFinancialPage,
  PublicHumanResourcesPage,
  PublicInstitutionalPage,
  PublicPatrimonialPage,
} from '@oab-transparencia/contracts'

import { parsedAdministrativeFixture } from './administrative.fixture'
import { parsedBudgetFixture } from './budget.fixture'
import { parsedFinancialFixture } from './financial.fixture'
import { parsedInstitutionalFixture } from './institutional.fixture'
import { parsedPatrimonialFixture } from './patrimonial.fixture'
import { parsedHumanResourcesFixture } from './human-resources.fixture'

export interface PublicTransparencyRepository {
  getAdministrativePage(): Promise<PublicAdministrativePage>
  getBudgetPage(): Promise<BudgetTransparency>
  getFinancialPage(): Promise<PublicFinancialPage>
  getHumanResourcesPage(): Promise<PublicHumanResourcesPage>
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
  async getHumanResourcesPage() {
    return parsedHumanResourcesFixture
  },
  async getInstitutionalPage() {
    return parsedInstitutionalFixture
  },
  async getPatrimonialPage() {
    return parsedPatrimonialFixture
  },
}
