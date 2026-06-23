import { Link } from 'react-router-dom'
import type { DropoffPointSummary } from '../../types/models.ts'
import { StatusBadge } from './StatusBadge.tsx'

interface PointCardProps {
  point: DropoffPointSummary
}

export function PointCard({ point }: PointCardProps) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-950">{point.name}</h3>
          <p className="text-slate-500">{point.addressLine}</p>
        </div>
        <StatusBadge status={point.validationStatus} />
      </div>
      <p className="mt-3 text-sm text-slate-600">{point.acceptedWasteSummary}</p>
      <Link
        className="mt-4 inline-flex rounded-lg border border-eco-600 px-4 py-2 text-sm font-medium text-eco-700"
        to={`/pontos/${point.id}`}
      >
        Ver detalhes
      </Link>
    </article>
  )
}
