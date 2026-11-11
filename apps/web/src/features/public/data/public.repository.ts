import type {
  BudgetTransparency,
  PublicAdministrativePage,
  PublicFinancialPage,
  PublicGlossaryPage,
  PublicHumanResourcesPage,
  PublicInstitutionalPage,
  PublicContractsPage,
  PublicPatrimonialPage,
} from '@oab-transparencia/contracts'

import { parsedAdministrativeFixture } from './administrative.fixture'
import { parsedBudgetFixture } from './budget.fixture'
import { parsedFinancialFixture } from './financial.fixture'
import { parsedInstitutionalFixture } from './institutional.fixture'
import { parsedPatrimonialFixture } from './patrimonial.fixture'
import { parsedHumanResourcesFixture } from './human-resources.fixture'
import { parsedContractsFixture } from './contracts.fixture'
import { parsedGlossaryFixture } from './glossary.fixture'

export interface PublicTransparencyRepository {
  getAdministrativePage(): Promise<PublicAdministrativePage>
  getBudgetPage(): Promise<BudgetTransparency>
  getFinancialPage(): Promise<PublicFinancialPage>
  getGlossaryPage(): Promise<PublicGlossaryPage>
  getContractsPage(): Promise<PublicContractsPage>
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
  async getGlossaryPage() {
    return parsedGlossaryFixture
  },
  async getContractsPage() {
    return parsedContractsFixture
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
