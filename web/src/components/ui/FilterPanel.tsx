import type { FormEvent } from 'react'
import type { WasteType } from '../../types/models.ts'

interface FilterPanelProps {
  wasteTypes: WasteType[]
  initialValues: {
    wasteTypeId: string
    district: string
    q: string
  }
  onSubmit: (values: { wasteTypeId: string; district: string; q: string }) => void
}

export function FilterPanel({
  wasteTypes,
  initialValues,
  onSubmit,
}: FilterPanelProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onSubmit({
      wasteTypeId: String(form.get('wasteTypeId') ?? ''),
      district: String(form.get('district') ?? ''),
      q: String(form.get('q') ?? ''),
    })
  }

  return (
    <form
      className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl font-bold text-slate-950">Buscar pontos</h2>
      <div className="mt-5 space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-600" htmlFor="wasteTypeId">
            Tipo de residuo
          </label>
          <select
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
            defaultValue={initialValues.wasteTypeId}
            id="wasteTypeId"
            name="wasteTypeId"
          >
            <option value="">Todos</option>
            {wasteTypes.map((wasteType) => (
              <option key={wasteType.id} value={wasteType.id}>
                {wasteType.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600" htmlFor="district">
            Bairro ou regiao
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
            defaultValue={initialValues.district}
            id="district"
            name="district"
            placeholder="Centro"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600" htmlFor="q">
            Busca livre
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
            defaultValue={initialValues.q}
            id="q"
            name="q"
            placeholder="Pilhas, lampadas, oleo..."
          />
        </div>
        <button className="w-full rounded-xl bg-eco-600 py-3 font-semibold text-white" type="submit">
          Aplicar filtros
        </button>
      </div>
    </form>
  )
}
