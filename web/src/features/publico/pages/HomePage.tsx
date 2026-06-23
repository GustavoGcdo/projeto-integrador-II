import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppShell } from '../../../components/ui/AppShell.tsx'
import { EcoMap } from '../../../components/ui/EcoMap.tsx'
import { PublicHeader } from '../../../components/ui/PublicHeader.tsx'
import { ecodescarteApi } from '../../../services/api/ecodescarte.ts'
import type { DropoffPointSummary, WasteType } from '../../../types/models.ts'

export function HomePage() {
  const navigate = useNavigate()
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([])
  const [points, setPoints] = useState<DropoffPointSummary[]>([])
  const [query, setQuery] = useState('Pilhas e baterias')

  useEffect(() => {
    ecodescarteApi.listWasteTypes().then(setWasteTypes).catch(() => setWasteTypes([]))
    ecodescarteApi
      .listPublicPoints(new URLSearchParams())
      .then(setPoints)
      .catch(() => setPoints([]))
  }, [])

  return (
    <AppShell header={<PublicHeader />}>
      <section className="grid flex-1 items-center gap-12 px-2 py-10 lg:grid-cols-2">
        <div>
          <span className="inline-flex rounded-full bg-eco-100 px-4 py-2 text-sm font-medium text-eco-700">
            Educacao ambiental e comunidade
          </span>
          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-tight text-slate-950 lg:text-6xl">
            Encontre onde descartar residuos corretamente.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Consulte pontos de coleta para pilhas, eletronicos, oleo de cozinha,
            lampadas e materiais reciclaveis.
          </p>

          <div className="mt-8 rounded-[28px] border border-slate-100 bg-white p-4 shadow-xl">
            <label className="text-sm font-semibold text-slate-700" htmlFor="home-query">
              O que voce deseja descartar?
            </label>
            <div className="mt-3 flex flex-col gap-3 md:flex-row">
              <input
                className="flex-1 rounded-xl border border-slate-200 px-4 py-4 text-slate-700 outline-none"
                id="home-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button
                className="rounded-xl bg-eco-600 px-6 py-4 font-semibold text-white shadow"
                type="button"
                onClick={() => navigate(`/pontos?q=${encodeURIComponent(query)}`)}
              >
                Buscar pontos
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {wasteTypes.slice(0, 4).map((wasteType) => (
                <button
                  key={wasteType.id}
                  className="rounded-full bg-slate-100 px-3 py-2"
                  type="button"
                  onClick={() => navigate(`/pontos?wasteTypeId=${wasteType.id}`)}
                >
                  {wasteType.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Link className="text-sm font-semibold text-eco-700" to="/sugerir-ponto">
              Conhece um local? Envie uma sugestao para validacao.
            </Link>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-2xl">
          <EcoMap
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
    </AppShell>
  )
}
