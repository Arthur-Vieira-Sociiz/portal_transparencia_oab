import type {
  BudgetTransparency,
  PublicAdministrativePage,
  PublicGlossaryPage,
  PublicInstitutionalPage,
  PublicLgpdPage,
  PublicReportsPage,
} from '@oab-transparencia/contracts'

import { parsedAdministrativeFixture } from './administrative.fixture'
import { parsedBudgetFixture } from './budget.fixture'
import { parsedInstitutionalFixture } from './institutional.fixture'
import { parsedReportsFixture } from './reports.fixture'
import { parsedLgpdFixture } from './lgpd.fixture'
import { parsedGlossaryFixture } from './glossary.fixture'

export interface PublicTransparencyRepository {
  getAdministrativePage(): Promise<PublicAdministrativePage>
  getBudgetPage(): Promise<BudgetTransparency>
  getGlossaryPage(): Promise<PublicGlossaryPage>
  getInstitutionalPage(): Promise<PublicInstitutionalPage>
  getLgpdPage(): Promise<PublicLgpdPage>
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
  async getInstitutionalPage() {
    return parsedInstitutionalFixture
  },
  async getLgpdPage() {
    return parsedLgpdFixture
  },
  async getReportsPage() {
    return parsedReportsFixture
  },
}
