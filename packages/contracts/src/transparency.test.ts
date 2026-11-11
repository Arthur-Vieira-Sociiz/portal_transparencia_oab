import { describe, expect, it } from 'vitest'

import {
  AdministrativeEnrollmentSchema,
  GeneralIndicatorsSchema,
  HumanResourcesRecordSchema,
  PublicAdministrativePageSchema,
  PublicInstitutionalPageSchema,
  type Month,
} from './index.js'

const months: Month[] = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

describe('transparency contracts', () => {
  it('parses the general indicators observed in the legacy dashboard', () => {
    const result = GeneralIndicatorsSchema.safeParse({
      exercise: 2026,
      totalRevenue: 100,
      totalExpense: 80,
      exerciseResult: 20,
      plannedBudget: 120,
      executedBudget: 80,
      executionPercentage: 66.67,
      activeLawyers: 10,
      interns: 2,
      registeredSocieties: 3,
      appointments: 20,
      protocols: 15,
      certificates: 5,
      ombudsmanRequests: 1,
      activeContracts: 4,
      totalContractValue: 500,
      newBids: 2,
      closedContracts: 1,
      employees: 30,
    })

    expect(result.success).toBe(true)
  })

  it('rejects repeated months in a human resources record', () => {
    const repeatedMonths = months.map((month) => ({ month, documents: [] }))
    repeatedMonths[11] = { month: 'january', documents: [] }

    const result = HumanResourcesRecordSchema.safeParse({
      exercise: 2026,
      locality: 'Maceió',
      months: repeatedMonths,
    })

    expect(result.success).toBe(false)
  })

  it('rejects negative administrative quantities', () => {
    const result = AdministrativeEnrollmentSchema.safeParse({
      id: 'maceio-2026',
      exercise: 2026,
      subsection: 'Maceió',
      lawyers: -1,
      interns: 0,
      supplementary: 0,
      transferringLawyers: 0,
    })

    expect(result.success).toBe(false)
  })

  it('parses the public institutional page fixture', () => {
    const result = PublicInstitutionalPageSchema.safeParse({
      summary: {
        exercise: 2025,
        totalExpenses: 0,
        totalRevenue: 0,
        budget: 0,
        patrimony: 0,
        activeLawyers: 0,
        activeSocieties: 0,
        supportRooms: 0,
        registeredMembers: 0,
      },
      content: {
        introduction: ['Apresentação institucional.'],
        regulations: ['Resolução nº 04/2014'],
      },
    })

    expect(result.success).toBe(true)
  })

  it('parses the public administrative page fixture', () => {
    const result = PublicAdministrativePageSchema.safeParse({
      summary: {
        exercise: 2025,
        totalExpenses: 0,
        totalRevenue: 0,
        budget: 0,
        patrimony: 0,
        activeLawyers: 0,
        activeSocieties: 0,
        supportRooms: 0,
        registeredMembers: 0,
      },
      organogram: {
        description: 'Estrutura organizacional da OAB/AL.',
        document: {
          id: 'organogram-2025-2027',
          title: 'Organograma OAB-AL 2025–2027',
          format: 'pdf',
          url: 'https://example.com/organogram.pdf',
          category: 'administrative',
          exercise: 2025,
        },
      },
    })

    expect(result.success).toBe(true)
  })
})
