import { ENV } from '@/lib/constants'

export interface EntityLocation {
  id: string
  entity_type: 'fpo' | 'processor' | 'farmer'
  name: string
  latitude: number
  longitude: number
  city?: string
  state: string
  district?: string
  village?: string
  is_verified?: boolean
  total_members?: number
  processing_capacity?: number
  total_land?: number
  kyc_status?: string
  contact_person?: string
  phone?: string
}

export interface EntityLocationsSummary {
  total_locations: number
  fpo_count: number
  processor_count: number
  farmer_count: number
}

export interface EntityLocationsResponse {
  success: boolean
  message: string
  data: {
    locations: EntityLocation[]
    summary: EntityLocationsSummary
  }
}

/**
 * Fetch all entity locations (FPOs, Processors, Farmers) with coordinates
 */
export async function getEntityLocations(token: string): Promise<EntityLocationsResponse> {
  const response = await fetch(`${ENV.API_URL}/government/entity-locations/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch entity locations')
  }

  return response.json()
}
