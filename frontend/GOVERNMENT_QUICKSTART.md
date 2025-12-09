# Government Dashboard - Quick Start Guide

## Installation & Setup

All dependencies are already installed. The government dashboard is ready to use.

## Basic Usage

### 1. Import Required Modules

```typescript
// Hooks
import {
  useNationalDashboard,
  useFPOMonitoring,
  useFarmerRegistry,
  // ... other hooks
} from '@/lib/hooks/useGovernment';

// Store
import { useGovernmentStore } from '@/lib/stores/governmentStore';

// Utils
import {
  formatCurrency,
  formatNumber,
  getHealthStatus,
  getKYCBadge,
  // ... other utils
} from '@/lib/utils';

// Constants
import { CROPS, INDIAN_STATES } from '@/lib/constants';

// Types
import type {
  FPOMonitoring,
  FarmerRegistry,
  // ... other types
} from '@/lib/types';
```

### 2. Using Hooks in Components

```typescript
'use client';

import { useFPOMonitoring } from '@/lib/hooks/useGovernment';

export default function FPOMonitoringPage() {
  const { fpos, stats, isLoading, updateFilters } = useFPOMonitoring();
  
  if (isLoading) return <Loading />;
  
  return (
    <div>
      <h1>Total FPOs: {stats.total_count}</h1>
      {fpos.map(fpo => (
        <div key={fpo.id}>{fpo.organization_name}</div>
      ))}
    </div>
  );
}
```

### 3. Using Filters

```typescript
const [state, setState] = useState('');
const [district, setDistrict] = useState('');

const { farmers, updateFilters } = useFarmerRegistry(state, district);

// Update filters
const handleStateChange = (newState: string) => {
  setState(newState);
  updateFilters({ state: newState });
};
```

### 4. Using the Store

```typescript
import { useGovernmentStore } from '@/lib/stores/governmentStore';

function MyComponent() {
  const {
    fpoFilters,
    setFPOFilters,
    clearFiltersForView,
  } = useGovernmentStore();
  
  // Set filters
  setFPOFilters({ state: 'karnataka' });
  
  // Clear filters
  clearFiltersForView('fpo');
}
```

## Examples

### Example 1: FPO Monitoring with Filters

```typescript
'use client';

import { useState } from 'react';
import { useFPOMonitoring } from '@/lib/hooks/useGovernment';
import { INDIAN_STATES } from '@/lib/constants';
import { getHealthStatus } from '@/lib/utils';

export default function FPOPage() {
  const [state, setState] = useState('');
  const { fpos, stats, isLoading } = useFPOMonitoring(state);

  return (
    <div className="p-6">
      <select value={state} onChange={(e) => setState(e.target.value)}>
        <option value="">All States</option>
        {INDIAN_STATES.map(([code, name]) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>

      <div className="mt-6 grid grid-cols-4 gap-4">
        <div>Total: {stats.total_count}</div>
        <div>Excellent: {stats.excellent_count}</div>
        <div>Good: {stats.good_count}</div>
        <div>Needs Attention: {stats.needs_attention_count}</div>
      </div>

      <div className="mt-6 space-y-4">
        {fpos.map(fpo => {
          const { label, color } = getHealthStatus(fpo.health_score);
          return (
            <div key={fpo.id} className="p-4 bg-white rounded-lg">
              <h3>{fpo.organization_name}</h3>
              <span className={color}>{label}</span>
              <p>Score: {fpo.health_score}/100</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Example 2: Market Prices with Trends

```typescript
'use client';

import { useState } from 'react';
import { useMarketPrices } from '@/lib/hooks/useGovernment';
import { CROPS } from '@/lib/constants';
import { formatCurrency, getMSPBadge } from '@/lib/utils';

