# Warehouse Integration & FPO Aggregated Lot Creation - Complete Implementation

## Overview
This implementation adds comprehensive warehouse management to the procurement lot system with support for:
- **Hard capacity blocking** to prevent warehouse overflow
- **Automatic inventory and stock movement tracking**
- **Multi-warehouse aggregation** for FPO bulk lots
- **Complete UI for lot creation, warehouse selection, and inventory viewing**

---

## Backend Changes

### 1. Database Schema Updates

#### **ProcurementLot Model** (`backend/apps/lots/models.py`)
Added three new fields:

```python
# Single warehouse storage (for FPO-managed lots)
warehouse = models.ForeignKey(
    'warehouses.Warehouse',
    on_delete=models.SET_NULL,
    null=True, blank=True,
    related_name='stored_lots'
)

# Multi-warehouse aggregation tracking
source_warehouses = models.ManyToManyField(
    'warehouses.Warehouse',
    blank=True,
    related_name='aggregated_from_lots'
)
```

**Migration**: `0003_procurementlot_source_warehouses_and_more.py` (Applied ✅)

---

### 2. Lot Creation with Warehouse Validation

#### **ProcurementLotCreateSerializer** (`backend/apps/lots/serializers.py`)

**Features Added**:
- ✅ **Hard capacity blocking**: Validates warehouse has sufficient space before creating lot
- ✅ **Auto inventory creation**: Creates `Inventory` record when warehouse assigned
- ✅ **Stock movement tracking**: Records stock IN movement
- ✅ **Warehouse stock update**: Automatically increments `current_stock_quintals`

```python
def validate(self, attrs):
    """Hard block if insufficient capacity"""
    warehouse = attrs.get('warehouse')
    quantity = attrs.get('quantity_quintals')
    
    if warehouse and quantity:
        available_capacity = warehouse.get_available_capacity()
        if quantity > available_capacity:
            raise ValidationError(
                f'Insufficient warehouse capacity. Available: {available_capacity} quintals'
            )
    return attrs

def create(self, validated_data):
    lot = ProcurementLot.objects.create(**validated_data)
    
    if warehouse:
        # Create inventory record
        Inventory.objects.create(
            warehouse=warehouse,
            lot=lot,
            quantity=lot.quantity_quintals
        )
        
        # Create stock movement (IN)
        StockMovement.objects.create(
            warehouse=warehouse,
            lot=lot,
            movement_type='in',
            quantity=lot.quantity_quintals
        )
        
        # Update warehouse stock
        warehouse.current_stock_quintals += lot.quantity_quintals
        warehouse.save()
    
    return lot
```

---

### 3. Enhanced FPO Aggregated Lot Creation

#### **FPOCreateAggregatedLotAPIView** (`backend/apps/fpos/views.py`)

**Features Added**:
- ✅ **Multi-warehouse aggregation**: Tracks source warehouses for traceability
- ✅ **Target warehouse assignment**: Moves aggregated lot to specified warehouse
- ✅ **Stock movement OUT from sources**: Records outbound movements from parent lot warehouses
- ✅ **Stock movement IN to target**: Records inbound movement to aggregated lot warehouse
- ✅ **Capacity validation**: Checks target warehouse capacity before aggregation
- ✅ **Transaction safety**: Uses database transaction for atomicity

**Request Body**:
```json
{
  "parent_lot_ids": ["uuid1", "uuid2", "uuid3"],
  "crop_type": "soybean",
  "quality_grade": "A",
  "expected_price_per_quintal": 4600,
  "warehouse_id": "target-warehouse-uuid",  // NEW: Optional target warehouse
  "description": "Bulk lot for export"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Aggregated bulk lot created successfully with warehouse tracking",
  "data": {
    "id": "...",
    "lot_number": "SB2025042",
    "warehouse_id": "...",
    "warehouse_name": "Main Godown - District A",
    "source_warehouses_count": 2,
    "source_warehouse_names": ["Warehouse 1", "Warehouse 2"]
  }
}
```

**Stock Movement Logic**:
```python
# For each parent lot
for lot in parent_lots:
    if lot.warehouse:
        # Record stock OUT from source warehouse
        StockMovement.objects.create(
            warehouse=lot.warehouse,
            lot=lot,
            movement_type='out',
            quantity=lot.available_quantity_quintals,
            remarks=f'Aggregated into bulk lot {aggregated_lot.lot_number}'
        )
        
        # Decrease source warehouse stock
        lot.warehouse.current_stock_quintals -= lot.available_quantity_quintals
        lot.warehouse.save()

# Record stock IN to target warehouse
if target_warehouse:
    StockMovement.objects.create(
        warehouse=target_warehouse,
        lot=aggregated_lot,
        movement_type='in',
        quantity=total_quantity,
        remarks=f'Aggregated bulk lot from {parent_lots.count()} member lots'
    )
    
    # Increase target warehouse stock
    target_warehouse.current_stock_quintals += total_quantity
    target_warehouse.save()
```

