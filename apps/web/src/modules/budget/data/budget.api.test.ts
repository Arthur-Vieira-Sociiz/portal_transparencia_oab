import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createBudgetRecord,
  getPublicBudgetRecords,
  listBudgetRecords,
  publishBudgetExercise,
  updateBudgetRecord,
} from './budget.api'

const publicRecord = {
  id: 'budget-2026',
  informationType: 'budget' as const,
  annualBudget: 500_000,
  plannedAmount: 100_000,
  executedAmount: 20_000,
  executionPercentage: 20,
  exercise: 2026,
}

const adminRecord = {
  ...publicRecord,
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

describe('budget API client', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset()
  })

  it('loads and validates the public budget for an exercise', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ availableExercises: [2026], records: [publicRecord] }),
    )

    await expect(getPublicBudgetRecords(2026)).resolves.toEqual({
      availableExercises: [2026],
      records: [publicRecord],
    })
    expect(fetch).toHaveBeenCalledWith('/api/public/budget?exercise=2026')
  })

  it('loads the administrative records with the session token', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ records: [adminRecord] }),
    )

    await expect(listBudgetRecords('session-token')).resolves.toEqual([
      adminRecord,
    ])
    expect(fetch).toHaveBeenCalledWith('/api/admin/budget', {
      headers: { Authorization: 'Bearer session-token' },
    })
  })

  it('uses the domain endpoints for create, update and publish', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(adminRecord))
      .mockResolvedValueOnce(jsonResponse(adminRecord))
      .mockResolvedValueOnce(
        jsonResponse([{ ...adminRecord, status: 'PUBLISHED' }]),
      )

    const input = {
      informationType: 'budget' as const,
      annualBudget: 500_000,
      plannedAmount: 100_000,
      executedAmount: 20_000,
      exercise: 2026,
    }

    await createBudgetRecord('session-token', input)
    await updateBudgetRecord('session-token', adminRecord.id, input)
    await publishBudgetExercise('session-token', 2026)

    expect(fetch).toHaveBeenNthCalledWith(1, '/api/admin/budget', {
      body: JSON.stringify(input),
      headers: {
        Authorization: 'Bearer session-token',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      `/api/admin/budget/${adminRecord.id}`,
      {
        body: JSON.stringify(input),
        headers: {
          Authorization: 'Bearer session-token',
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      },
    )
    expect(fetch).toHaveBeenNthCalledWith(3, '/api/admin/budget/2026/publish', {
      headers: { Authorization: 'Bearer session-token' },
      method: 'POST',
    })
  })
})
