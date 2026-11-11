import type { PublicInstitutionalPage } from '@oab-transparencia/contracts'

import { parsedInstitutionalFixture } from './institutional.fixture'

export interface PublicTransparencyRepository {
  getInstitutionalPage(): Promise<PublicInstitutionalPage>
}

export const localPublicTransparencyRepository: PublicTransparencyRepository = {
  async getInstitutionalPage() {
    return parsedInstitutionalFixture
  },
}
