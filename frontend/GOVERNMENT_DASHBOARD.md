# Government Dashboard - Developer Documentation

## Overview
The Government Dashboard provides comprehensive Business Intelligence tools for monitoring and managing the entire oilseed supply chain ecosystem in India.

## Architecture

### Directory Structure
```
frontend/
├── app/government/
│   ├── dashboard/           # National overview dashboard
│   ├── fpo-monitoring/      # FPO health monitoring
│   ├── farmer-registry/     # Farmer database
│   ├── processor-monitoring/# Processing facility tracking
│   ├── retailer-analytics/  # Retailer performance
│   ├── tracking/            # Supply chain shipment tracking
│   ├── procurement/         # Procurement analytics
│   └── market-prices/       # Market price analysis
├── lib/
│   ├── api/                 # API client functions
│   ├── hooks/               # Custom React hooks
│   │   └── useGovernment.ts # Government-specific hooks
│   ├── stores/              # Zustand state management
│   │   └── governmentStore.ts
│   ├── types/               # TypeScript interfaces
│   └── utils/               # Utility functions
```

## API Endpoints

### Backend Routes (Django)
All endpoints are prefixed with `/api/government/`

| Endpoint | Method | Description | Query Params |
|----------|--------|-------------|--------------|
| `/dashboard/` | GET | National overview | - |
| `/heatmap/` | GET | State-wise production | `crop_type`, `year` |
| `/fpo-monitoring/` | GET | FPO health scores | `state`, `district` |
| `/farmer-registry/` | GET | Farmer database | `state`, `district`, `kyc_status`, `crop_type` |
| `/processor-monitoring/` | GET | Processor metrics | `state` |
| `/retailer-analytics/` | GET | Retailer performance | `state` |
| `/supply-chain-tracking/` | GET | Shipment tracking | `status`, `crop_type` |
| `/procurement-analytics/` | GET | Procurement trends | `crop_type`, `state`, `days` |
| `/market-prices/` | GET | Price analytics | `crop_type`, `state`, `days` |

## Frontend Components

### 1. National Dashboard (`/government/dashboard`)
**Features:**
- Total counts (FPOs, Farmers, Processors, Retailers)
- Production metrics in MT
- Market value tracking
- Crop distribution charts
- State-wise production heatmap
- Monthly trend analysis

**Data Structure:**
```typescript
interface GovernmentDashboard {
  total_fpos: number;
  total_farmers: number;
  total_processors: number;
  total_retailers: number;
  total_production_mt: number;
  total_market_value: number;
  crop_distribution: CropDistribution[];
  state_production: StateProduction[];
  monthly_trends: MonthlyTrend[];
}
```

### 2. FPO Monitoring (`/government/fpo-monitoring`)
**Features:**
- Health scoring system (0-100)
- Health categories: Excellent (≥80), Good (60-79), Average (40-59), Poor (<40)
- State/District filters
- Verification status tracking
- Member count and procurement data
- Geographic coordinates for mapping

**Filters:**
- State dropdown
- District text input

**Health Score Calculation:**
Based on backend algorithm considering:
- Member growth
- Procurement volume
- Financial health
- Technology adoption

### 3. Farmer Registry (`/government/farmer-registry`)
**Features:**
- Comprehensive farmer database
- KYC status tracking (verified/pending/rejected)
- Land ownership data
- Primary crops tracking
- FPO membership status
- Earnings tracking
- Geographic distribution

**Filters:**
- State dropdown
- District text input
- KYC Status dropdown
- Crop Type dropdown
- Clear All button

**Summary Cards:**
- Total Farmers
- Total Land (acres)
- Verified Farmers
- Verification Rate (%)

### 4. Processor Monitoring (`/government/processor-monitoring`)
**Features:**
- Processing capacity tracking (MT/day)
- Batch completion rates
- Processing efficiency metrics
- Bid success rates
- Verification status

**Metrics:**
- Total Processors
- Total Capacity
- Average Efficiency

**Efficiency Badges:**
- Excellent: ≥90%
- Good: 75-89%
- Average: 60-74%
- Poor: <60%

### 5. Retailer Analytics (`/government/retailer-analytics`)
**Features:**
- Order fulfillment tracking
- Transaction value monitoring
- Performance KPIs
- GSTIN verification

