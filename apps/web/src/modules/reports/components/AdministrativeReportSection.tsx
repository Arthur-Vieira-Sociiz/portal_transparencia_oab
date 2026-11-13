import type { GeneralIndicators } from '@oab-transparencia/contracts/transparency'
import { formatInteger } from '@/lib/formatters'
import { reportsChartOptions } from '../data/reports-chart-options'
import { ReportMetric } from './ReportMetric'
import { ReportsChart } from './ReportsChart'

interface AdministrativeReportSectionProps {
  current: GeneralIndicators
  history: GeneralIndicators[]
  previous?: GeneralIndicators
  selectedExercise: number
}

function growthLabel(value: number, previousValue?: number) {
  const percentage = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : 0
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1).replace('.', ',')}%`
}

export function AdministrativeReportSection({
  current,
  history,
  previous,
  selectedExercise,
}: AdministrativeReportSectionProps) {
  const labels = history.map((indicator) => String(indicator.exercise))
  const currentMembers = current.activeLawyers + current.interns
  const previousMembers = previous
    ? previous.activeLawyers + previous.interns
    : undefined

  return (
    <>
      <h3>Indicadores Administrativos</h3>
      <div className="reports-grid reports-grid--three">
        <ReportMetric
          label="Advogados Ativos"
          value={formatInteger(current.activeLawyers)}
        />
        <ReportMetric
          label="Estagiários"
          value={formatInteger(current.interns)}
          tone="purple"
        />
        <ReportMetric
          label="Sociedades Registradas"
          value={formatInteger(current.registeredSocieties)}
          tone="orange"
        />
      </div>
      <ReportsChart
        title="Evolução dos Indicadores Administrativos"
        subtitle="Crescimento anual dos registros e cadastros institucionais"
        configuration={{
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Advogados',
                data: history.map((indicator) => indicator.activeLawyers),
                backgroundColor: '#2563eb',
                borderRadius: 4,
              },
              {
                label: 'Estagiários',
                data: history.map((indicator) => indicator.interns),
                backgroundColor: '#9333ea',
                borderRadius: 4,
              },
              {
                label: 'Sociedades',
                data: history.map((indicator) => indicator.registeredSocieties),
                backgroundColor: '#ea580c',
                borderRadius: 4,
              },
            ],
          },
          options: reportsChartOptions,
        }}
      />
      <ReportsChart
        title="Tendência de Crescimento"
        subtitle="Análise da evolução temporal dos registros"
        configuration={{
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Advogados',
                data: history.map((indicator) => indicator.activeLawyers),
                borderColor: '#2563eb',
                tension: 0.1,
              },
              {
                label: 'Estagiários',
                data: history.map((indicator) => indicator.interns),
                borderColor: '#9333ea',
                tension: 0.1,
              },
              {
                label: 'Sociedades',
                data: history.map((indicator) => indicator.registeredSocieties),
                borderColor: '#ea580c',
                tension: 0.1,
              },
            ],
          },
          options: reportsChartOptions,
        }}
      />
      <p className="reports-note">
        <strong>Sobre os indicadores:</strong> O acompanhamento dos indicadores
        administrativos permite uma visão clara da expansão da entidade. O
        crescimento constante no número de inscritos e sociedades reflete a
        dinâmica e a relevância da instituição no cenário regional.
      </p>
      <h3>Taxa de Crescimento Anual</h3>
      <div className="reports-grid reports-grid--four reports-growth">
        <ReportMetric
          label="Advogados"
          value={growthLabel(current.activeLawyers, previous?.activeLawyers)}
        />
        <ReportMetric
          label="Estagiários"
          value={growthLabel(current.interns, previous?.interns)}
          tone="purple"
        />
        <ReportMetric
          label="Sociedades registradas"
          value={growthLabel(
            current.registeredSocieties,
            previous?.registeredSocieties,
          )}
          tone="orange"
        />
        <ReportMetric
          label="Total inscritos"
          value={growthLabel(currentMembers, previousMembers)}
          tone="green"
        />
      </div>
      <h3>Indicadores Administrativos</h3>
      <div className="reports-grid reports-grid--four">
        <ReportMetric
          label="Atendimentos"
          value={formatInteger(current.appointments)}
          subtitle="Atendimentos finalizados"
        />
        <ReportMetric
          label="Protocolos"
          value={formatInteger(current.protocols)}
          subtitle="Protocolos em aberto"
        />
        <ReportMetric
          label="Certidões"
          value={formatInteger(current.certificates)}
          subtitle="Certidões emitidas"
        />
        <ReportMetric
          label="Ouvidoria"
          value={formatInteger(current.ombudsmanRequests)}
          subtitle="Manifestações recebidas"
        />
      </div>
      <div className="reports-banner">
        <span>
          Total de Serviços Prestados à Advocacia em {selectedExercise}
        </span>
        <strong>
          {formatInteger(
            current.appointments +
              current.protocols +
              current.certificates +
              current.ombudsmanRequests,
          )}
        </strong>
      </div>
    </>
  )
}
