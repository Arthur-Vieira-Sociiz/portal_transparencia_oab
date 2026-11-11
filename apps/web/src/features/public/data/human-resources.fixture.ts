import {
  PublicHumanResourcesPageSchema,
  type PublicHumanResourcesPage,
} from '@oab-transparencia/contracts'

const months = [
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
] as const

const sourceBaseUrl = 'https://oab-al.org.br/wp-content/uploads/2026/01'

function monthlyDocuments(exercise: number, month: string) {
  return [
    {
      id: `hr-${exercise}-${month}-pdf`,
      title: 'Baixar PDF',
      format: 'pdf' as const,
      url: `${sourceBaseUrl}/oab-teste.pdf`,
      category: 'human-resources' as const,
      exercise,
    },
    {
      id: `hr-${exercise}-${month}-xlsx`,
      title: 'Baixar XLSX',
      format: 'xlsx' as const,
      url: `${sourceBaseUrl}/oabteste.xlsx`,
      category: 'human-resources' as const,
      exercise,
    },
  ]
}

const humanResourcesFixture = {
  availableExercises: [2026, 2025],
  records: [
    {
      exercise: 2026,
      locality: 'JACARECICA',
      months: months.map(({ id }) => ({
        month: id,
        documents: monthlyDocuments(2026, id),
      })),
    },
    {
      exercise: 2025,
      locality: 'MACEIÓ - CENTRO',
      months: months.map(({ id }) => ({
        month: id,
        documents: monthlyDocuments(2025, id),
      })),
    },
  ],
} satisfies PublicHumanResourcesPage

export { months as humanResourcesMonths }
export const parsedHumanResourcesFixture = PublicHumanResourcesPageSchema.parse(
  humanResourcesFixture,
)
