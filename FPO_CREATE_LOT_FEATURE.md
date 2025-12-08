# FPO Create Lot on Behalf of Farmer - Feature Documentation

## Overview
This feature allows FPOs (Farmer Producer Organizations) to create procurement lots on behalf of their farmer members. This is useful when farmers may not have direct access to the platform or need assistance in listing their produce.

## Backend Implementation

### API Endpoint
**POST** `/api/fpos/create-farmer-lot/`

### Authentication & Authorization
- Requires JWT authentication
- User must have `IsFPO` permission
- FPO must have an active profile

### Request Parameters

```json
{
  "farmer_phone_number": "9876543210",  // Either phone or farmer_id required
  "farmer_id": "uuid-here",              // Either phone or farmer_id required
  "crop_type": "soybean",                // Required
  "crop_variety": "Pusa Bold",           // Optional
  "crop_master_code": "SOY-001",         // Optional
  "crop_variety_code": "SOY-PB-001",     // Optional
  "quantity_quintals": 100.50,           // Required
  "expected_price_per_quintal": 5000.00, // Required
  "harvest_date": "2025-12-01",          // Required (YYYY-MM-DD)
  "quality_grade": "A",                  // Optional (A/B/C)
  "moisture_content": 8.5,               // Optional (percentage)
  "oil_content": 42.0,                   // Optional (percentage)
  "warehouse_id": "uuid-here",           // Optional
  "description": "High quality crop",    // Optional
  "location_latitude": 28.7041,          // Optional
  "location_longitude": 77.1025          // Optional
}
```

### Response

**Success (201 Created)**
```json
{
  "status": "success",
  "message": "Lot created successfully on behalf of farmer",
  "data": {
    "id": "uuid-here",
    "lot_number": "LOT-2025-0001",
    "farmer": { ... },
    "fpo": { ... },
    "managed_by_fpo": true,
    "listing_type": "fpo_managed",
    "crop_type": "soybean",
    "quantity_quintals": 100.50,
    "available_quantity_quintals": 100.50,
    "expected_price_per_quintal": 5000.00,
    "status": "available",
    ...
  }
}
```

**Error Responses**
- `400 Bad Request` - Missing required fields or invalid data
- `403 Forbidden` - Farmer is not a member of the FPO
- `404 Not Found` - FPO profile, farmer, or warehouse not found

### Features

1. **Member Verification**: Verifies that the farmer is an active member of the FPO before allowing lot creation
2. **Automatic FPO Management**: Lot is automatically marked as `managed_by_fpo=True` and `listing_type='fpo_managed'`
3. **Warehouse Integration**: If warehouse is provided:
   - Creates/updates inventory record
   - Creates stock movement record
   - Updates warehouse stock levels
4. **Traceability**: Maintains link between farmer, lot, and FPO for complete traceability

## Frontend Implementation

### Location
`frontend/app/fpo/members/page.tsx`

### New Components

#### 1. CreateLotModal
A modal dialog that allows FPO to input lot details for a specific farmer member.

**Fields:**
- Crop Type (required, dropdown)
- Crop Variety (optional, text)
- Quantity in Quintals (required, number)
- Expected Price per Quintal (required, number)
- Harvest Date (required, date picker)
- Quality Grade (optional, dropdown - A/B/C)
- Moisture Content % (optional, number)
- Oil Content % (optional, number)
- Description (optional, textarea)

#### 2. Create Lot Button
Added to each member row in the members list with a green Package icon.

### User Flow

1. FPO navigates to **FPO > Members** page
2. Finds the farmer member they want to create a lot for
3. Clicks the **Package** icon (Create Lot button)
4. Modal opens with form to input lot details
5. FPO fills in the lot information
6. Clicks "Create Lot" button
7. System validates data and creates lot
8. Success toast notification appears
9. Page refreshes to show updated data

### API Integration

**Function**: `API.fpo.createFarmerLot()`

Located in: `frontend/lib/api/index.ts`

```typescript
createFarmerLot: (data: {
  farmer_phone_number?: string;
  farmer_id?: string;
  crop_type: string;
  crop_variety?: string;
  quantity_quintals: number;
  expected_price_per_quintal: number;
  harvest_date: string;
  quality_grade?: string;
  moisture_content?: number;
  oil_content?: number;
  warehouse_id?: string;
  description?: string;
}) => api.post<APIResponse>('/fpos/create-farmer-lot/', data)
```

## Database Changes

No schema changes required. Uses existing `ProcurementLot` model with:
- `farmer` field pointing to the farmer who owns the produce
- `fpo` field pointing to the managing FPO
- `managed_by_fpo=True` to indicate FPO management
- `listing_type='fpo_managed'` to categorize the lot

## Benefits

1. **Farmer Support**: Helps farmers who may not be tech-savvy to list their produce
2. **Centralized Management**: FPO can manage all member lots from one interface
3. **Quality Control**: FPO can ensure consistent data quality across all listings
4. **Faster Onboarding**: Speeds up the process of getting farmer produce to market
5. **Traceability**: Maintains clear record of who created the lot and on whose behalf

## Testing

### Manual Testing Steps

1. **Prerequisites**
   - FPO account with active profile
   - At least one farmer member in the FPO
   - Valid authentication token

2. **Test Creating Lot**
   ```bash
   # Login as FPO user
   # Navigate to Members page
   # Click Package icon on a member
   # Fill in all required fields
   # Submit form
   # Verify success message
   # Check that lot appears in procurement list
   ```

3. **Test Validations**
   - Try creating lot for non-member farmer (should fail)
   - Try with missing required fields (should show validation errors)
   - Try with invalid warehouse ID (should fail)

4. **Test Warehouse Integration**
   - Create lot with warehouse assigned
   - Verify inventory is updated
   - Verify stock movement record is created
   - Verify warehouse stock level increases

## Security Considerations

1. **Authorization**: Only FPOs can create lots on behalf of farmers
2. **Member Verification**: System verifies farmer is an active member before allowing creation
3. **Ownership**: Lot ownership remains with the farmer, FPO only manages it
4. **Data Validation**: All inputs are validated on both frontend and backend

## Future Enhancements

1. Add bulk lot creation from CSV file
2. Add image upload capability during lot creation
3. Add option to create lots with quality test reports
4. Add notification to farmer when lot is created on their behalf
5. Add audit log for FPO actions on member lots
