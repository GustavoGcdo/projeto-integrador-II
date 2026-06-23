import type {
  AdminDropoffPoint,
  DashboardSummary,
  DropoffPointDetail,
  DropoffPointSummary,
  LoginResponse,
  SuggestionItem,
  SuggestionPayload,
  WasteType,
} from '../../types/models.ts'
import { request } from './client.ts'

export const ecodescarteApi = {
  listWasteTypes() {
    return request<WasteType[]>('/waste-types')
  },
  listPublicPoints(params: URLSearchParams) {
    return request<DropoffPointSummary[]>(`/dropoff-points?${params.toString()}`)
  },
  getPublicPoint(id: string) {
    return request<DropoffPointDetail>(`/dropoff-points/${id}`)
  },
  createSuggestion(payload: SuggestionPayload) {
    return request<{ id: number; status: string }>('/suggestions', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  createCorrection(pointId: string, payload: SuggestionPayload) {
    return request<{ id: number; status: string }>(
      `/dropoff-points/${pointId}/corrections`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    )
  },
  login(email: string, password: string) {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
  getAdminDashboard(token: string) {
    return request<DashboardSummary>('/admin/dashboard', { token })
  },
  listAdminSuggestions(token: string) {
    return request<SuggestionItem[]>('/admin/suggestions?status=pending', { token })
  },
  updateSuggestion(token: string, suggestionId: number, payload: Partial<SuggestionItem>) {
    return request<SuggestionItem>(`/admin/suggestions/${suggestionId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(payload),
    })
  },
  approveSuggestion(
    token: string,
    suggestionId: number,
    payload: {
      wasteTypeIds?: number[]
      status?: 'active' | 'inactive'
      validationStatus?: 'validated' | 'needs_confirmation'
      latitude?: number
      longitude?: number
    } = {},
  ) {
    return request<{ id: number; status: string }>(
      `/admin/suggestions/${suggestionId}/approve`,
      {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
      },
    )
  },
  rejectSuggestion(token: string, suggestionId: number, reason?: string) {
    return request<{ id: number; status: string }>(
      `/admin/suggestions/${suggestionId}/reject`,
      {
        method: 'POST',
        token,
        body: JSON.stringify(reason ? { reason } : {}),
      },
    )
  },
  listAdminPoints(token: string) {
    return request<AdminDropoffPoint[]>('/admin/dropoff-points', { token })
  },
  createAdminPoint(
    token: string,
    payload: {
      name: string
      addressText: string
      district: string
      city: string
      state?: string
      wasteTypeIds: number[]
      latitude?: number
      longitude?: number
      description?: string
      openingHours?: string
      phone?: string
    },
  ) {
    return request('/admin/dropoff-points', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    })
  },
  inactivatePoint(token: string, pointId: number) {
    return request<{ id: number; status: string }>(`/admin/dropoff-points/${pointId}/inactivate`, {
      method: 'PATCH',
      token,
    })
  },
  listAdminWasteTypes(token: string) {
    return request<WasteType[]>('/admin/waste-types', { token })
  },
  createWasteType(
    token: string,
    payload: { name: string; description?: string; disposalGuidance?: string },
  ) {
    return request<WasteType>('/admin/waste-types', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    })
  },
}
