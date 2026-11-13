export const reportsChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { usePointStyle: true, boxWidth: 10 },
    },
  },
  scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
}
