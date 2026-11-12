import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Chart as ChartInstance, ChartConfiguration } from 'chart.js'
import { formatCurrency, formatInteger } from '../../../lib/formatters'
import { PublicPortalLayout } from '../components/PublicPortalLayout'
import { localPublicTransparencyRepository } from '../data/public.repository'
import '../public-portal.css'

function Metric({
  label,
  value,
  subtitle,
  tone = 'blue',
}: {
  label: string
  value: string
  subtitle?: string
  tone?: 'blue' | 'green' | 'orange' | 'purple'
}) {
  return (
    <article className={`reports-metric reports-metric--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {subtitle ? <small>{subtitle}</small> : null}
    </article>
  )
}

function ChartBox({
  title,
  subtitle,
  configuration,
}: {
  title: string
  subtitle: string
  configuration: ChartConfiguration
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    let isCurrent = true
    let chart: ChartInstance | undefined

    void import('chart.js/auto').then(({ default: Chart }) => {
      if (!isCurrent || !canvasRef.current) return
      chart = new Chart(canvasRef.current, configuration)
    })

    return () => {
      isCurrent = false
      chart?.destroy()
    }
  }, [configuration])

  return (
    <section className="reports-chart">
      <h4>{title}</h4>
      <p>{subtitle}</p>
      <canvas aria-label={title} ref={canvasRef} role="img" />
    </section>
  )
}

export function ReportsIndicatorsPage() {
  const [exercise, setExercise] = useState(2025)
  const page = useQuery({
    queryFn: () => localPublicTransparencyRepository.getReportsPage(),
    queryKey: ['public-transparency', 'reports'],
    staleTime: Number.POSITIVE_INFINITY,
  })
  if (page.isPending)
    return <p className="public-page-state">Carregando informações…</p>
  if (page.isError)
    return (
      <p className="public-page-state">
        Não foi possível carregar as informações.
      </p>
    )
  const current =
    page.data.indicators.find((item) => item.exercise === exercise) ??
    page.data.indicators.at(-1)
  if (!current) return null
  const available = current.plannedBudget - current.executedBudget
  const history = page.data.indicators
  const labels = history.map((item) => String(item.exercise))
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { usePointStyle: true, boxWidth: 10 },
      },
    },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
  }
  return (
    <PublicPortalLayout>
      <section className="reports-content" aria-labelledby="reports-title">
        <div className="reports-title">
          <h2 id="reports-title">Relatório Financeiro Consolidado</h2>
          <label>
            Ano
            <select
              value={exercise}
              onChange={(event) => setExercise(Number(event.target.value))}
            >
              {page.data.availableExercises.map((year) => (
                <option key={year}>{year}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="reports-grid reports-grid--three">
          <Metric
            label="Receita Total"
            value={formatCurrency(current.totalRevenue)}
            subtitle={`Exercício ${exercise}`}
            tone="green"
          />
          <Metric
            label="Despesa Total"
            value={formatCurrency(current.totalExpense)}
            subtitle={`Exercício ${exercise}`}
            tone="orange"
          />
          <Metric
            label="Resultado do Exercício"
            value={formatCurrency(current.exerciseResult)}
            subtitle={`Exercício ${exercise}`}
          />
        </div>
        <ChartBox
          title="Receita x Despesa - Evolução Anual"
          subtitle="Comparativo entre receitas e despesas dos últimos exercícios"
          configuration={{
            type: 'bar',
            data: {
              labels,
              datasets: [
                {
                  label: 'Receita',
                  data: history.map((item) => item.totalRevenue),
                  backgroundColor: '#059669',
                  borderRadius: 4,
                },
                {
                  label: 'Despesa',
                  data: history.map((item) => item.totalExpense),
                  backgroundColor: '#ea580c',
                  borderRadius: 4,
                },
              ],
            },
            options: chartOptions,
          }}
        />
        <p className="reports-note">
          <strong>Nota:</strong> Os valores apresentados são consolidados e
          representam a totalidade das receitas arrecadadas e despesas
          realizadas no exercício. Os dados são extraídos dos sistemas
          financeiro e orçamentário, garantindo conformidade com as normas de
          contabilidade pública.
        </p>
        <h3>Execução Orçamentária</h3>
        <div className="reports-grid reports-grid--three">
          <Metric
            label="Orçamento Previsto"
            value={formatCurrency(current.plannedBudget)}
            subtitle={`Dotação inicial - ${exercise}`}
            tone="orange"
          />
          <Metric
            label="Orçamento Executado"
            value={formatCurrency(current.executedBudget)}
            subtitle="Valor empenhado até o momento"
            tone="green"
          />
          <Metric
            label="Percentual de Execução"
            value={`${current.executionPercentage.toFixed(2).replace('.', ',')}%`}
            subtitle="Índice de execução orçamentária"
          />
        </div>
        <div className="reports-progress">
          <strong>Progresso da Execução Orçamentária</strong>
          <div className="reports-progress__summary">
            <span>Execução do exercício {exercise}</span>
            <b>{current.executionPercentage.toFixed(2).replace('.', ',')}%</b>
          </div>
          <div>
            <i style={{ width: `${current.executionPercentage}%` }} />
          </div>
          <small>Valor Disponível: {formatCurrency(available)}</small>
        </div>
        <ChartBox
          title="Evolução da Execução Orçamentária"
          subtitle="Histórico do percentual de execução nos últimos exercícios"
          configuration={{
            type: 'line',
            data: {
              labels,
              datasets: [
                {
                  label: '% Execução',
                  data: history.map((item) => item.executionPercentage),
                  borderColor: '#059669',
                  backgroundColor: '#059669',
                  borderWidth: 2,
                  tension: 0,
                },
              ],
            },
            options: {
              ...chartOptions,
              scales: { ...chartOptions.scales, y: { min: 0, max: 100 } },
            },
          }}
        />
        <p className="reports-note">
          <strong>Sobre a execução orçamentária:</strong> O percentual de
          execução é calculado pela relação entre o valor executado e o valor
          previsto no orçamento. Valores acima de 90% indicam excelente
          capacidade de planejamento e execução dos recursos públicos.
        </p>
        <h3>Indicadores Administrativos</h3>
        <div className="reports-grid reports-grid--three">
          <Metric
            label="Advogados Ativos"
            value={formatInteger(current.activeLawyers)}
          />
          <Metric
            label="Estagiários"
            value={formatInteger(current.interns)}
            tone="purple"
          />
          <Metric
            label="Sociedades Registradas"
            value={formatInteger(current.registeredSocieties)}
            tone="orange"
          />
        </div>
        <ChartBox
          title="Evolução dos Indicadores Administrativos"
          subtitle="Crescimento anual dos registros e cadastros institucionais"
          configuration={{
            type: 'bar',
            data: {
              labels,
              datasets: [
                {
                  label: 'Advogados',
                  data: history.map((item) => item.activeLawyers),
                  backgroundColor: '#2563eb',
                  borderRadius: 4,
                },
                {
                  label: 'Estagiários',
                  data: history.map((item) => item.interns),
                  backgroundColor: '#9333ea',
                  borderRadius: 4,
                },
                {
                  label: 'Sociedades',
                  data: history.map((item) => item.registeredSocieties),
                  backgroundColor: '#ea580c',
                  borderRadius: 4,
                },
              ],
            },
            options: chartOptions,
          }}
        />
        <ChartBox
          title="Tendência de Crescimento"
          subtitle="Análise da evolução temporal dos registros"
          configuration={{
            type: 'line',
            data: {
              labels,
              datasets: [
                {
                  label: 'Advogados',
                  data: history.map((item) => item.activeLawyers),
                  borderColor: '#2563eb',
                  tension: 0.1,
                },
                {
                  label: 'Estagiários',
                  data: history.map((item) => item.interns),
                  borderColor: '#9333ea',
                  tension: 0.1,
                },
                {
                  label: 'Sociedades',
                  data: history.map((item) => item.registeredSocieties),
                  borderColor: '#ea580c',
                  tension: 0.1,
                },
              ],
            },
            options: chartOptions,
          }}
        />
        <p className="reports-note">
          <strong>Sobre os indicadores:</strong> O acompanhamento dos
          indicadores administrativos permite uma visão clara da expansão da
          entidade. O crescimento constante no número de inscritos e sociedades
          reflete a dinâmica e a relevância da instituição no cenário regional.
        </p>
        <h3>Taxa de Crescimento Anual</h3>
        <div className="reports-grid reports-grid--four reports-growth">
          <Metric label="Advogados" value="+0,0%" />
          <Metric label="Estagiários" value="+0,0%" tone="purple" />
          <Metric label="Sociedades registradas" value="+0,0%" tone="orange" />
          <Metric label="Total Inscritos" value="+0,0%" tone="green" />
        </div>
        <h3>Indicadores Administrativos</h3>
        <div className="reports-grid reports-grid--four">
          <Metric
            label="Atendimentos"
            value={formatInteger(current.appointments)}
            subtitle="Atendimentos finalizados"
          />
          <Metric
            label="Protocolos"
            value={formatInteger(current.protocols)}
            subtitle="Protocolos em aberto"
          />
          <Metric
            label="Certidões"
            value={formatInteger(current.certificates)}
            subtitle="Certidões emitidas"
          />
          <Metric
            label="Ouvidoria"
            value={formatInteger(current.ombudsmanRequests)}
            subtitle="Manifestações recebidas"
          />
        </div>
        <div className="reports-banner">
          <span>Total de Serviços Prestados à Advocacia em {exercise}</span>
          <strong>
            {formatInteger(
              current.appointments +
                current.protocols +
                current.certificates +
                current.ombudsmanRequests,
            )}
          </strong>
        </div>
        <h3>Contratos</h3>
        <div className="reports-grid reports-grid--four">
          <Metric
            label="Contratos Ativos"
            value={formatInteger(current.activeContracts)}
            subtitle={`Em vigência - ${exercise}`}
          />
          <Metric
            label="Valor Total"
            value={formatCurrency(current.totalContractValue)}
            subtitle="Valor contratado"
            tone="purple"
          />
          <Metric
            label="Novos contratos"
            value={formatInteger(current.newBids)}
            subtitle={`Processos em ${exercise}`}
            tone="green"
          />
          <Metric
            label="Encerrados"
            value={formatInteger(current.closedContracts)}
            subtitle="Contratos finalizados"
            tone="orange"
          />
        </div>
        <ChartBox
          title="Evolução do Portfólio de Contratos"
          subtitle="Histórico de contratos ativos, novos contratos e encerramentos"
          configuration={{
            type: 'line',
            data: {
              labels,
              datasets: [
                {
                  label: 'Contratos Ativos',
                  data: history.map((item) => item.activeContracts),
                  borderColor: '#2563eb',
                  tension: 0.1,
                },
                {
                  label: 'Novos Contratos',
                  data: history.map((item) => item.newBids),
                  borderColor: '#9333ea',
                  tension: 0.1,
                },
                {
                  label: 'Contratos Encerrados',
                  data: history.map((item) => item.closedContracts),
                  borderColor: '#ea580c',
                  tension: 0.1,
                },
              ],
            },
            options: chartOptions,
          }}
        />
        <ChartBox
          title="Evolução do Valor Total Contratado"
          subtitle="Montante financeiro dos contratos por exercício"
          configuration={{
            type: 'line',
            data: {
              labels,
              datasets: [
                {
                  label: 'Valor Total',
                  data: history.map((item) => item.totalContractValue),
                  borderColor: '#2563eb',
                  backgroundColor: 'rgba(37, 99, 235, 0.2)',
                  fill: true,
                  tension: 0.1,
                },
              ],
            },
            options: chartOptions,
          }}
        />
        <p className="reports-note">
          <strong>Transparência nos Contratos:</strong> A gestão de contratos
          segue rigorosamente os princípios da legalidade e publicidade. Este
          painel permite monitorar a saúde financeira dos compromissos firmados
          e a eficiência das contratações.
        </p>
        <h3>Recursos Humanos</h3>
        <div className="reports-banner">
          <span>Total de Colaboradores em {exercise}</span>
          <strong>{formatInteger(current.employees)}</strong>
        </div>
        <p className="reports-note">
          <strong>Proteção de Dados Pessoais:</strong> Este painel apresenta
          exclusivamente dados consolidados e quantitativos. Não são exibidos
          nomes, remunerações individuais ou qualquer informação que permita
          identificação direta ou indireta de colaboradores, em total
          conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei
          13.709/2018).
        </p>
      </section>
    </PublicPortalLayout>
  )
}
