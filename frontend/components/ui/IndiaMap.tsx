'use client'

import { Loader2, MapPin } from 'lucide-react'

interface EntityLocation {
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

interface IndiaMapProps {
  locations: EntityLocation[]
  loading?: boolean
}

/**
 * Placeholder Map Component
 * 
 * To enable the interactive map, install the required packages:
 * npm install react-leaflet leaflet react-leaflet-cluster --legacy-peer-deps
 * npm install -D @types/leaflet --legacy-peer-deps
 * 
 * Then uncomment the full implementation below and remove this placeholder.
 */
export default function IndiaMap({ locations, loading = false }: IndiaMapProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  const getMarkerColor = (entityType: string) => {
    switch (entityType) {
      case 'fpo':
        return 'bg-green-600'
      case 'processor':
        return 'bg-blue-600'
      case 'farmer':
        return 'bg-orange-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border bg-gray-50 p-6">
      <div className="text-center mb-6">
        <MapPin className="h-16 w-16 mx-auto text-primary mb-4" />
        <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
        <p className="text-sm text-gray-600 mb-4">
          Install leaflet packages to enable the interactive India map visualization
        </p>
        <code className="text-xs bg-gray-200 p-2 rounded block max-w-2xl mx-auto">
          npm install react-leaflet leaflet react-leaflet-cluster --legacy-peer-deps
        </code>
      </div>

      {/* Entity List View */}
      <div className="mt-8 max-h-[400px] overflow-y-auto">
        <h4 className="font-semibold mb-4 text-gray-900">
          Registered Entities ({locations.length})
        </h4>
        <div className="space-y-2">
          {locations.map((location) => (
            <div
              key={location.id}
              className="flex items-start gap-3 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className={`w-3 h-3 rounded-full ${getMarkerColor(location.entity_type)} mt-1 flex-shrink-0`}></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{location.name}</p>
                <p className="text-sm text-gray-600 capitalize">{location.entity_type}</p>
                <p className="text-xs text-gray-500">
                  {location.city || location.village || location.district}, {location.state}
                </p>
              </div>
              <div className="text-xs text-gray-500 flex-shrink-0">
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
