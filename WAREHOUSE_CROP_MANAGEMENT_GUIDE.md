# Warehouse Crop Management - Complete Guide

## Overview
This guide explains the complete warehouse management system for storing crops, tracking inventory, and proper calculations.

---

## 🏗️ **Architecture**

### **Two Warehouse Systems**

1. **FPOWarehouse** (`apps/fpos/models.py`)
   - FPO-specific warehouses with detailed infrastructure
   - Located at: `backend/apps/fpos/models.py` (line 248)
   - Fields: `capacity_quintals`, `current_stock_quintals`

2. **Warehouse** (`apps/warehouses/models.py`)
   - General warehouse model
   - Located at: `backend/apps/warehouses/models.py` (line 9)
   - Fields: `capacity_quintals`, `current_stock`

**Note:** Currently, ProcurementLot uses the general `Warehouse` model.

---

## 📦 **How to Add Crops to Warehouse**

### **Method 1: Direct Lot Creation with Warehouse**

When a farmer creates a lot and assigns it to a warehouse:

```python
# In apps/lots/serializers.py - ProcurementLotCreateSerializer

# Step 1: Validate warehouse has capacity
def validate(self, attrs):
    warehouse = attrs.get('warehouse')
    quantity_quintals = attrs.get('quantity_quintals')
    
    if warehouse and quantity_quintals:
        available_capacity = warehouse.get_available_capacity()
        
        if quantity_quintals > available_capacity:
            raise ValidationError({
                'warehouse': f'Insufficient capacity. Available: {available_capacity}Q'
            })
    return attrs

# Step 2: Auto-create inventory and update stock
def create(self, validated_data):
    warehouse = validated_data.get('warehouse')
    lot = ProcurementLot.objects.create(**validated_data)
    
    if warehouse:
        # Create Inventory record
        Inventory.objects.create(
            warehouse=warehouse,
            lot=lot,
            quantity=lot.quantity_quintals
        )
        
        # Create StockMovement (IN)
        StockMovement.objects.create(
            warehouse=warehouse,
            lot=lot,
            movement_type='in',
            quantity=lot.quantity_quintals,
            remarks=f'Initial stock in from farmer'
        )
        
        # Update warehouse stock
        warehouse.current_stock += lot.quantity_quintals
        warehouse.save(update_fields=['current_stock'])
```

**Frontend Flow:**
1. Farmer/FPO goes to **Procurement** page
2. Clicks "Create New Lot"
3. Fills crop details + selects warehouse from dropdown
4. System validates capacity automatically
5. On submit → Lot created + Inventory created + Stock updated

---

### **Method 2: FPO Aggregated Lot Creation**

FPO can aggregate multiple member lots into one bulk lot:

```python
# In apps/fpos/views.py - FPOCreateAggregatedLotAPIView

def post(self, request):
    target_warehouse_id = request.data.get('warehouse_id')
    member_lot_ids = request.data.get('member_lot_ids', [])
    
    with transaction.atomic():
        # 1. Calculate total quantity
        parent_lots = ProcurementLot.objects.filter(id__in=member_lot_ids)
        total_quantity = sum(lot.quantity_quintals for lot in parent_lots)
        
        # 2. Validate target warehouse capacity
        target_warehouse = FPOWarehouse.objects.get(id=target_warehouse_id)
        if total_quantity > target_warehouse.get_available_capacity():
            raise ValidationError("Insufficient warehouse capacity")
        
        # 3. Create aggregated lot
        aggregated_lot = ProcurementLot.objects.create(
            listing_type='fpo_aggregated',
            quantity_quintals=total_quantity,
            warehouse=target_warehouse
        )
        
        # 4. Stock OUT from source warehouses
        for parent_lot in parent_lots:
            if parent_lot.warehouse:
                StockMovement.objects.create(
                    warehouse=parent_lot.warehouse,
                    lot=parent_lot,
                    movement_type='out',
                    quantity=parent_lot.quantity_quintals,
                    remarks='Moved to aggregated lot'
                )
                parent_lot.warehouse.current_stock -= parent_lot.quantity_quintals
                parent_lot.warehouse.save()
        
        # 5. Stock IN to target warehouse
        Inventory.objects.create(
            warehouse=target_warehouse,
            lot=aggregated_lot,
            quantity=total_quantity
        )
        StockMovement.objects.create(
            warehouse=target_warehouse,
            lot=aggregated_lot,
            movement_type='in',
            quantity=total_quantity,
            remarks='Aggregated from member lots'
        )
        target_warehouse.current_stock += total_quantity
        target_warehouse.save()
```

**Frontend Flow:**
1. FPO goes to **Procurement** page
2. Clicks "Create Lot" → Select "Aggregated" mode
3. Selects target warehouse
4. Selects multiple member lots (checkboxes)
5. System shows total quantity calculation
6. On submit → Stock moves from source → Stock added to target

---

## 🧮 **Calculation Logic**

### **Warehouse Capacity Calculations**