---

### 4. Updated API Responses

#### **ProcurementLotSerializer** (`backend/apps/lots/serializers.py`)
Added warehouse fields to all lot responses:

```python
warehouse_id = serializers.UUIDField(source='warehouse.id', read_only=True)
warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
warehouse_code = serializers.CharField(source='warehouse.warehouse_code', read_only=True)
warehouse_district = serializers.CharField(source='warehouse.district', read_only=True)

# Multi-warehouse tracking for aggregated lots
source_warehouse_ids = serializers.SerializerMethodField()
source_warehouse_names = serializers.SerializerMethodField()
```

#### **FPO Procurement API** (`backend/apps/fpos/views.py`)
Updated to include warehouse data in responses:

```python
lots = ProcurementLot.objects.filter(
    fpo=fpo,
    managed_by_fpo=True
).select_related('farmer', 'farmer__user', 'warehouse')
 .prefetch_related('source_warehouses')

# Response includes:
'warehouse_id': str(lot.warehouse.id) if lot.warehouse else None,
'warehouse_name': lot.warehouse.name if lot.warehouse else None,
'warehouse_code': lot.warehouse.warehouse_code if lot.warehouse else None,
```

---

## Frontend Changes

### 1. TypeScript Type Definitions

#### **ProcurementLot Interface** (`frontend/lib/types/index.ts`)
```typescript
export interface ProcurementLot {
  // Existing fields...
  listing_type?: 'individual' | 'fpo_managed' | 'fpo_aggregated';
  
  // Warehouse fields
  warehouse_id?: string;
  warehouse_name?: string;
  warehouse_code?: string;
  warehouse_district?: string;
  
  // Multi-warehouse aggregation
  source_warehouse_ids?: string[];
  source_warehouse_names?: string[];
}

export interface Warehouse {
  id: string;
  warehouse_name: string;
  warehouse_code: string;
  warehouse_type: 'godown' | 'cold_storage' | 'warehouse' | 'shed';
  capacity_quintals: number;
  current_stock_quintals: number;
  district: string;
  state: string;
  // ...other fields
}
```

---

### 2. Enhanced Create Lot Modal

#### **CreateLotModal Component** (`frontend/app/fpo/procurement/page.tsx`)

**Features**:
- ✅ **Dual mode**: Direct lot creation vs Aggregated bulk lot
- ✅ **Warehouse selection dropdown**: Shows available capacity for each warehouse
- ✅ **Member lot selection**: Multi-select checkboxes for aggregation
- ✅ **Crop filtering**: Auto-filters member lots by selected crop type
- ✅ **Real-time quantity calculation**: Shows total quantity from selected lots
- ✅ **Visual feedback**: Highlights selected lots with primary color border

**UI Structure**:
```tsx
<Modal title="Create Procurement Lot" size="xl">
  {/* Mode Toggle */}
  <div className="flex gap-4">
    <button onClick={() => setLotType('direct')}>
      <Package /> Direct Lot
    </button>
    <button onClick={() => setLotType('aggregated')}>
      <Users /> Aggregated Bulk Lot
    </button>
  </div>

  {/* Crop & Quality */}
  <Select label="Crop Type" options={CROPS} />
  <Select label="Quality Grade" options={grades} />
  
  {/* Warehouse Selection */}
  <Select label="Target Warehouse (Optional)">
    <option>No Warehouse</option>
    {warehouses.map(wh => (
      <option value={wh.id}>
        {wh.warehouse_name} ({wh.district}) - 
        {formatNumber(wh.capacity - wh.current_stock)} Q available
      </option>
    ))}
  </Select>

  {/* Member Lot Selection (Aggregated Mode Only) */}
  {lotType === 'aggregated' && (
    <div className="border rounded-lg p-4">
      <h3>Select Member Lots to Aggregate</h3>
      <Badge>{selectedLotIds.length} selected • {totalQuantity} Q total</Badge>
      
      {filteredMemberLots.map(lot => (
        <label className="flex items-center gap-3 p-3 border rounded-lg">
          <input type="checkbox" onChange={() => handleToggleLot(lot.id)} />
          <div>
            <span>{lot.lot_number}</span>
            <div className="text-sm text-gray-600">
              {lot.farmer_name} • {lot.quantity_quintals} Q
              {lot.warehouse_name && <> • {lot.warehouse_name}</>}
            </div>
          </div>
          <Badge>{lot.quality_grade}</Badge>
        </label>
      ))}
    </div>
  )}
  
  <Button type="submit">
    {lotType === 'aggregated' ? 'Create Aggregated Lot' : 'Create Lot'}
  </Button>
</Modal>
```

