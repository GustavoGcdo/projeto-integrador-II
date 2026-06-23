import { useState, type FormEvent } from 'react'
import type { SuggestionKind, WasteType } from '../../types/models.ts'

interface SuggestionFormProps {
  kind: SuggestionKind
  submitLabel: string
  title: string
  description: string
  wasteTypes: WasteType[]
  onSubmit: (payload: {
    kind: SuggestionKind
    placeName?: string
    addressText?: string
    districtText?: string
    cityText?: string
    wasteTypeText?: string
    openingHoursText?: string
    note?: string
  }) => Promise<void>
}

export function SuggestionForm({
  description,
  kind,
  onSubmit,
  submitLabel,
  title,
  wasteTypes,
}: SuggestionFormProps) {
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSending(true)
    setError(null)

    const form = new FormData(event.currentTarget)
    const readValue = (key: string) => {
      const value = String(form.get(key) ?? '').trim()
      return value.length > 0 ? value : undefined
    }

    try {
      await onSubmit({
        kind,
        placeName: readValue('placeName'),
        addressText: readValue('addressText'),
        districtText: readValue('districtText'),
        cityText: readValue('cityText'),
        wasteTypeText: readValue('wasteTypeText'),
        openingHoursText: readValue('openingHoursText'),
        note: readValue('note'),
      })
      setIsSent(true)
      event.currentTarget.reset()
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Nao foi possivel enviar a sugestao.',
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form
      className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
      <p className="mt-3 text-slate-600">{description}</p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="placeName">
            Nome do local
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
            id="placeName"
            name="placeName"
            placeholder="Ex.: Mercado Boa Compra"
            required={kind === 'new_point'}
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="addressText">
            Endereco
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
            id="addressText"
            name="addressText"
            placeholder="Rua, numero e complemento"
            required={kind === 'new_point'}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="districtText">
            Bairro
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
            id="districtText"
            name="districtText"
            placeholder="Centro"
            required={kind === 'new_point'}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="cityText">
            Cidade
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
            defaultValue="Campo Grande"
            id="cityText"
            name="cityText"
            required={kind === 'new_point'}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="wasteTypeText">
            Tipo de residuo
          </label>
          <select
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
            id="wasteTypeText"
            name="wasteTypeText"
            required={kind === 'new_point'}
          >
            <option value="">Selecione</option>
            {wasteTypes.map((wasteType) => (
              <option key={wasteType.id} value={wasteType.name}>
                {wasteType.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="openingHoursText">
            Horario, se souber
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
            id="openingHoursText"
            name="openingHoursText"
            placeholder="Seg. a sex., 8h as 17h"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="note">
            Observacoes
          </label>
          <textarea
            className="mt-2 h-32 w-full rounded-xl border border-slate-200 px-4 py-3"
            id="note"
            name="note"
            placeholder="Informe detalhes uteis para validacao"
            required={kind === 'correction'}
          />
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-eco-50 p-4 text-sm text-eco-900">
        <strong>Importante:</strong> a mensagem entra como pendente e so aparece publicamente apos validacao.
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {isSent ? <p className="mt-4 text-sm text-eco-700">Sugestao enviada com sucesso.</p> : null}

      <div className="mt-6 flex justify-end">
        <button
          className="rounded-xl bg-eco-600 px-6 py-3 font-semibold text-white disabled:opacity-60"
          disabled={isSending}
          type="submit"
        >
          {isSending ? 'Enviando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