**Metrics:**
- Total Retailers
- Total Transaction Value

**Fulfillment Badges:**
- Excellent: ≥95%
- Good: 80-94%
- Average: 60-79%
- Poor: <60%

### 6. Supply Chain Tracking (`/government/tracking`)
**Features:**
- Real-time shipment tracking
- GPS coordinates
- Route visualization
- Status monitoring
- ETA tracking

**Shipment Statuses:**
- Pending (Yellow)
- In Transit (Blue)
- Delivered (Green)
- Delayed (Red)

**Metrics:**
- Total Shipments
- In Transit
- Delivered
- Pending

**Map Integration:**
- Placeholder for Leaflet/Mapbox
- GPS coordinate display
- Route origin/destination tracking

### 7. Procurement Analytics (`/government/procurement`)
**Features:**
- Crop-wise breakdown
- Daily procurement trends
- Status distribution
- Price analytics
- Volume tracking

**Filters:**
- Crop Type
- Time Period (7/30/90 days)

**Metrics:**
- Total Lots
- Total Volume (quintals)
- Average Price
- Total Value

**Status Types:**
- Open
- In Progress
- Closed
- Sold

### 8. Market Prices (`/government/market-prices`)
**Features:**
- MSP comparison
- Price trend analysis
- Crop-wise price tracking
- Price range monitoring

**Filters:**
- Crop Type
- State
- Time Period (7/30/90 days)

**Metrics:**
- Average Price
- Min Price
- Max Price
- Price Range

**MSP Badges:**
- Above MSP (Green)
- Below MSP (Red)
- No MSP (Gray)

## Hooks

### useGovernment.ts
Custom hooks for data fetching with SWR:

```typescript
// National Dashboard
useNationalDashboard()

// State Heatmap
useStateHeatmap(cropType?, year?)

// FPO Monitoring
useFPOMonitoring(state?, district?)

// Farmer Registry
useFarmerRegistry(state?, district?, kycStatus?, cropType?)

// Processor Monitoring
useProcessorMonitoring(state?)

// Retailer Analytics
useRetailerAnalytics(state?)

// Supply Chain Tracking
useSupplyChainTracking(status?, cropType?)

// Procurement Analytics
useProcurementAnalytics(cropType?, state?, days?)

// Market Prices
useMarketPrices(cropType?, state?, days?)

// Approval Queue
useApprovalQueue()
```

**Hook Pattern:**
```typescript
const {
  data,           // Full response data
  isLoading,      // Loading state
  error,          // Error object
  refresh,        // Manual refresh function
  updateFilters,  // Update filter function (if applicable)
} = useHookName(params);
```

## State Management

### governmentStore.ts
Zustand store for persisting filters across sessions:

```typescript
interface GovernmentState {
  // Filters for each dashboard
  dashboardFilters: {...}
  fpoFilters: {...}
  farmerFilters: {...}
  processorFilters: {...}
  retailerFilters: {...}
  supplyChainFilters: {...}
  procurementFilters: {...}
  marketPricesFilters: {...}
  
  // Actions
  setDashboardFilters()
  setFPOFilters()
  clearAllFilters()
  clearFiltersForView()
}
```

**Usage:**
```typescript
import { useGovernmentStore } from '@/lib/stores/governmentStore';

const { fpoFilters, setFPOFilters } = useGovernmentStore();
```

## Utility Functions

### Government-Specific Utilities (`lib/utils/index.ts`)

```typescript
// Badge helpers
getHealthScoreColor(score: number): string
getHealthStatus(score: number): { label, color }
getEfficiencyBadge(efficiency: number): { label, color }
getFulfillmentBadge(rate: number): { label, color }
getKYCBadge(status: string): { label, color }
getShipmentStatusBadge(status: string): { label, color }
getLotStatusBadge(status: string): { label, color }
getMSPBadge(priceVsMsp: number | null): { label, color }

// Calculations
calculateVerificationRate(verified, total): number
formatPercentage(value, decimals?): string
quintalsToMetricTons(quintals): string

// Trend Analysis
getTrendIndicator(current, previous): { direction, percentage, color }

// Data Export
exportToCSV(data, filename): void

// Date Formatting
formatIndianDate(date): string
daysDifference(date1, date2?): number

// Helpers
getStateName(stateCode, states): string
getCropDisplayName(cropType): string
```

