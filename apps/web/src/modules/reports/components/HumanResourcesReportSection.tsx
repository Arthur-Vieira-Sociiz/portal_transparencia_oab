import type { GeneralIndicators } from '@oab-transparencia/contracts/transparency'
import { formatInteger } from '@/lib/formatters'

interface HumanResourcesReportSectionProps {
  current: GeneralIndicators
  selectedExercise: number
}

export function HumanResourcesReportSection({
  current,
  selectedExercise,
}: HumanResourcesReportSectionProps) {
  return (
    <>
      <h3>Recursos Humanos</h3>
      <div className="reports-banner">
        <span>Total de Colaboradores em {selectedExercise}</span>
        <strong>{formatInteger(current.employees)}</strong>
      </div>
      <p className="reports-note">
        <strong>Proteção de Dados Pessoais:</strong> Este painel apresenta
        exclusivamente dados consolidados e quantitativos. Não são exibidos
        nomes, remunerações individuais ou qualquer informação que permita
        identificação direta ou indireta de colaboradores, em total conformidade
        com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
      </p>
    </>
  )
}
