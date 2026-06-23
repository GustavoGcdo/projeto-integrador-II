import type { DashboardSummary } from '../../types/models.ts'

interface AdminSummaryCardsProps {
  summary: DashboardSummary
}

export function AdminSummaryCards({ summary }: AdminSummaryCardsProps) {
  const items = [
    { label: 'Pontos cadastrados', value: summary.registeredPoints },
    { label: 'Sugestoes pendentes', value: summary.pendingSuggestions },
    { label: 'Pontos validados', value: summary.validatedPoints },
    { label: 'Correcoes recebidas', value: summary.correctionSuggestions },
  ]

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{item.label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{item.value}</p>
        </div>
      ))}
    </section>
  )
}
