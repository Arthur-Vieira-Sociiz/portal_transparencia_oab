import type {
  PublicAdministrativePage,
  PublicInstitutionalPage,
} from '@oab-transparencia/contracts'

import { parsedAdministrativeFixture } from './administrative.fixture'
import { parsedInstitutionalFixture } from './institutional.fixture'

export interface PublicTransparencyRepository {
  getAdministrativePage(): Promise<PublicAdministrativePage>
  getInstitutionalPage(): Promise<PublicInstitutionalPage>
}

export const localPublicTransparencyRepository: PublicTransparencyRepository = {
  async getAdministrativePage() {
    return parsedAdministrativeFixture
  },
  async getInstitutionalPage() {
    return parsedInstitutionalFixture
  },
}