**API Integration**:
```typescript
const handleSubmit = async () => {
  if (lotType === 'aggregated') {
    await API.fpo.createAggregatedLot({
      parent_lot_ids: selectedLotIds,
      crop_type: formData.crop_type,
      quality_grade: formData.quality_grade,
      expected_price_per_quintal: parseFloat(formData.price),
      warehouse_id: formData.warehouse_id || undefined,
      description: formData.description
    });
  }
};
```

---

### 3. Lot Card Warehouse Display

#### **FPO Procurement Page** (`frontend/app/fpo/procurement/page.tsx`)
```tsx
<Card>
  <CardContent>
    {/* Existing fields */}
    <div className="flex items-center justify-between">
      <span>Quantity:</span>
      <span>{formatNumber(lot.quantity_quintals)} Q</span>
    </div>
    
    {/* NEW: Warehouse Display */}
    {lot.warehouse_name && (
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Warehouse className="w-3 h-3" />
          Warehouse:
        </span>
        <span className="font-semibold text-purple-600">
          {lot.warehouse_name}
        </span>
      </div>
    )}
  </CardContent>
</Card>
```

#### **Marketplace Page** (`frontend/app/marketplace/page.tsx`)
Added warehouse display to both aggregated and individual lot cards with purple badge styling.

---

### 4. Warehouse Inventory View

#### **Warehouse Page** (`frontend/app/fpo/warehouse/page.tsx`)

**Features Added**:
- ✅ **View Inventory button**: Opens modal showing warehouse contents
- ✅ **Crop breakdown**: Groups lots by crop type with quantity percentages
- ✅ **Stored lots list**: Shows all lots in the warehouse with details
- ✅ **Real-time stats**: Current stock, capacity, available space

**Inventory Modal Structure**:
```tsx
<Modal title="Inventory - {warehouse.warehouse_name}">
  {/* Warehouse Stats */}
  <div className="grid grid-cols-3 gap-4">
    <div>Current Stock: {warehouse.current_stock} Q</div>
    <div>Capacity: {warehouse.capacity} Q</div>
    <div>Available: {warehouse.capacity - warehouse.current_stock} Q</div>
  </div>

  {/* Crop Breakdown */}
  <h3>Crop Breakdown</h3>
  {Object.entries(cropBreakdown).map(([crop, data]) => (
    <div className="flex justify-between">
      <div>
        <Wheat /> {crop}
        <p>{data.count} lots</p>
      </div>
      <div>
        {formatNumber(data.quantity)} Q
        <p>{(data.quantity / totalStock * 100).toFixed(1)}% of stock</p>
      </div>
    </div>
  ))}

  {/* Stored Lots */}
  <h3>Stored Lots</h3>
  {warehouseLots.map(lot => (
    <div className="flex justify-between p-3 border rounded">
      <div>
        {lot.lot_number}
        <p>{lot.farmer_name}</p>
        <Badge>{lot.quality_grade}</Badge>
        <Badge>{lot.status}</Badge>
      </div>
      <div>
        {formatNumber(lot.quantity_quintals)} Q
        <p>{formatCurrency(lot.expected_price_per_quintal)}/Q</p>
      </div>
    </div>
  ))}
</Modal>
```

---

## Key Features Summary

### ✅ Hard Capacity Blocking
- Backend validates warehouse capacity before lot creation
- Prevents warehouse overflow with clear error messages
- Checks both direct lot creation and aggregated lot storage

### ✅ Automatic Inventory Management
- `Inventory` records created automatically when lot assigned to warehouse
- Tracks entry date and quantity
- Links lot to warehouse for complete traceability

### ✅ Stock Movement Tracking
- Every warehouse operation creates `StockMovement` record
- Tracks IN (receiving lots) and OUT (aggregating/selling lots)
- Records date, quantity, and remarks for audit trail
- Maintains accurate `current_stock_quintals` on warehouse

### ✅ Multi-Warehouse Aggregation
- Aggregated lots can pull from multiple source warehouses
- `source_warehouses` M2M tracks all contributing warehouses
- Stock movements recorded for each source warehouse
- Target warehouse receives combined quantity

### ✅ Complete UI Flow
1. **Create Individual Lot**: Select warehouse → Validates capacity → Creates inventory
2. **Create Aggregated Lot**: Select crop → Pick member lots → Choose target warehouse → Validates → Moves stock
3. **View Inventory**: Click "View Inventory" → See crop breakdown → View stored lots

