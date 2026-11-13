import type { GeneralIndicators } from '@oab-transparencia/contracts/transparency'
import { formatCurrency } from '@/lib/formatters'
import { reportsChartOptions } from '../data/reports-chart-options'
import { ReportMetric } from './ReportMetric'
import { ReportsChart } from './ReportsChart'

interface FinancialReportSectionProps {
  current: GeneralIndicators
  history: GeneralIndicators[]
  selectedExercise: number
}

export function FinancialReportSection({
  current,
  history,
  selectedExercise,
}: FinancialReportSectionProps) {
  const labels = history.map((indicator) => String(indicator.exercise))
  const available = current.plannedBudget - current.executedBudget

  return (
    <>
      <div className="reports-grid reports-grid--three">
        <ReportMetric
          label="Receita Total"
          value={formatCurrency(current.totalRevenue)}
          subtitle={`Exercício ${selectedExercise}`}
          tone="green"
        />
        <ReportMetric
          label="Despesa Total"
          value={formatCurrency(current.totalExpense)}
          subtitle={`Exercício ${selectedExercise}`}
          tone="orange"
        />
        <ReportMetric
          label="Resultado do Exercício"
          value={formatCurrency(current.exerciseResult)}
          subtitle={`Exercício ${selectedExercise}`}
        />
      </div>
      <ReportsChart
        title="Receita x Despesa - Evolução Anual"
        subtitle="Comparativo entre receitas e despesas dos últimos exercícios"
        configuration={{
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Receita',
                data: history.map((indicator) => indicator.totalRevenue),
                backgroundColor: '#059669',
                borderRadius: 4,
              },
              {
                label: 'Despesa',
                data: history.map((indicator) => indicator.totalExpense),
                backgroundColor: '#ea580c',
                borderRadius: 4,
              },
            ],
          },
          options: reportsChartOptions,
        }}
      />
      <p className="reports-note">
        <strong>Nota:</strong> Os valores apresentados são consolidados e
        representam a totalidade das receitas arrecadadas e despesas realizadas
        no exercício. Os dados são extraídos dos sistemas financeiro e
        orçamentário, garantindo conformidade com as normas de contabilidade
        pública.
      </p>
      <h3>Execução Orçamentária</h3>
      <div className="reports-grid reports-grid--three">
        <ReportMetric
          label="Orçamento Previsto"
          value={formatCurrency(current.plannedBudget)}
          subtitle={`Dotação inicial - ${selectedExercise}`}
          tone="orange"
        />
        <ReportMetric
          label="Orçamento Executado"
          value={formatCurrency(current.executedBudget)}
          subtitle="Valor empenhado até o momento"
          tone="green"
        />
        <ReportMetric
          label="Percentual de Execução"
          value={`${current.executionPercentage.toFixed(2).replace('.', ',')}%`}
          subtitle="Índice de execução orçamentária"
        />
      </div>
      <div className="reports-progress">
        <strong>Progresso da Execução Orçamentária</strong>
        <div className="reports-progress__summary">
          <span>Execução do exercício {selectedExercise}</span>
          <b>{current.executionPercentage.toFixed(2).replace('.', ',')}%</b>
        </div>
        <div>
          <i style={{ width: `${current.executionPercentage}%` }} />
        </div>
        <small>Valor Disponível: {formatCurrency(available)}</small>
      </div>
      <ReportsChart
        title="Evolução da Execução Orçamentária"
        subtitle="Histórico do percentual de execução nos últimos exercícios"
        configuration={{
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: '% Execução',
                data: history.map((indicator) => indicator.executionPercentage),
                borderColor: '#059669',
                backgroundColor: '#059669',
                borderWidth: 2,
                tension: 0,
              },
            ],
          },
          options: {
            ...reportsChartOptions,
            scales: {
              ...reportsChartOptions.scales,
              y: { min: 0, max: 100 },
            },
          },
        }}
      />
      <p className="reports-note">
        <strong>Sobre a execução orçamentária:</strong> O percentual de execução
        é calculado pela relação entre o valor executado e o valor previsto no
        orçamento. Valores acima de 90% indicam excelente capacidade de
        planejamento e execução dos recursos públicos.
      </p>
    </>
  )
}
