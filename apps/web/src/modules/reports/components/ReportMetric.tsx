interface ReportMetricProps {
  label: string
  subtitle?: string
  tone?: 'blue' | 'green' | 'orange' | 'purple'
  value: string
}

export function ReportMetric({
  label,
  subtitle,
  tone = 'blue',
  value,
}: ReportMetricProps) {
  return (
    <article className={`reports-metric reports-metric--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {subtitle ? <small>{subtitle}</small> : null}
    </article>
  )
}
