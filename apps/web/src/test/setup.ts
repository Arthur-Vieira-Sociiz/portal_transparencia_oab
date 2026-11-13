import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import type { GeneralData } from '@oab-transparencia/contracts'
import { afterEach, beforeEach, vi } from 'vitest'

const generalData = {
  id: 'general-data-test',
  exercise: 2026,
  totalExpenses: 17_111_470.67,
  totalRevenue: 17_436_491.03,
  budget: 17_600_000,
  patrimony: 8_250_000,
  activeLawyers: 17_345,
  activeSocieties: 1_240,
  supportRooms: 12,
  registeredMembers: 18_585,
  status: 'PUBLISHED',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  publishedAt: '2026-01-01T00:00:00.000Z',
} satisfies GeneralData

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL | Request) => {
      const url =
        input instanceof Request
          ? input.url
          : input instanceof URL
            ? input.href
            : input

      if (url.endsWith('/api/public/general-data')) {
        return new Response(JSON.stringify(generalData), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      throw new Error(`Requisição não simulada no teste: ${url}`)
    }),
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
