import { ArrowLeft, Route } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../../../components/ui/AppShell.tsx'
import { EmptyState } from '../../../components/ui/EmptyState.tsx'
import { MapPlaceholder } from '../../../components/ui/MapPlaceholder.tsx'
import { StatusBadge } from '../../../components/ui/StatusBadge.tsx'
import { SuggestionForm } from '../../../components/ui/SuggestionForm.tsx'
import { ecodescarteApi } from '../../../services/api/ecodescarte.ts'
import type { DropoffPointDetail, WasteType } from '../../../types/models.ts'

export function PointDetailPage() {
  const { id = '' } = useParams()
  const [point, setPoint] = useState<DropoffPointDetail | null>(null)
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([])
  const [showCorrectionForm, setShowCorrectionForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ecodescarteApi.listWasteTypes().then(setWasteTypes).catch(() => setWasteTypes([]))
    ecodescarteApi
      .getPublicPoint(id)
      .then(setPoint)
      .catch((fetchError) => {
        setError(fetchError instanceof Error ? fetchError.message : 'Falha ao carregar o ponto.')
      })
  }, [id])

  if (error) {
    return (
      <AppShell>
        <EmptyState description={error} title="Nao foi possivel carregar o ponto" />
      </AppShell>
    )
  }

  if (!point) {
    return (
      <AppShell>
        <EmptyState description="Carregando os detalhes do ponto..." title="Buscando informacoes" />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">EcoDescarte Web / Pontos de descarte</p>
          <h1 className="text-4xl font-bold text-slate-950">{point.name}</h1>
        </div>
        <Link
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3"
          to="/pontos"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para busca
        </Link>
      </header>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">Informacoes do ponto</h2>
                <p className="mt-2 text-slate-600">
                  Local validado para descarte de residuos especificos.
                </p>
              </div>
              <StatusBadge status={point.validationStatus} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <InfoCard label="Endereco" value={point.addressLine} />
              <InfoCard label="Horario" value={point.openingHours ?? 'Nao informado'} />
              <InfoCard label="Contato" value={point.phone ?? 'Nao informado'} />
              <InfoCard label="Ultima atualizacao" value={new Date(point.updatedAt).toLocaleDateString('pt-BR')} />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Residuos aceitos</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {point.acceptedWaste.map((waste) => (
                <span key={waste.id} className="rounded-full bg-eco-100 px-4 py-2 text-eco-800">
                  {waste.name}
                </span>
              ))}
            </div>
            <p className="mt-5 text-slate-600">{point.description ?? 'Sem observacoes adicionais para este ponto.'}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button className="inline-flex items-center gap-2 rounded-xl bg-eco-600 px-6 py-4 font-semibold text-white" type="button">
              <Route className="h-4 w-4" />
              Como chegar
            </button>
            <button
              className="rounded-xl border border-slate-300 bg-white px-6 py-4 font-semibold"
              type="button"
              onClick={() => setShowCorrectionForm((current) => !current)}
            >
              Sugerir correcao
            </button>
          </div>

          {showCorrectionForm ? (
            <SuggestionForm
              description="Envie ajustes para endereco, horario ou residuos aceitos. A revisao sera feita pela equipe administrativa."
              kind="correction"
              submitLabel="Enviar correcao"
              title="Sugerir correcao de informacoes"
              wasteTypes={wasteTypes}
              onSubmit={(payload) => ecodescarteApi.createCorrection(id, payload).then(() => undefined)}
            />
          ) : null}
        </div>

        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Localizacao</h2>
          <div className="mt-4">
            <MapPlaceholder
              points={[
                {
                  id: point.id,
                  label: point.name,
                  status: point.validationStatus,
                },
              ]}
            />
          </div>
        </aside>
      </section>
    </AppShell>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  )
}