export default function MarketPricesPage() {
  const [cropType, setCropType] = useState('');
  const [days, setDays] = useState('30');
  
  const { summary, cropPrices, priceTrends, updateFilters } = 
    useMarketPrices(cropType, undefined, days);

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <select 
          value={cropType} 
          onChange={(e) => {
            setCropType(e.target.value);
            updateFilters({ crop_type: e.target.value });
          }}
        >
          <option value="">All Crops</option>
          {CROPS.map(crop => (
            <option key={crop} value={crop}>{crop}</option>
          ))}
        </select>
        
        <select value={days} onChange={(e) => setDays(e.target.value)}>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div>Avg: {formatCurrency(summary.avg_price)}</div>
        <div>Min: {formatCurrency(summary.min_price)}</div>
        <div>Max: {formatCurrency(summary.max_price)}</div>
        <div>Range: {formatCurrency(summary.price_range)}</div>
      </div>

      {/* Crop Prices */}
      <table className="w-full">
        <thead>
          <tr>
            <th>Crop</th>
            <th>Avg Price</th>
            <th>MSP</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {cropPrices.map(crop => {
            const { label, color } = getMSPBadge(crop.price_vs_msp);
            return (
              <tr key={crop.crop_type}>
                <td>{crop.crop_type}</td>
                <td>{formatCurrency(crop.avg_price)}/Q</td>
                <td>{crop.msp ? formatCurrency(crop.msp) : 'N/A'}</td>
                <td>
                  <span className={color}>{label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

### Example 3: Data Export

```typescript
import { exportToCSV } from '@/lib/utils';

function ExportButton({ data }) {
  const handleExport = () => {
    const exportData = data.map(item => ({
      'FPO Name': item.organization_name,
      'State': item.state,
      'District': item.district,
      'Health Score': item.health_score,
      'Members': item.total_members,
    }));
    
    exportToCSV(exportData, 'fpo-monitoring-report');
  };
  
  return <button onClick={handleExport}>Export CSV</button>;
}
```

## Utility Cheat Sheet

```typescript
// Formatting
formatCurrency(150000)        // ₹1,50,000
formatNumber(250000)          // 2,50,000
formatPercentage(85.5, 1)     // 85.5%
quintalsToMetricTons(100)     // 10.00 MT
formatIndianDate('2024-01-15') // 15/01/2024

// Badges
getHealthStatus(85)           // { label: 'Excellent', color: '...' }
getEfficiencyBadge(92)        // { label: 'Excellent', color: '...' }
getKYCBadge('verified')       // { label: 'Verified', color: '...' }
getMSPBadge(500)              // { label: 'Above MSP', color: '...' }

// Calculations
calculateVerificationRate(850, 1000)  // 85
daysDifference('2024-01-01', new Date()) // days count
getTrendIndicator(1200, 1000) // { direction: 'up', percentage: 20, ... }

// State helpers
getStateName('karnataka', INDIAN_STATES) // 'Karnataka'
getCropDisplayName('soybean')             // 'Soybean'
```

## API Response Handling

```typescript
// Fetch data manually
const fetchData = async () => {
  try {
    const response = await fetch('/api/government/farmer-registry/');
    const result = await response.json();
    
    if (result.success) {
      setFarmers(result.data.farmers);
      setStats(result.data.stats);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Using API client
import { API } from '@/lib/api';

const fetchWithClient = async () => {
  try {
    const response = await API.government.getFarmerRegistry({
      state: 'karnataka',
      kyc_status: 'verified',
    });
    
    setFarmers(response.data.data.farmers);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Common Patterns

### Loading State
```typescript
if (isLoading) return <Loading fullScreen />;
```

### Empty State
```typescript
{data.length === 0 && (
  <div className="text-center py-12">
    <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-500">No data found</p>
  </div>
)}
```

### Error Handling
```typescript
{error && (
  <div className="bg-red-50 text-red-600 p-4 rounded-lg">
    <p>{error.message || 'An error occurred'}</p>
  </div>
)}
```

### Protected Route
```typescript
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

## Next Steps

1. **Add Map Visualization:**
   ```bash
   npm install leaflet react-leaflet
   ```

2. **Add Charts:**
   ```bash
   npm install recharts
   ```

3. **Add Export Functionality:**
   - Already implemented in utils: `exportToCSV()`

4. **Add Real-time Updates:**
   ```typescript
   import { useEffect } from 'react';
   
   useEffect(() => {
     const interval = setInterval(() => refresh(), 30000);
     return () => clearInterval(interval);
   }, [refresh]);
   ```

5. **Add Notifications:**
   ```typescript
   import { toast } from 'react-hot-toast';
   
   toast.success('Data refreshed successfully');
   toast.error('Failed to load data');
   ```

## Troubleshooting Tips

1. **Check API Connection:**
   ```typescript
   console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
   ```

2. **Verify Token:**
   ```typescript
   const token = localStorage.getItem('seedsync_token');
   console.log('Token:', token ? 'Present' : 'Missing');
   ```

3. **Debug Hook Data:**
   ```typescript
   const hookData = useFPOMonitoring();
   console.log('Hook Data:', hookData);
   ```

4. **Check Backend Response:**
   - Open Network tab in browser DevTools
   - Look for API calls to `/api/government/`
   - Check response structure matches types

## Support Resources

- **Backend API Docs:** Check `backend/apps/government/views_extended.py`
- **Frontend Types:** See `frontend/lib/types/index.ts`
- **Component Examples:** Review existing pages in `frontend/app/government/`
- **Utils Reference:** Check `frontend/lib/utils/index.ts`
