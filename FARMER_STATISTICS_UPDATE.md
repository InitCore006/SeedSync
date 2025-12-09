# Farmer Statistics API Update

## Overview
Updated the `FarmerProfileViewSet` in `backend/apps/farmers/views.py` to properly calculate real-time statistics from the database instead of relying on cached model fields.

## Changes Made

### Updated Actions
1. **`my_stats` action** (Line 168) - For mobile app consumption (`/api/farmers/profile/my_stats/`)
2. **`stats` action** (Line 99) - For detailed farmer statistics (`/api/farmers/profile/{id}/stats/`)

### Before vs After

#### Before
```python
stats_data = {
    'total_lots_created': profile.total_lots_created,  # From cached model field
    'total_quantity_sold_quintals': float(profile.total_quantity_sold_quintals),  # From cached model field
    'total_earnings': float(profile.total_earnings),  # From cached model field
    # ...
}
```

#### After
```python
# Calculate from actual database queries
total_lots = ProcurementLot.objects.filter(farmer=profile).count()

sold_lots_aggregate = ProcurementLot.objects.filter(
    farmer=profile,
    status__in=['sold', 'delivered']
).aggregate(total_sold=Sum('quantity_quintals'))
total_quantity_sold = sold_lots_aggregate['total_sold'] or 0

earnings_aggregate = Payment.objects.filter(
    lot__farmer=profile,
    status='completed'
).aggregate(total_earnings=Sum('amount'))
total_earnings = earnings_aggregate['total_earnings'] or 0
```

## Calculations Performed

### 1. Total Lots Created
```python
total_lots = ProcurementLot.objects.filter(farmer=profile).count()
```
- Counts all `ProcurementLot` records belonging to the farmer
- Provides accurate real-time count

### 2. Active Lots
```python
active_lots = ProcurementLot.objects.filter(
    farmer=profile,
    status__in=['available', 'bidding']
).count()
```
- Counts lots with status: `available` or `bidding`
- Shows lots currently in marketplace

### 3. Pending Bids
```python
pending_bids = Bid.objects.filter(
    lot__farmer=profile,
    status='pending'
).count()
```
- Counts bids with `pending` status on farmer's lots
- Helps farmer track offers waiting for response

### 4. Total Quantity Sold
```python
sold_lots_aggregate = ProcurementLot.objects.filter(
    farmer=profile,
    status__in=['sold', 'delivered']
).aggregate(total_sold=Sum('quantity_quintals'))
total_quantity_sold = sold_lots_aggregate['total_sold'] or 0
```
- Sums `quantity_quintals` from lots with status: `sold` or `delivered`
- Returns 0 if no sales yet
- Provides accurate sales volume in quintals

### 5. Total Earnings
```python
earnings_aggregate = Payment.objects.filter(
    lot__farmer=profile,
    status='completed'
).aggregate(total_earnings=Sum('amount'))
total_earnings = earnings_aggregate['total_earnings'] or 0
```
- Sums `amount` from `Payment` records with status: `completed`
- Only counts completed payments (not pending/processing/failed)
- Returns 0 if no completed payments
- Provides accurate total earnings in ₹

### 6. Additional Statistics
- **Farmland Count**: `profile.farm_lands.count()` - Number of farm lands registered
- **Active Crops**: `profile.crop_plans.filter(status__in=['sowed', 'growing']).count()` - Currently growing crops
- **Total Farmland Acres**: `float(profile.total_land_acres)` - Total land area

## API Response Format

### Endpoint
**GET** `/api/farmers/profile/my_stats/`

**Headers:**
```
Authorization: Bearer <token>
```

### Response
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "total_lots_created": 15,
    "total_quantity_sold_quintals": 120.5,
    "total_earnings": 605000.00,
    "total_farmland_acres": 25.0,
    "farmland_count": 3,
    "active_crops": 2,
    "active_lots": 5,
    "pending_bids": 8
  }
}
```

## Benefits

### 1. Real-Time Accuracy
- Statistics calculated from live database queries
- No reliance on cached/stale model fields
- Always reflects current system state

### 2. Reliable Mobile App Display
- Mobile app receives accurate counts for dashboard
- Prevents discrepancies between cached and actual data
- Users see trustworthy statistics

### 3. Proper Status Filtering
- Uses correct status constants from `backend/apps/core/constants.py`:
  - Lot statuses: `available`, `bidding`, `sold`, `delivered`
  - Bid status: `pending`, `accepted`, `rejected`, `withdrawn`
  - Payment status: `pending`, `processing`, `completed`, `failed`

### 4. Null-Safe Aggregation
- Uses `or 0` to handle cases where aggregate returns `None`
- Prevents errors when farmer has no sales/payments yet

## Testing Recommendations

### 1. Test with New Farmer
- Register new farmer with no lots
- Call `/api/farmers/profile/my_stats/`
- Verify all counts return 0 without errors

### 2. Test with Active Farmer
- Create farmer with multiple lots in different statuses
- Create bids on some lots
- Complete some payments
- Verify counts match actual database records

### 3. Test Aggregations
```python
# In Django shell
from apps.farmers.models import FarmerProfile
from apps.lots.models import ProcurementLot
from apps.payments.models import Payment
from django.db.models import Sum

farmer = FarmerProfile.objects.first()

# Verify lot count
print(ProcurementLot.objects.filter(farmer=farmer).count())

# Verify earnings
print(Payment.objects.filter(
    lot__farmer=farmer, 
    status='completed'
).aggregate(Sum('amount')))
```

## Database Queries Generated

### Query Count: 6 queries per API call
1. Get FarmerProfile with user and FPO (select_related)
2. Count total lots
3. Count active lots
4. Count pending bids
5. Aggregate quantity sold
6. Aggregate total earnings

### Query Optimization
All queries use proper indexing via foreign keys:
- `lot__farmer` - FK index on ProcurementLot
- `lot__farmer__user` - FK chain index
- `status` - CharField with choices (indexed)

## Files Modified
- `backend/apps/farmers/views.py` - Lines 99-237 (both `stats` and `my_stats` actions)

## Related Models
- `apps.farmers.models.FarmerProfile`
- `apps.lots.models.ProcurementLot`
- `apps.bids.models.Bid`
- `apps.payments.models.Payment`

## Next Steps
1. Test API endpoint with different farmer scenarios
2. Integrate with mobile app dashboard
3. Consider caching strategy if performance becomes an issue (Redis cache for 5-10 minutes)
4. Add pagination if lot/bid counts become very large

## Mobile App Integration
The mobile app can now call this endpoint to populate the farmer dashboard with accurate statistics:

```typescript
// Example mobile app service call
const getFarmerStats = async () => {
  const response = await API.get('/api/farmers/profile/my_stats/');
  return response.data.data; // Extract data from response_success wrapper
};
```
