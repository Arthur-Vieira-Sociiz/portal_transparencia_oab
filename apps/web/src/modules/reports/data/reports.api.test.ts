import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createReportsIndicator,
  deleteReportsIndicator,
  getPublicReportsPage,
  listReportsIndicators,
  publishReportsExercise,
  updateReportsIndicator,
} from './reports.api'

const input = {
  exercise: 2026,
  totalRevenue: 370_000,
  totalExpense: 240_000,
  exerciseResult: 130_000,
  plannedBudget: 450_000,
  executedBudget: 240_000,
  executionPercentage: 53.33,
  activeLawyers: 327,
  interns: 24,
  registeredSocieties: 253,
  appointments: 120,
  protocols: 85,
  certificates: 42,
  ombudsmanRequests: 12,
  activeContracts: 18,
  totalContractValue: 800_000,
  newBids: 6,
  closedContracts: 4,
  employees: 75,
}

const adminIndicator = {
  id: 'reports-2026',
  ...input,
  status: 'DRAFT' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  publishedAt: null,
}

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
}

describe('reports API client', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset()
  })

  it('loads and validates the public reports page', async () => {
    const page = { availableExercises: [2026], indicators: [input] }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(page))

    await expect(getPublicReportsPage()).resolves.toEqual(page)
    expect(fetch).toHaveBeenCalledWith('/api/public/reports')
  })

  it('loads administrative indicators with authentication', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ indicators: [adminIndicator] }),
    )

    await expect(listReportsIndicators('session-token')).resolves.toEqual([
      adminIndicator,
    ])
    expect(fetch).toHaveBeenCalledWith('/api/admin/reports', {
      headers: { Authorization: 'Bearer session-token' },
    })
  })

  it('creates, updates and publishes indicators', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(adminIndicator))
      .mockResolvedValueOnce(jsonResponse(adminIndicator))
      .mockResolvedValueOnce(
        jsonResponse([{ ...adminIndicator, status: 'PUBLISHED' as const }]),
      )

    await createReportsIndicator('session-token', input)
    await updateReportsIndicator('session-token', adminIndicator.id, input)
    await publishReportsExercise('session-token', 2026)

    expect(fetch).toHaveBeenNthCalledWith(1, '/api/admin/reports', {
      body: JSON.stringify(input),
      headers: {
        Authorization: 'Bearer session-token',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      `/api/admin/reports/${adminIndicator.id}`,
      {
        body: JSON.stringify(input),
        headers: {
          Authorization: 'Bearer session-token',
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      },
    )
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      '/api/admin/reports/2026/publish',
      {
        headers: { Authorization: 'Bearer session-token' },
        method: 'POST',
      },
    )
  })

  it('deletes an indicator through its administrative endpoint', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }))

    await deleteReportsIndicator('session-token', adminIndicator.id)

    expect(fetch).toHaveBeenCalledWith(
      `/api/admin/reports/${adminIndicator.id}`,
      {
        headers: { Authorization: 'Bearer session-token' },
        method: 'DELETE',
      },
    )
  })
})
