import { MapPin } from 'lucide-react'
import type { ValidationStatus } from '../../types/models.ts'

interface MapPinItem {
  id: number
  label: string
  status: ValidationStatus
}

interface MapPlaceholderProps {
  points: MapPinItem[]
  compact?: boolean
}

const positions = [
  'left-[14%] top-[18%]',
  'right-[18%] top-[40%]',
  'left-[38%] bottom-[18%]',
  'right-[26%] top-[18%]',
]

export function MapPlaceholder({ points, compact = false }: MapPlaceholderProps) {
  return (
    <div className={`map-grid relative overflow-hidden rounded-[28px] bg-eco-50 ${compact ? 'h-72' : 'h-full min-h-[28rem]'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(24,165,102,0.18),transparent_28%)]" />
      {points.map((point, index) => (
        <div
          key={point.id}
          className={`absolute ${positions[index % positions.length]}`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg ${
              point.status === 'validated' ? 'bg-eco-600' : 'bg-amber-500'
            }`}
          >
            <MapPin className="h-5 w-5" />
          </div>
          {!compact ? (
            <div className="mt-2 rounded-2xl bg-white/95 px-3 py-2 text-sm shadow-sm">
              <strong className="block text-slate-900">{point.label}</strong>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}
