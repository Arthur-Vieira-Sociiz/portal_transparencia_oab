import type {
  BudgetTransparency,
  PublicAdministrativePage,
  PublicGlossaryPage,
  PublicHumanResourcesPage,
  PublicInstitutionalPage,
  PublicLgpdPage,
  PublicContractsPage,
  PublicPatrimonialPage,
  PublicReportsPage,
} from '@oab-transparencia/contracts'

import { parsedAdministrativeFixture } from './administrative.fixture'
import { parsedBudgetFixture } from './budget.fixture'
import { parsedInstitutionalFixture } from './institutional.fixture'
import { parsedPatrimonialFixture } from './patrimonial.fixture'
import { parsedReportsFixture } from './reports.fixture'
import { parsedHumanResourcesFixture } from './human-resources.fixture'
import { parsedLgpdFixture } from './lgpd.fixture'
import { parsedContractsFixture } from './contracts.fixture'
import { parsedGlossaryFixture } from './glossary.fixture'

export interface PublicTransparencyRepository {
  getAdministrativePage(): Promise<PublicAdministrativePage>
  getBudgetPage(): Promise<BudgetTransparency>
  getGlossaryPage(): Promise<PublicGlossaryPage>
  getContractsPage(): Promise<PublicContractsPage>
  getHumanResourcesPage(): Promise<PublicHumanResourcesPage>
  getInstitutionalPage(): Promise<PublicInstitutionalPage>
  getLgpdPage(): Promise<PublicLgpdPage>
  getPatrimonialPage(): Promise<PublicPatrimonialPage>
  getReportsPage(): Promise<PublicReportsPage>
}

export const localPublicTransparencyRepository: PublicTransparencyRepository = {
  async getAdministrativePage() {
    return parsedAdministrativeFixture
  },
  async getBudgetPage() {
    return parsedBudgetFixture
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
  async getLgpdPage() {
    return parsedLgpdFixture
  },
  async getPatrimonialPage() {
    return parsedPatrimonialFixture
  },
  async getReportsPage() {
    return parsedReportsFixture
  },
}
