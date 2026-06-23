import { useEffect, useState } from 'react'
import { AdminHeader } from '../../../components/ui/AdminHeader.tsx'
import { AdminSummaryCards } from '../../../components/ui/AdminSummaryCards.tsx'
import { AppShell } from '../../../components/ui/AppShell.tsx'
import { EmptyState } from '../../../components/ui/EmptyState.tsx'
import { SuggestionQueue } from '../../../components/ui/SuggestionQueue.tsx'
import { ApiError } from '../../../services/api/client.ts'
import { ecodescarteApi } from '../../../services/api/ecodescarte.ts'
import type {
  AdminDropoffPoint,
  DashboardSummary,
  SuggestionItem,
  WasteType,
} from '../../../types/models.ts'
import { useAdminSession } from '../hooks/useAdminSession.tsx'

export function AdminDashboardPage() {
  const { logout, token } = useAdminSession()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [points, setPoints] = useState<AdminDropoffPoint[]>([])
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([])
  const [newWasteType, setNewWasteType] = useState('')
  const [newPointName, setNewPointName] = useState('')
  const [newPointAddress, setNewPointAddress] = useState('')
  const [newPointDistrict, setNewPointDistrict] = useState('')
  const [newPointCity, setNewPointCity] = useState('Campo Grande')
  const [newPointLatitude, setNewPointLatitude] = useState('')
  const [newPointLongitude, setNewPointLongitude] = useState('')
  const [selectedWasteTypeIds, setSelectedWasteTypeIds] = useState<number[]>([])
  const [coordinateDrafts, setCoordinateDrafts] = useState<Record<number, { latitude: string; longitude: string }>>({})
  const [error, setError] = useState<string | null>(null)

  async function loadDashboard() {
    if (!token) {
      return
    }

    try {
      const [dashboardData, suggestionData, pointData, wasteTypeData] = await Promise.all([
        ecodescarteApi.getAdminDashboard(token),
        ecodescarteApi.listAdminSuggestions(token),
        ecodescarteApi.listAdminPoints(token),
        ecodescarteApi.listAdminWasteTypes(token),
      ])

      setSummary(dashboardData)
      setSuggestions(suggestionData)
      setPoints(pointData)
      setWasteTypes(wasteTypeData)
      setError(null)
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 401) {
        logout()
      }
      setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar o painel.')
    }
  }

  useEffect(() => {
    void loadDashboard()
  }, [token])

  if (!summary && !error) {
    return (
      <AppShell header={<AdminHeader />}>
        <div className="mt-8">
          <EmptyState description="Carregando indicadores e sugestoes..." title="Buscando painel" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell header={<AdminHeader />}>
      <div className="mt-8 space-y-8">
        {error ? <EmptyState description={error} title="Sessao expirada ou falha de carregamento" /> : null}
        {summary ? <AdminSummaryCards summary={summary} /> : null}

        <SuggestionQueue
          coordinateDrafts={coordinateDrafts}
          suggestions={suggestions}
          onCoordinateChange={(suggestionId, field, value) => {
            setCoordinateDrafts((current) => ({
              ...current,
              [suggestionId]: {
                latitude: current[suggestionId]?.latitude ?? '',
                longitude: current[suggestionId]?.longitude ?? '',
                [field]: value,
              },
            }))
          }}
          onApprove={async (suggestion) => {
            if (!token) {
              return
            }

            const matchedWasteType = wasteTypes.find((wasteType) =>
              suggestion.wasteTypeText.toLowerCase().includes(wasteType.name.toLowerCase()),
            )

            const coordinateDraft = coordinateDrafts[suggestion.id]

            await ecodescarteApi.approveSuggestion(token, suggestion.id, {
              wasteTypeIds: matchedWasteType ? [matchedWasteType.id] : undefined,
              validationStatus: 'validated',
              status: 'active',
              latitude: parseOptionalCoordinate(coordinateDraft?.latitude),
              longitude: parseOptionalCoordinate(coordinateDraft?.longitude),
            })
            await loadDashboard()
          }}
          onReject={async (suggestion) => {
            if (!token) {
              return
            }

            await ecodescarteApi.rejectSuggestion(token, suggestion.id)
            await loadDashboard()
          }}
        />

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Pontos cadastrados</h2>
            <form
              className="mt-4 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
              onSubmit={(event) => {
                event.preventDefault()
                if (!token || selectedWasteTypeIds.length === 0) {
                  return
                }

                void ecodescarteApi
                  .createAdminPoint(token, {
                    name: newPointName,
                    addressText: newPointAddress,
                    district: newPointDistrict,
                    city: newPointCity,
                    wasteTypeIds: selectedWasteTypeIds,
                    latitude: parseOptionalCoordinate(newPointLatitude),
                    longitude: parseOptionalCoordinate(newPointLongitude),
                  })
                  .then(() => {
                    setNewPointName('')
                    setNewPointAddress('')
                    setNewPointDistrict('')
                    setNewPointCity('Campo Grande')
                    setNewPointLatitude('')
                    setNewPointLongitude('')
                    setSelectedWasteTypeIds([])
                    return loadDashboard()
                  })
              }}
            >
              <input
                className="rounded-xl border border-slate-200 px-4 py-3"
                placeholder="Nome do ponto"
                required
                value={newPointName}
                onChange={(event) => setNewPointName(event.target.value)}
              />
              <input
                className="rounded-xl border border-slate-200 px-4 py-3"
                placeholder="Endereco"
                required
                value={newPointAddress}
                onChange={(event) => setNewPointAddress(event.target.value)}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="rounded-xl border border-slate-200 px-4 py-3"
                  placeholder="Bairro"
                  required
                  value={newPointDistrict}
                  onChange={(event) => setNewPointDistrict(event.target.value)}
                />
                <input
                  className="rounded-xl border border-slate-200 px-4 py-3"
                  placeholder="Cidade"
                  required
                  value={newPointCity}
                  onChange={(event) => setNewPointCity(event.target.value)}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="rounded-xl border border-slate-200 px-4 py-3"
                  inputMode="decimal"
                  placeholder="Latitude"
                  step="any"
                  type="number"
                  value={newPointLatitude}
                  onChange={(event) => setNewPointLatitude(event.target.value)}
                />
                <input
                  className="rounded-xl border border-slate-200 px-4 py-3"
                  inputMode="decimal"
                  placeholder="Longitude"
                  step="any"
                  type="number"
                  value={newPointLongitude}
                  onChange={(event) => setNewPointLongitude(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {wasteTypes.map((wasteType) => {
                  const selected = selectedWasteTypeIds.includes(wasteType.id)

                  return (
                    <button
                      key={wasteType.id}
                      className={`rounded-full px-3 py-2 text-sm ${
                        selected
                          ? 'bg-eco-600 text-white'
                          : 'bg-white text-slate-600 ring-1 ring-slate-200'
                      }`}
                      type="button"
                      onClick={() =>
                        setSelectedWasteTypeIds((current) =>
                          selected
                            ? current.filter((id) => id !== wasteType.id)
                            : [...current, wasteType.id],
                        )
                      }
                    >
                      {wasteType.name}
                    </button>
                  )
                })}
              </div>
              <button className="rounded-xl bg-eco-600 px-4 py-3 font-semibold text-white" type="submit">
                Cadastrar ponto
              </button>
            </form>
            <div className="mt-4 space-y-3">
              {points.map((point) => (
                <div
                  key={point.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{point.name}</p>
                    <p className="text-sm text-slate-500">{point.addressLine}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {point.latitude != null && point.longitude != null
                        ? `Mapa ativo: ${point.latitude}, ${point.longitude}`
                        : 'Sem coordenadas cadastradas'}
                    </p>
                  </div>
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    type="button"
                    onClick={() => {
                      if (!token) {
                        return
                      }
                      void ecodescarteApi.inactivatePoint(token, point.id).then(loadDashboard)
                    }}
                  >
                    Inativar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Tipos de residuo</h2>
            <form
              className="mt-4 flex gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                if (!token || !newWasteType.trim()) {
                  return
                }

                void ecodescarteApi
                  .createWasteType(token, { name: newWasteType.trim() })
                  .then(() => {
                    setNewWasteType('')
                    return loadDashboard()
                  })
              }}
            >
              <input
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3"
                placeholder="Novo tipo de residuo"
                value={newWasteType}
                onChange={(event) => setNewWasteType(event.target.value)}
              />
              <button className="rounded-xl bg-eco-600 px-4 py-3 font-semibold text-white" type="submit">
                Adicionar
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {wasteTypes.map((wasteType) => (
                <span
                  key={wasteType.id}
                  className="rounded-full bg-eco-100 px-3 py-2 text-sm text-eco-800"
                >
                  {wasteType.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

function parseOptionalCoordinate(value?: string) {
  if (!value) {
    return undefined
  }

  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : undefined
}