---

## Database Relations

```
ProcurementLot
├── warehouse (FK) ──────────→ Warehouse (single storage location)
├── source_warehouses (M2M) ─→ Warehouse (multi-warehouse aggregation tracking)
├── parent_lots (M2M) ────────→ ProcurementLot (aggregation traceability)
└── aggregated_lots (reverse)

Warehouse
├── stored_lots (reverse FK) ─→ ProcurementLot
├── aggregated_from_lots ─────→ ProcurementLot (source warehouse tracking)
├── inventory ────────────────→ Inventory
└── movements ────────────────→ StockMovement

Inventory
├── warehouse (FK) ───→ Warehouse
├── lot (FK) ─────────→ ProcurementLot
└── quantity, entry_date

StockMovement
├── warehouse (FK) ───→ Warehouse
├── lot (FK) ─────────→ ProcurementLot
├── movement_type ────→ 'in' | 'out'
├── quantity
├── movement_date
└── remarks
```

---

## API Endpoints

### Create Aggregated Lot
```http
POST /api/fpos/create-aggregated-lot/
Content-Type: application/json

{
  "parent_lot_ids": ["uuid1", "uuid2"],
  "crop_type": "soybean",
  "quality_grade": "A",
  "expected_price_per_quintal": 4600,
  "warehouse_id": "warehouse-uuid",  // Optional
  "description": "Export quality bulk lot"
}
```

**Success Response** (201):
```json
{
  "status": "success",
  "message": "Aggregated bulk lot created successfully with warehouse tracking",
  "data": {
    "id": "...",
    "lot_number": "SB2025042",
    "crop_type": "soybean",
    "quantity_quintals": 150.0,
    "quality_grade": "A",
    "parent_lots_count": 2,
    "warehouse_id": "...",
    "warehouse_name": "Main Godown",
    "source_warehouses_count": 2,
    "source_warehouse_names": ["Warehouse A", "Warehouse B"]
  }
}
```

**Error Response** (400):
```json
{
  "status": "error",
  "message": "Insufficient warehouse capacity. Available: 100 quintals, Required: 150 quintals"
}
```

### Get FPO Procurement Lots
```http
GET /api/fpos/procurement/
```

**Response** includes warehouse data:
```json
{
  "status": "success",
  "data": {
    "results": [
      {
        "id": "...",
        "lot_number": "SB2025001",
        "crop_type": "soybean",
        "quantity_quintals": 50,
        "warehouse_id": "...",
        "warehouse_name": "Main Godown",
        "warehouse_code": "WH001",
        "warehouse_district": "District A"
      }
    ]
  }
}
```

---

## Testing Checklist

### Backend
- [x] Lot creation with warehouse validates capacity
- [x] Lot creation without warehouse works normally
- [x] Inventory record created automatically
- [x] Stock movement IN recorded
- [x] Warehouse current_stock updated
- [x] Aggregated lot validates target warehouse capacity
- [x] Stock movements OUT from parent lot warehouses
- [x] Stock movement IN to target warehouse
- [x] Source warehouses linked correctly
- [x] Transaction rollback on error

### Frontend
- [x] Create Lot Modal shows warehouse dropdown
- [x] Warehouse dropdown shows available capacity
- [x] Aggregated mode shows member lot selection
- [x] Crop filter updates member lot list
- [x] Total quantity calculates correctly
- [x] Warehouse displayed on lot cards
- [x] Marketplace shows warehouse info
- [x] Warehouse inventory modal opens
- [x] Crop breakdown calculates correctly
- [x] Stored lots list displays properly

---

## Future Enhancements

1. **Warehouse Assignment UI**: Add ability to move lots between warehouses
2. **Stock Transfer**: Implement warehouse-to-warehouse transfers
3. **Capacity Alerts**: Email notifications when warehouse >90% full
4. **Quality Deterioration Tracking**: Monitor storage time and quality degradation
5. **Cost Tracking**: Calculate storage costs per lot
6. **Batch Operations**: Bulk warehouse assignment for multiple lots

---

## Migration Guide

### Running the Migration
```bash
cd backend
python manage.py migrate lots
```

### Existing Data
- Existing lots will have `warehouse=NULL` (no impact on functionality)
- Start assigning warehouses to new lots going forward
- Optionally run data migration script to assign warehouses to historical lots

---

## Conclusion

This implementation provides a complete warehouse management system integrated with the procurement lot lifecycle. All operations maintain data consistency through:
- Hard capacity validation
- Automatic inventory tracking
- Complete stock movement audit trail
- Multi-warehouse aggregation support
- Rich UI for warehouse selection and inventory viewing

The system is production-ready and maintains backward compatibility with existing lots.
