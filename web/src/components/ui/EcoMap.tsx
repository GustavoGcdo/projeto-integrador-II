import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { Recycle } from 'lucide-react'
import type { ValidationStatus } from '../../types/models.ts'

interface EcoMapPoint {
  id: number
  name: string
  addressLine?: string
  latitude: number | null
  longitude: number | null
  status: ValidationStatus
}

interface EcoMapProps {
  compact?: boolean
  emptyMessage?: string
  points: EcoMapPoint[]
}

const CAMPO_GRANDE_CENTER: L.LatLngExpression = [-20.46971, -54.620121]
const DEFAULT_ZOOM = 13
const DETAIL_ZOOM = 16

export function EcoMap({
  compact = false,
  emptyMessage = 'Nenhum ponto com localizacao cadastrada para exibir no mapa.',
  points,
}: EcoMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerLayerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return
    }

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(CAMPO_GRANDE_CENTER, DEFAULT_ZOOM)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    markerLayerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    const handleResize = () => {
      map.invalidateSize()
    }

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(handleResize)
        : null

    window.addEventListener('resize', handleResize)

    resizeObserver?.observe(containerRef.current)

    return () => {
      window.removeEventListener('resize', handleResize)
      resizeObserver?.disconnect()
      markerLayerRef.current?.clearLayers()
      markerLayerRef.current = null
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const markerLayer = markerLayerRef.current

    if (!map || !markerLayer) {
      return
    }

    markerLayer.clearLayers()

    const mappedPoints = points.filter(
      (point) => point.latitude != null && point.longitude != null,
    )

    if (mappedPoints.length === 0) {
      map.setView(CAMPO_GRANDE_CENTER, DEFAULT_ZOOM)
      map.invalidateSize()
      return
    }

    const bounds = L.latLngBounds(
      mappedPoints.map((point) => [point.latitude!, point.longitude!] as [number, number]),
    )

    for (const point of mappedPoints) {
      const marker = L.marker([point.latitude!, point.longitude!], {
        icon: createMarkerIcon(point.status),
        title: point.name,
      })

      marker.bindPopup(createPopupContent(point))
      marker.addTo(markerLayer)
    }

    if (mappedPoints.length === 1) {
      map.setView(bounds.getCenter(), DETAIL_ZOOM)
    } else {
      map.fitBounds(bounds, {
        padding: [32, 32],
      })
    }

    map.invalidateSize()
  }, [points])

  const hasPoints = points.some(
    (point) => point.latitude != null && point.longitude != null,
  )

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-slate-200 bg-white ${compact ? 'h-72' : 'h-full min-h-[28rem]'}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(24,165,102,0.12),transparent_28%)]" />
      <div className="eco-map absolute inset-0" ref={containerRef} />
      {!hasPoints ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 p-4 text-sm text-slate-600 shadow-sm backdrop-blur">
          {emptyMessage}
        </div>
      ) : null}
    </div>
  )
}

function createMarkerIcon(status: ValidationStatus) {
  const recycleIcon = renderToStaticMarkup(
    <Recycle className="eco-map-marker__icon" strokeWidth={2.25} />,
  )

  return L.divIcon({
    className: '',
    html: `<span class="eco-map-marker eco-map-marker--${status}">${recycleIcon}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  })
}

function createPopupContent(point: EcoMapPoint) {
  const address = point.addressLine ? `<p>${escapeHtml(point.addressLine)}</p>` : ''
  const statusLabel =
    point.status === 'validated' ? 'Local validado' : 'Aguardando confirmacao'

  return `
    <div class="eco-map-popup">
      <strong>${escapeHtml(point.name)}</strong>
      ${address}
      <span>${statusLabel}</span>
    </div>
  `
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
