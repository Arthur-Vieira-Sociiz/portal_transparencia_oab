import type {
  BudgetTransparency,
  PublicAdministrativePage,
  PublicGlossaryPage,
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
import { parsedLgpdFixture } from './lgpd.fixture'
import { parsedContractsFixture } from './contracts.fixture'
import { parsedGlossaryFixture } from './glossary.fixture'

export interface PublicTransparencyRepository {
  getAdministrativePage(): Promise<PublicAdministrativePage>
  getBudgetPage(): Promise<BudgetTransparency>
  getGlossaryPage(): Promise<PublicGlossaryPage>
  getContractsPage(): Promise<PublicContractsPage>
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
