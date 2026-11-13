import type { Month } from '@oab-transparencia/contracts/common'
import type { CreateHumanResourcesRequest } from '@oab-transparencia/contracts/transparency'

export const humanResourcesMonths = [
  { id: 'january', label: 'JANEIRO' },
  { id: 'february', label: 'FEVEREIRO' },
  { id: 'march', label: 'MARÇO' },
  { id: 'april', label: 'ABRIL' },
  { id: 'may', label: 'MAIO' },
  { id: 'june', label: 'JUNHO' },
  { id: 'july', label: 'JULHO' },
  { id: 'august', label: 'AGOSTO' },
  { id: 'september', label: 'SETEMBRO' },
  { id: 'october', label: 'OUTUBRO' },
  { id: 'november', label: 'NOVEMBRO' },
  { id: 'december', label: 'DEZEMBRO' },
] as const satisfies ReadonlyArray<{ id: Month; label: string }>

export const humanResourcesMonthLabels = Object.fromEntries(
  humanResourcesMonths.map(({ id, label }) => [id, label]),
) as Record<Month, string>

export function createEmptyHumanResourcesMonths(): CreateHumanResourcesRequest['months'] {
  return humanResourcesMonths.map(({ id }) => ({
    month: id,
    pdfUrl: '',
    xlsxUrl: '',
  }))
}