```python
# In Warehouse model (warehouses/models.py)

def get_available_capacity(self):
    """Available space in warehouse"""
    return float(self.capacity_quintals - self.current_stock)

def get_capacity_utilization_percentage(self):
    """Percentage of warehouse filled"""
    if self.capacity_quintals > 0:
        return round((float(self.current_stock) / float(self.capacity_quintals)) * 100, 2)
    return 0

def can_accommodate(self, quantity):
    """Check if warehouse can fit given quantity"""
    return self.get_available_capacity() >= float(quantity)
```

### **Example Calculations:**

**Warehouse Stats:**
- Capacity: 10,000 quintals
- Current Stock: 7,500 quintals
- Available: 10,000 - 7,500 = **2,500 quintals**
- Utilization: (7,500 / 10,000) × 100 = **75%**

**Adding a Lot:**
- Lot Quantity: 1,000 quintals
- Check: 1,000 <= 2,500 ✅ (Can accommodate)
- After adding:
  - Current Stock: 7,500 + 1,000 = 8,500 quintals
  - Available: 10,000 - 8,500 = 1,500 quintals
  - Utilization: 85%

**Attempting to add 3,000 quintals:**
- Check: 3,000 <= 2,500 ❌ (Insufficient capacity)
- Error: "Insufficient warehouse capacity. Available: 2,500Q, Required: 3,000Q"

---

## 📊 **Database Schema**

### **Tables Involved:**

```sql
-- 1. Warehouse (storage facility)
warehouses:
  - id
  - name
  - capacity_quintals (TOTAL capacity)
  - current_stock (CURRENT stock)
  - address, city, state

-- 2. ProcurementLot (crop lot)
procurement_lots:
  - id
  - lot_number
  - crop_type
  - quantity_quintals
  - warehouse_id (FK to warehouses)
  - listing_type (individual/fpo_managed/fpo_aggregated)

-- 3. Inventory (which lot is in which warehouse)
inventory:
  - id
  - warehouse_id (FK)
  - lot_id (FK)
  - quantity
  - entry_date

-- 4. StockMovement (audit trail)
stock_movements:
  - id
  - warehouse_id (FK)
  - lot_id (FK)
  - movement_type ('in' or 'out')
  - quantity
  - movement_date
  - remarks
```

### **Relationships:**

```
Warehouse (1) ----< (N) Inventory
Warehouse (1) ----< (N) StockMovement
ProcurementLot (1) ----< (N) Inventory
ProcurementLot (1) ----< (N) StockMovement
ProcurementLot (N) >----< (M) Warehouse (source_warehouses M2M)
```

---

## 🔄 **Stock Movement Flow**

### **Scenario 1: Farmer Creates Individual Lot**

```
[Farmer] → [Create Lot + Assign Warehouse]
    ↓
[System Validates Capacity]
    ↓
[Create ProcurementLot]
    ↓
[Create Inventory Record]
    ↓
[Create StockMovement (type='in')]
    ↓
[Update warehouse.current_stock += quantity]
    ↓
[Lot appears in warehouse inventory]
```

### **Scenario 2: FPO Aggregates Member Lots**

```
Member Lots in WH-A, WH-B, WH-C
    ↓
[FPO creates aggregated lot → Target WH-D]
    ↓
FOR EACH source lot:
  - Create StockMovement (type='out', warehouse=source)
  - source_warehouse.current_stock -= quantity
    ↓
[Create aggregated lot]
    ↓
[Create Inventory (warehouse=WH-D)]
    ↓
[Create StockMovement (type='in', warehouse=WH-D)]
    ↓
[WH-D.current_stock += total_quantity]
```

### **Scenario 3: Processor Buys Lot**

```
[Processor places winning bid]
    ↓
[Bid accepted by FPO/Farmer]
    ↓
[Create StockMovement (type='out')]
    ↓
[warehouse.current_stock -= lot.quantity]
    ↓
[Lot status = 'sold']
    ↓
[Available capacity increases]
```

---

## 🎯 **API Endpoints**

### **1. Create Warehouse**
```
POST /api/fpos/warehouses/
Body:
{
  "warehouse_name": "Main Storage",
  "warehouse_code": "WH001",
  "capacity_quintals": 10000,
  "district": "Mumbai",
  "state": "maharashtra",
  "address": "Village Road",
  "pincode": "400001"
}
```

### **2. Create Lot with Warehouse**
```
POST /api/lots/procurement/
Body:
{
  "farmer": <farmer_id>,
  "crop_type": "groundnut",
  "quantity_quintals": 500,
  "warehouse": <warehouse_id>,  ← Triggers auto-inventory creation
  "expected_price_per_quintal": 5000
}
```

### **3. Create Aggregated Lot**
```
POST /api/fpos/create-aggregated-lot/
Body:
{
  "warehouse_id": <target_warehouse_id>,
  "member_lot_ids": [lot1_id, lot2_id, lot3_id],
  "crop_type": "groundnut",
  "expected_price_per_quintal": 5200
}
```

### **4. View Warehouse Inventory**
```
GET /api/fpos/warehouses/
Response includes:
{
  "warehouses": [
    {
      "id": 1,
      "warehouse_name": "Main Storage",
      "capacity_quintals": 10000,
      "current_stock_quintals": 7500,
      "available_capacity": 2500,
      "utilization_percentage": 75
    }
  ]
}
```

