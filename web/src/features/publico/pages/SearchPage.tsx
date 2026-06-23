import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '../../../components/ui/AppShell.tsx'
import { EcoMap } from '../../../components/ui/EcoMap.tsx'
import { EmptyState } from '../../../components/ui/EmptyState.tsx'
import { FilterPanel } from '../../../components/ui/FilterPanel.tsx'
import { PointCard } from '../../../components/ui/PointCard.tsx'
import { PublicHeader } from '../../../components/ui/PublicHeader.tsx'
import { ecodescarteApi } from '../../../services/api/ecodescarte.ts'
import type { DropoffPointSummary, WasteType } from '../../../types/models.ts'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryKey = searchParams.toString()
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([])
  const [points, setPoints] = useState<DropoffPointSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ecodescarteApi.listWasteTypes().then(setWasteTypes).catch(() => setWasteTypes([]))
  }, [])

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    ecodescarteApi
      .listPublicPoints(new URLSearchParams(queryKey))
      .then(setPoints)
      .catch((fetchError) => {
        setError(fetchError instanceof Error ? fetchError.message : 'Falha ao carregar os pontos.')
      })
      .finally(() => setIsLoading(false))
  }, [queryKey])

  return (
    <AppShell header={<PublicHeader />}>
      <section className="mt-6 grid flex-1 gap-6 lg:grid-cols-[360px_1fr]">
        <aside>
          <FilterPanel
            initialValues={{
              wasteTypeId: searchParams.get('wasteTypeId') ?? '',
              district: searchParams.get('district') ?? '',
              q: searchParams.get('q') ?? '',
            }}
            wasteTypes={wasteTypes}
            onSubmit={(values) => {
              const next = new URLSearchParams()
              if (values.wasteTypeId) next.set('wasteTypeId', values.wasteTypeId)
              if (values.district) next.set('district', values.district)
              if (values.q) next.set('q', values.q)
              setSearchParams(next)
            }}
          />

          <div className="mt-4 rounded-xl bg-eco-50 p-4 text-sm text-eco-900">
            <strong>Resultado:</strong> {points.length} ponto(s) encontrado(s).
          </div>
        </aside>

        <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-950">Pontos proximos</h2>
            {isLoading ? <EmptyState description="Carregando resultados..." title="Buscando pontos" /> : null}
            {error ? <EmptyState description={error} title="Falha na consulta" /> : null}
            {!isLoading && !error && points.length === 0 ? (
              <EmptyState
                description="Nenhum ponto foi encontrado com os filtros atuais. Voce pode sugerir um novo local."
                title="Sem resultados"
              />
            ) : null}
            {!isLoading && !error
              ? points.map((point) => <PointCard key={point.id} point={point} />)
              : null}
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <EcoMap
              compact
              points={points.map((point) => ({
                id: point.id,
                name: point.name,
                addressLine: point.addressLine,
                latitude: point.latitude,
                longitude: point.longitude,
                status: point.validationStatus,
              }))}
            />
          </div>
        </section>
      </section>
    </AppShell>
  )
}
