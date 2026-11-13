import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createHumanResources,
  deleteHumanResources,
  getPublicHumanResourcesPage,
  listHumanResources,
  publishHumanResourcesExercise,
  updateHumanResources,
} from './human-resources.api'
import { humanResourcesMonths } from './human-resources.constants'

const input = {
  exercise: 2026,
  locality: 'JACARECICA',
  months: humanResourcesMonths.map(({ id }, index) => ({
    month: id,
    pdfUrl: index === 0 ? 'https://example.com/january.pdf' : '',
    xlsxUrl: '',
  })),
}

const publicRecord = {
  exercise: input.exercise,
  locality: input.locality,
  months: humanResourcesMonths.map(({ id }, index) => ({
    month: id,
    documents:
      index === 0
        ? [
            {
              id: 'hr-january-pdf',
              title: 'Baixar PDF',
              format: 'pdf' as const,
              url: 'https://example.com/january.pdf',
              category: 'human-resources' as const,
              exercise: 2026,
            },
          ]
        : [],
  })),
}

const adminRecord = {
  id: 'human-resources-2026',
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

describe('human resources API client', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset()
  })

  it('loads and validates the public human resources page', async () => {
    const page = { availableExercises: [2026], records: [publicRecord] }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(page))

    await expect(getPublicHumanResourcesPage()).resolves.toEqual(page)
    expect(fetch).toHaveBeenCalledWith('/api/public/human-resources')
  })

  it('loads administrative records with pagination and authentication', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ records: [adminRecord] }),
    )

    await expect(listHumanResources('session-token')).resolves.toEqual([
      adminRecord,
    ])
    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/human-resources?page=1&limit=100',
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

    await createHumanResources('session-token', input)
    await updateHumanResources('session-token', adminRecord.id, input)
    await publishHumanResourcesExercise('session-token', 2026)

    expect(fetch).toHaveBeenNthCalledWith(1, '/api/admin/human-resources', {
      body: JSON.stringify(input),
      headers: {
        Authorization: 'Bearer session-token',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      `/api/admin/human-resources/${adminRecord.id}`,
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
      '/api/admin/human-resources/2026/publish',
      {
        headers: { Authorization: 'Bearer session-token' },
        method: 'POST',
      },
    )
  })

  it('deletes a record through its administrative endpoint', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }))

    await expect(
      deleteHumanResources('session-token', adminRecord.id),
    ).resolves.toBeUndefined()
    expect(fetch).toHaveBeenCalledWith(
      `/api/admin/human-resources/${adminRecord.id}`,
      {
        headers: { Authorization: 'Bearer session-token' },
        method: 'DELETE',
      },
    )
  })
})