### **5. Get Warehouse Stock Movements**
```
GET /api/warehouses/stock-movements/?warehouse_id=<id>
Response:
[
  {
    "movement_type": "in",
    "quantity": 500,
    "lot": "LOT-001",
    "remarks": "Initial stock in from farmer",
    "movement_date": "2025-12-07T10:30:00Z"
  },
  {
    "movement_type": "out",
    "quantity": 200,
    "lot": "LOT-001",
    "remarks": "Sold to processor",
    "movement_date": "2025-12-08T14:20:00Z"
  }
]
```

---

## 🖥️ **Frontend UI Flow**

### **Warehouse Page** (`/fpo/warehouse`)

**Components:**
1. **Stats Cards** (Top)
   - Total Warehouses
   - Total Capacity
   - Current Stock
   - Low Capacity Alerts

2. **Warehouse List** (Grid)
   - Each card shows:
     - Warehouse name & code
     - Capacity bar (visual)
     - Current: 7,500 / 10,000 quintals (75%)
     - Actions: View Inventory, Edit, Delete

3. **Inventory Modal** (Click "View Inventory")
   - Warehouse stats
   - Crop breakdown by type
   - List of all lots stored
   - Stock movement history

### **Procurement Page** (`/fpo/procurement`)

**Create Lot Modal:**
- Mode toggle: **Direct** | **Aggregated**
- Warehouse dropdown (shows available capacity)
- If Aggregated: Member lot selection with checkboxes
- Real-time total quantity calculation
- Submit validates capacity before creation

---

## ⚠️ **Important Notes**

### **Capacity Validation (Hard Block)**
- **Always** validates before lot creation
- Raises `ValidationError` if insufficient capacity
- Prevents overselling warehouse space
- Formula: `new_quantity <= (capacity - current_stock)`

### **Stock Consistency**
- Uses Django **transactions** for atomic operations
- All stock movements are logged in `StockMovement` table
- Inventory table maintains current state
- Audit trail for compliance

### **Weighing Capacity vs Storage Capacity**
- **Storage Capacity** (`capacity_quintals`): Total space in warehouse
- **Weighing Capacity** (`weighing_capacity_quintals`): Max weight the weighing machine can measure at once
- They are different! A warehouse might hold 10,000Q but weigh only 100Q at a time

### **Multi-Warehouse Tracking**
- Aggregated lots track source warehouses via M2M field
- Enables traceability: "This bulk lot came from WH-A, WH-B, WH-C"
- Important for quality tracking and audits

---

## 🧪 **Testing Checklist**

- [ ] Create warehouse with 1000Q capacity
- [ ] Create lot with 500Q → Verify stock becomes 500Q
- [ ] Create another lot with 600Q → Should fail (insufficient capacity)
- [ ] Create lot with 300Q → Should succeed, stock = 800Q
- [ ] Check Inventory table has 2 records
- [ ] Check StockMovement has 2 'in' movements
- [ ] Create aggregated lot from 2 source warehouses
- [ ] Verify stock OUT from sources, IN to target
- [ ] Verify source_warehouses M2M relationship
- [ ] Delete warehouse → Should fail if stock > 0
- [ ] Sell a lot → Verify stock decreases

---

## 🚀 **Future Enhancements**

1. **Quality Deterioration Tracking**
   - Monitor storage time
   - Alert on quality degradation

2. **Temperature/Humidity Monitoring**
   - For scientific storage warehouses
   - Real-time sensor integration

3. **Cost Tracking**
   - Storage cost per quintal per day
   - Calculate total storage costs

4. **Warehouse Transfer**
   - Move lots between warehouses
   - Creates OUT + IN movements

5. **Reservation System**
   - Reserve capacity for expected procurements
   - Better planning

6. **Stock Alerts**
   - Email when warehouse >90% full
   - Alert when warehouse empty

---

## 📝 **Summary**

**How crops are added to warehouse:**
1. Farmer/FPO creates lot → Assigns warehouse
2. System validates capacity
3. Auto-creates Inventory + StockMovement
4. Updates warehouse.current_stock
5. Lot appears in warehouse inventory

**Calculation logic:**
- Available = Capacity - Current Stock
- Utilization% = (Current Stock / Capacity) × 100
- Validation: New Lot Quantity <= Available Capacity

**Key Features:**
✅ Hard capacity validation (prevents overflow)
✅ Automatic inventory creation
✅ Complete audit trail (StockMovement)
✅ Multi-warehouse aggregation
✅ Real-time stock calculations
✅ Transaction safety (atomic operations)

---

**Need help?** Check the code in:
- `backend/apps/lots/serializers.py` (Lot creation logic)
- `backend/apps/fpos/views.py` (Aggregation logic)
- `backend/apps/warehouses/models.py` (Warehouse model)
- `frontend/app/fpo/warehouse/page.tsx` (Warehouse UI)
- `frontend/app/fpo/procurement/page.tsx` (Lot creation UI)
