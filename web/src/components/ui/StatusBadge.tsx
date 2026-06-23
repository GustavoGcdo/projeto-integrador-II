import type { ValidationStatus } from '../../types/models.ts'

interface StatusBadgeProps {
  status: ValidationStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles =
    status === 'validated'
      ? 'bg-eco-100 text-eco-700'
      : 'bg-amber-100 text-amber-700'

  const label = status === 'validated' ? 'Validado' : 'Confirmar horario'

  return <span className={`rounded-full px-3 py-1 text-sm font-medium ${styles}`}>{label}</span>
}
