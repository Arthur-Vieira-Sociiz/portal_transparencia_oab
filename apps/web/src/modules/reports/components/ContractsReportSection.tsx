import type { GeneralIndicators } from '@oab-transparencia/contracts/transparency'
import { formatCurrency, formatInteger } from '@/lib/formatters'
import { reportsChartOptions } from '../data/reports-chart-options'
import { ReportMetric } from './ReportMetric'
import { ReportsChart } from './ReportsChart'

interface ContractsReportSectionProps {
  current: GeneralIndicators
  history: GeneralIndicators[]
  selectedExercise: number
}

export function ContractsReportSection({
  current,
  history,
  selectedExercise,
}: ContractsReportSectionProps) {
  const labels = history.map((indicator) => String(indicator.exercise))

  return (
    <>
      <h3>Contratos</h3>
      <div className="reports-grid reports-grid--four">
        <ReportMetric
          label="Contratos Ativos"
          value={formatInteger(current.activeContracts)}
          subtitle={`Em vigência - ${selectedExercise}`}
        />
        <ReportMetric
          label="Valor Total"
          value={formatCurrency(current.totalContractValue)}
          subtitle="Valor contratado"
          tone="purple"
        />
        <ReportMetric
          label="Novos contratos"
          value={formatInteger(current.newBids)}
          subtitle={`Processos em ${selectedExercise}`}
          tone="green"
        />
        <ReportMetric
          label="Encerrados"
          value={formatInteger(current.closedContracts)}
          subtitle="Contratos finalizados"
          tone="orange"
        />
      </div>
      <ReportsChart
        title="Evolução do Portfólio de Contratos"
        subtitle="Histórico de contratos ativos, novos contratos e encerramentos"
        configuration={{
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Contratos Ativos',
                data: history.map((indicator) => indicator.activeContracts),
                borderColor: '#2563eb',
                tension: 0.1,
              },
              {
                label: 'Novos Contratos',
                data: history.map((indicator) => indicator.newBids),
                borderColor: '#9333ea',
                tension: 0.1,
              },
              {
                label: 'Contratos Encerrados',
                data: history.map((indicator) => indicator.closedContracts),
                borderColor: '#ea580c',
                tension: 0.1,
              },
            ],
          },
          options: reportsChartOptions,
        }}
      />
      <ReportsChart
        title="Evolução do Valor Total Contratado"
        subtitle="Montante financeiro dos contratos por exercício"
        configuration={{
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Valor Total',
                data: history.map((indicator) => indicator.totalContractValue),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                fill: true,
                tension: 0.1,
              },
            ],
          },
          options: reportsChartOptions,
        }}
      />
      <p className="reports-note">
        <strong>Transparência nos Contratos:</strong> A gestão de contratos
        segue rigorosamente os princípios da legalidade e publicidade. Este
        painel permite monitorar a saúde financeira dos compromissos firmados e
        a eficiência das contratações.
      </p>
    </>
  )
}
