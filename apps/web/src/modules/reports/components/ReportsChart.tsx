import { useEffect, useRef } from 'react'
import type { Chart as ChartInstance, ChartConfiguration } from 'chart.js'

interface ReportsChartProps {
  configuration: ChartConfiguration
  subtitle: string
  title: string
}

export function ReportsChart({
  configuration,
  subtitle,
  title,
}: ReportsChartProps) {
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
