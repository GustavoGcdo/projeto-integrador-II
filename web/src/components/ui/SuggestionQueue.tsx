import { useState } from 'react'
import type { SuggestionItem } from '../../types/models.ts'

interface SuggestionQueueProps {
  coordinateDrafts: Record<number, { latitude: string; longitude: string }>
  suggestions: SuggestionItem[]
  onCoordinateChange: (suggestionId: number, field: 'latitude' | 'longitude', value: string) => void
  onApprove: (suggestion: SuggestionItem) => Promise<void>
  onReject: (suggestion: SuggestionItem) => Promise<void>
}

export function SuggestionQueue({
  coordinateDrafts,
  onCoordinateChange,
  onApprove,
  onReject,
  suggestions,
}: SuggestionQueueProps) {
  const [busyId, setBusyId] = useState<number | null>(null)

  async function handleAction(
    suggestion: SuggestionItem,
    action: (current: SuggestionItem) => Promise<void>,
  ) {
    setBusyId(suggestion.id)
    try {
      await action(suggestion)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-2xl font-bold text-slate-950">Sugestoes pendentes</h2>
        <p className="text-slate-500">Analise as informacoes antes de publicar.</p>
      </div>

      <div className="divide-y divide-slate-100">
        {suggestions.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            Nenhuma sugestao pendente no momento.
          </div>
        ) : null}
        {suggestions.map((suggestion) => (
          <article
            key={suggestion.id}
            className="grid gap-4 p-5 xl:grid-cols-[1fr_220px] xl:items-center"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-bold text-slate-950">{suggestion.placeName}</h3>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-700">
                  {suggestion.kind === 'correction' ? 'Correcao' : 'Novo ponto'}
                </span>
              </div>
              <p className="mt-1 text-slate-500">
                {suggestion.addressText} - {suggestion.districtText}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Aceita: {suggestion.wasteTypeText}.{' '}
                {suggestion.note ? suggestion.note : 'Sem observacoes adicionais.'}
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  inputMode="decimal"
                  placeholder="Latitude"
                  step="any"
                  type="number"
                  value={coordinateDrafts[suggestion.id]?.latitude ?? ''}
                  onChange={(event) =>
                    onCoordinateChange(suggestion.id, 'latitude', event.target.value)
                  }
                />
                <input
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  inputMode="decimal"
                  placeholder="Longitude"
                  step="any"
                  type="number"
                  value={coordinateDrafts[suggestion.id]?.longitude ?? ''}
                  onChange={(event) =>
                    onCoordinateChange(suggestion.id, 'longitude', event.target.value)
                  }
                />
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                className="rounded-lg bg-eco-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                disabled={busyId === suggestion.id}
                type="button"
                onClick={() => handleAction(suggestion, onApprove)}
              >
                Aprovar
              </button>
              <button
                className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 disabled:opacity-60"
                disabled={busyId === suggestion.id}
                type="button"
                onClick={() => handleAction(suggestion, onReject)}
              >
                Rejeitar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
