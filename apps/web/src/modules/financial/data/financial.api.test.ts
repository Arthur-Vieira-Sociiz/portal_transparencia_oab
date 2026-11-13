import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createFinancialDocument,
  getPublicFinancialPage,
  listFinancialDocuments,
  publishFinancialExercise,
  updateFinancialDocument,
} from './financial.api'

const documents = [
  {
    id: 'financial-pdf',
    title: 'Baixar PDF',
    format: 'pdf' as const,
    url: 'https://example.com/financial.pdf',
    category: 'financial' as const,
    exercise: 2026,
  },
]

const adminRecord = {
  id: 'financial-2026',
  informationType: 'financial-statements' as const,
  period: '1º trimestre' as const,
  exercise: 2026,
  documents,
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

describe('financial API client', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset()
  })

  it('loads and validates the public financial page', async () => {
    const page = {
      availableExercises: [2026],
      periods: [
        {
          exercise: 2026,
          sections: [
            {
              id: 'financial-statements',
              title: '2026 - Demonstrativos financeiros',
              items: [
                {
                  id: adminRecord.id,
                  title: 'Demonstrativos financeiros - 1º trimestre',
                  period: adminRecord.period,
                  documents,
                },
              ],
            },
          ],
        },
      ],
    }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(page))

    await expect(getPublicFinancialPage()).resolves.toEqual(page)
    expect(fetch).toHaveBeenCalledWith('/api/public/financial')
  })

  it('loads administrative documents with pagination and authentication', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ records: [adminRecord] }),
    )

    await expect(listFinancialDocuments('session-token')).resolves.toEqual([
      adminRecord,
    ])
    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/financial?page=1&limit=100',
      { headers: { Authorization: 'Bearer session-token' } },
    )
  })

  it('uses the domain endpoints for create, update and publish', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(adminRecord))
      .mockResolvedValueOnce(jsonResponse(adminRecord))
      .mockResolvedValueOnce(
        jsonResponse([{ ...adminRecord, status: 'PUBLISHED' }]),
      )

    const input = {
      informationType: 'financial-statements' as const,
      period: '1º trimestre' as const,
      exercise: 2026,
      pdfUrl: 'https://example.com/financial.pdf',
      csvUrl: '',
    }

    await createFinancialDocument('session-token', input)
    await updateFinancialDocument('session-token', adminRecord.id, input)
    await publishFinancialExercise('session-token', 2026)

    expect(fetch).toHaveBeenNthCalledWith(1, '/api/admin/financial', {
      body: JSON.stringify(input),
      headers: {
        Authorization: 'Bearer session-token',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      `/api/admin/financial/${adminRecord.id}`,
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
      '/api/admin/financial/2026/publish',
      {
        headers: { Authorization: 'Bearer session-token' },
        method: 'POST',
      },
    )
  })
})
