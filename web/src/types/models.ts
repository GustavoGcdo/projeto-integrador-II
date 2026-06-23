export type ValidationStatus = 'validated' | 'needs_confirmation'
export type SuggestionKind = 'new_point' | 'correction'
export type SuggestionStatus = 'pending' | 'approved' | 'rejected'

export interface WasteType {
  id: number
  name: string
  description: string | null
  disposalGuidance: string | null
  active: boolean
}

export interface DropoffPointSummary {
  id: number
  name: string
  addressLine: string
  acceptedWasteSummary: string
  validationStatus: ValidationStatus
}

export interface DropoffPointDetail {
  id: number
  name: string
  description: string | null
  phone: string | null
  openingHours: string | null
  validationStatus: ValidationStatus
  status: string
  updatedAt: string
  addressLine: string
  district: string
  city: string
  acceptedWaste: Array<{
    id: number
    name: string
    note: string | null
  }>
}

export interface SuggestionPayload {
  kind: SuggestionKind
  placeName?: string
  addressText?: string
  districtText?: string
  cityText?: string
  wasteTypeText?: string
  openingHoursText?: string
  note?: string
}

export interface AdminUser {
  id: number
  name: string
  email: string
  role: string
}

export interface LoginResponse {
  accessToken: string
  user: AdminUser
}

export interface DashboardSummary {
  registeredPoints: number
  pendingSuggestions: number
  validatedPoints: number
  correctionSuggestions: number
}

export interface SuggestionItem {
  id: number
  kind: SuggestionKind
  status: SuggestionStatus
  placeName: string
  addressText: string
  districtText: string
  cityText: string
  wasteTypeText: string
  openingHoursText: string | null
  note: string | null
  referencePointId: number | null
  reviewedAt: string | null
  submittedAt: string
}

export interface AdminDropoffPoint {
  id: number
  name: string
  status: string
  validationStatus: ValidationStatus
  addressLine: string
}