## Constants

### CROPS (lib/constants.ts)
```typescript
export const CROPS = [
  'Soybean',
  'Mustard',
  'Groundnut',
  'Sunflower',
  'Safflower',
  'Sesame',
  'Linseed',
  'Niger',
] as const;
```

### INDIAN_STATES (lib/constants.ts)
```typescript
export const INDIAN_STATES = [
  ['andhra_pradesh', 'Andhra Pradesh'],
  ['karnataka', 'Karnataka'],
  // ... 36 states/UTs
] as const;
```

## Common Patterns

### Page Structure
```typescript
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';

function PageContent() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/government/endpoint/');
      const data = await response.json();
      setData(data.data);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      {/* Summary Cards */}
      {/* Filters */}
      {/* Data Table */}
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['government']}>
      <DashboardLayout>
        <PageContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
```

### Filter Card Pattern
```typescript
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Filter className="w-5 h-5" />
      Filters
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter Name
        </label>
        <select
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All</option>
          {/* Options */}
        </select>
      </div>
      <div className="flex items-end">
        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
        >
          Clear Filters
        </button>
      </div>
    </div>
  </CardContent>
</Card>
```

### Summary Cards Pattern
```typescript
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Metric Name</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatNumber(value)}
          </p>
        </div>
        <Icon className="w-8 h-8 text-blue-600" />
      </div>
    </CardContent>
  </Card>
</div>
```

## Future Enhancements

### Map Integration
Install and configure Leaflet or Mapbox:
```bash
npm install leaflet react-leaflet
npm install @types/leaflet -D
```

**MapComponent.tsx:**
```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export function MapComponent({ data }) {
  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {data.map(item => (
        <Marker key={item.id} position={[item.latitude, item.longitude]}>
          <Popup>{item.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

### Chart Integration
Install Recharts or Chart.js:
```bash
npm install recharts
```

**LineChart Example:**
```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

<LineChart width={600} height={300} data={priceTrends}>
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="avg_price" stroke="#3b82f6" />
</LineChart>
```

## Best Practices

1. **Data Fetching:**
   - Use SWR for automatic caching and revalidation
   - Implement loading states
   - Handle errors gracefully
   - Show empty states

2. **Filtering:**
   - Persist filters in Zustand store
   - Clear filters functionality
   - URL-based filtering (future)

3. **Performance:**
   - Paginate large datasets
   - Debounce search inputs
   - Lazy load components
   - Optimize re-renders with useMemo/useCallback

4. **Accessibility:**
   - ARIA labels on interactive elements
   - Keyboard navigation support
   - Screen reader friendly

5. **Mobile Responsiveness:**
   - Grid layouts with responsive breakpoints
   - Horizontal scroll for tables
   - Touch-friendly buttons

## Troubleshooting

### Common Issues

**1. Data not loading:**
- Check backend API is running
- Verify JWT token in localStorage
- Check network tab for errors
- Ensure correct API endpoint

**2. Filters not working:**
- Check useEffect dependencies
- Verify query parameter formatting
- Check backend accepts filter params

**3. Type errors:**
- Ensure types are imported from `@/lib/types`
- Check API response matches interface
- Update types if backend changes

**4. State not persisting:**
- Check Zustand persist configuration
- Clear localStorage if needed
- Verify store is properly imported

## Testing

### Unit Tests (Future)
```typescript
import { render, screen } from '@testing-library/react';
import FPOMonitoringPage from './page';

test('renders FPO monitoring page', () => {
  render(<FPOMonitoringPage />);
  expect(screen.getByText('FPO Monitoring')).toBeInTheDocument();
});
```

### E2E Tests (Future)
```typescript
describe('Government Dashboard', () => {
  it('should display dashboard metrics', () => {
    cy.visit('/government/dashboard');
    cy.get('[data-testid="total-fpos"]').should('be.visible');
  });
});
```

## Support

For issues or questions:
1. Check backend API documentation
2. Review Django admin logs
3. Check browser console for errors
4. Verify authentication token
5. Contact backend team for API issues
