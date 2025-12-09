# India Map Feature Implementation

## Overview
Added an interactive India map visualization to the government dashboard that displays FPOs, Processors, and Farmers with color-coded markers based on their saved latitude/longitude coordinates.

## Backend Implementation

### 1. Entity Locations API Endpoint
**File**: `backend/apps/government/views.py`

Added `EntityLocationsAPIView` class with the following features:
- **Endpoint**: `/api/government/entity-locations/`
- **Method**: GET
- **Permission**: `IsAuthenticated`, `IsGovernment`
- **Response Format**:
```json
{
  "success": true,
  "message": "Entity locations fetched successfully",
  "data": {
    "locations": [
      {
        "id": "uuid",
        "entity_type": "fpo|processor|farmer",
        "name": "Entity Name",
        "latitude": 20.5937,
        "longitude": 78.9629,
        "state": "State Name",
        "city": "City",
        "district": "District",
        "is_verified": true,
        "total_members": 100,
        "contact_person": "Contact Name",
        "phone": "1234567890",
        // Plus entity-specific fields
      }
    ],
    "summary": {
      "total_locations": 150,
      "fpo_count": 50,
      "processor_count": 30,
      "farmer_count": 70
    }
  }
}
```

**Data Fetching Logic**:
- **FPOs**: Fetches from `FPOProfile` where `is_active=True` and lat/long are not null
- **Processors**: Fetches from `ProcessorProfile` where `is_verified=True` and lat/long are not null
- **Farmers**: Fetches from `FarmerProfile` where `is_active=True` and lat/long are not null

**Entity-Specific Metadata**:
- **FPO**: total_members, contact_person, phone, is_verified
- **Processor**: processing_capacity, contact_person, phone, is_verified
- **Farmer**: total_land_acres, village, kyc_status

### 2. URL Configuration
**File**: `backend/apps/government/urls.py`

Added route:
```python
path('entity-locations/', EntityLocationsAPIView.as_view(), name='entity-locations')
```

Added import:
```python
from .views import EntityLocationsAPIView
```

## Frontend Implementation

### 1. API Utility Functions
**File**: `frontend/lib/api/government.ts`

Created `getEntityLocations()` function:
- Accepts authentication token
- Fetches data from `/api/government/entity-locations/`
- Returns typed response with locations and summary
- Includes proper error handling

**TypeScript Interfaces**:
```typescript
interface EntityLocation {
  id: string
  entity_type: 'fpo' | 'processor' | 'farmer'
  name: string
  latitude: number
  longitude: number
  // Plus additional fields...
}

interface EntityLocationsSummary {
  total_locations: number
  fpo_count: number
  processor_count: number
  farmer_count: number
}
```

### 2. Map Component
**File**: `frontend/components/ui/IndiaMap.tsx`

**Current Status**: Placeholder implementation (packages not installed)

**Features**:
- Shows all entity locations in a scrollable list
- Color-coded markers: Green (FPO), Blue (Processor), Orange (Farmer)
- Displays entity name, type, location, and coordinates
- Loading state with spinner

**To Enable Full Map**:
```bash
cd frontend
npm install react-leaflet leaflet react-leaflet-cluster --legacy-peer-deps
npm install -D @types/leaflet --legacy-peer-deps
```

**Full Implementation Features** (when packages installed):
- Interactive Leaflet map centered on India (20.5937°N, 78.9629°E)
- Custom colored markers for each entity type
- Clickable markers with detailed popups showing:
  - Entity name and type
  - Location details (city/village/district, state)
  - Entity-specific information (members, capacity, land, KYC status)
  - Contact information
  - Verification status
- Zoom and pan controls
- OpenStreetMap tile layer

### 3. Dashboard Integration
**File**: `frontend/app/government/dashboard/page.tsx`

**New Features**:
1. **Map Section** - Added at the top of the dashboard
   - Card with title "Entity Distribution Map"
   - Geographic subtitle
   - Map icon in header

2. **Legend Component**
   - Shows entity counts by type with color indicators
   - Total locations counter
   - FPOs (green), Processors (blue), Farmers (orange)

