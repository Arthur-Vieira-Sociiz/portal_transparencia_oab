import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createPatrimonialAsset,
  getPublicPatrimonialPage,
  listPatrimonialAssets,
  publishPatrimonialExercise,
  updatePatrimonialAsset,
} from './patrimonial.api'

const input = {
  informationType: 'Imóvel',
  description: 'Sede administrativa da OAB/AL',
  location: 'Jacarecica, Maceió/AL',
  acquisitionValue: 8_750_000,
  status: 'Ativo',
  exercise: 2026,
  documentTitle: 'Registro patrimonial',
  documentUrl: 'https://example.com/patrimonial.pdf',
}

const document = {
  id: 'patrimonial-document',
  title: input.documentTitle,
  format: 'pdf' as const,
  url: input.documentUrl,
  category: 'patrimonial' as const,
  exercise: input.exercise,
}

const publicAsset = {
  id: 'asset-headquarters',
  informationType: input.informationType,
  description: input.description,
  location: input.location,
  acquisitionValue: input.acquisitionValue,
  status: input.status,
  exercise: input.exercise,
  document,
}

const adminAsset = {
  ...publicAsset,
  publicationStatus: 'DRAFT' as const,
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

describe('patrimonial API client', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset()
  })

  it('loads and validates the public patrimonial page', async () => {
    const page = { availableExercises: [2026], assets: [publicAsset] }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(page))

    await expect(getPublicPatrimonialPage()).resolves.toEqual(page)
    expect(fetch).toHaveBeenCalledWith('/api/public/patrimonial')
  })

  it('loads administrative assets with pagination and authentication', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ records: [adminAsset] }),
    )

    await expect(listPatrimonialAssets('session-token')).resolves.toEqual([
      adminAsset,
    ])
    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/patrimonial?page=1&limit=100',
      { headers: { Authorization: 'Bearer session-token' } },
    )
  })

  it('uses the domain endpoints for create, update and publish', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(adminAsset))
      .mockResolvedValueOnce(jsonResponse(adminAsset))
      .mockResolvedValueOnce(
        jsonResponse([{ ...adminAsset, publicationStatus: 'PUBLISHED' }]),
      )

    await createPatrimonialAsset('session-token', input)
    await updatePatrimonialAsset('session-token', adminAsset.id, input)
    await publishPatrimonialExercise('session-token', 2026)

    expect(fetch).toHaveBeenNthCalledWith(1, '/api/admin/patrimonial', {
      body: JSON.stringify(input),
      headers: {
        Authorization: 'Bearer session-token',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      `/api/admin/patrimonial/${adminAsset.id}`,
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
      '/api/admin/patrimonial/2026/publish',
      {
        headers: { Authorization: 'Bearer session-token' },
        method: 'POST',
      },
    )
  })
})