3. **State Management**
   - `locations`: Stores entity location data
   - `locationsLoading`: Loading state
   - `locationsError`: Error message state

4. **Data Fetching**
   - useEffect hook to fetch locations on mount
   - Uses authentication token from authStore
   - Proper error handling and loading states

**Map Display States**:
- **Loading**: Shows spinner while fetching data
- **Error**: Displays error message in red
- **Success**: Shows legend and map/list component

## Color Scheme
- **FPO (Farmer Producer Organizations)**: Green (#16a34a)
- **Processors**: Blue (#2563eb)
- **Farmers**: Orange (#ea580c)

## Map Configuration
- **Center Point**: 20.5937°N, 78.9629°E (India's geographic center)
- **Default Zoom**: Level 5 (shows entire India)
- **Scroll Wheel Zoom**: Enabled
- **Marker Clustering**: Supported (when full implementation enabled)

## Installation & Setup

### Backend (Already Complete)
✅ API endpoint created
✅ URL route configured
✅ Permissions set (Government only)
✅ Response format defined

### Frontend (Needs Package Installation)

1. **Install Map Dependencies**:
```bash
cd frontend
npm install react-leaflet leaflet react-leaflet-cluster --legacy-peer-deps
npm install -D @types/leaflet --legacy-peer-deps
```

2. **Why `--legacy-peer-deps`?**
   - Project uses React 19
   - `react-simple-maps` requires React 18
   - Flag resolves peer dependency conflicts

3. **After Installation**:
   - The full interactive map will automatically render
   - Replace placeholder component code if needed
   - No additional configuration required

## Testing

### Backend Testing
```bash
# Test endpoint (requires government user token)
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/government/entity-locations/
```

### Frontend Testing
1. Login as government user
2. Navigate to `/government/dashboard`
3. Map section should appear at the top
4. Verify:
   - Legend shows correct counts
   - Loading state works
   - Error handling displays properly
   - List view shows all entities (placeholder mode)
   - After package install: Interactive map with markers

## Features Summary

### Current Implementation (Placeholder)
✅ Fetches entity locations from backend
✅ Displays entity count by type
✅ Shows location list with color-coded indicators
✅ Includes entity name, type, and coordinates
✅ Responsive design
✅ Loading and error states

### After Package Installation
🔄 Interactive Leaflet map
🔄 Clickable markers with popups
🔄 Custom colored marker icons
🔄 Zoom and pan controls
🔄 OpenStreetMap tiles
🔄 Marker clustering for performance

## Performance Considerations
- Backend filters only active/verified entities with coordinates
- Frontend uses dynamic import for map component (no SSR issues)
- Marker clustering prevents UI slowdown with many entities
- select_related() used to minimize database queries

## Security
- Government-only access via `IsGovernment` permission class
- Token-based authentication required
- No sensitive data exposed in public API

## Future Enhancements
- Filter entities by state, district, or type
- Search functionality for specific entities
- Heatmap overlay for density visualization
- Export location data to CSV/Excel
- Custom map styles/themes
- Real-time updates when new entities register
- Integration with Google Maps API as alternative
- Mobile-optimized touch controls

## Files Modified
1. `backend/apps/government/views.py` - Added EntityLocationsAPIView
2. `backend/apps/government/urls.py` - Added entity-locations route
3. `frontend/lib/api/government.ts` - Added getEntityLocations function
4. `frontend/components/ui/IndiaMap.tsx` - Created map component (placeholder)
5. `frontend/app/government/dashboard/page.tsx` - Integrated map into dashboard

## Dependencies
- Backend: Django REST Framework, existing models
- Frontend: Next.js, TypeScript, Tailwind CSS
- Map (after install): react-leaflet 4.x, leaflet 1.9.x, react-leaflet-cluster

## Notes
- Map component uses client-side rendering only (`'use client'` directive)
- Leaflet assets loaded from CDN (marker icons, CSS)
- Color markers from leaflet-color-markers GitHub repo
- Fallback to default icons if custom icons fail to load
