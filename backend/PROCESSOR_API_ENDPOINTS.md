# Processor API Endpoints

All processor-related API endpoints for the SeedSync platform.

## Base URL
```
http://127.0.0.1:8000/api/processors/
```

## Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

## 1. Profile Management

### GET `/profile/`
Get processor profile details.

**Response:**
```json
{
  "status": "success",
  "message": "Profile fetched successfully",
  "data": {
    "id": "uuid",
    "company_name": "Maharashtra Oil Mills Ltd",
    "contact_person": "Manager Name",
    "phone": "+919876000100",
    "email": "processor@example.com",
    "address": "Industrial Area, Zone 1",
    "city": "Nagpur",
    "state": "Maharashtra",
    "processing_capacity_quintals_per_day": 250.00,
    "is_verified": true
  }
}
```

### PATCH `/profile/`
Update processor profile.

**Request Body:**
```json
{
  "contact_person": "New Manager",
  "phone": "+919876000101"
}
```

---

## 2. Dashboard

### GET `/dashboard/`
Get dashboard metrics and analytics.

**Response:**
```json
{
  "status": "success",
  "message": "Dashboard data fetched successfully",
  "data": {
    "active_bids": 5,
    "accepted_bids": 3,
    "active_batches": 8,
    "completed_batches": 45,
    "raw_material_stock_mt": 150.5,
    "finished_product_stock_mt": 85.2,
    "avg_processing_days": 3,
    "processor_info": {
      "company_name": "Maharashtra Oil Mills Ltd",
      "processing_capacity": 250.00,
      "is_verified": true
    },
    "recent_batches": [
      {
        "id": "uuid",
        "batch_number": "BATCH001",
        "crop_name": "Soybean",
        "product_name": "Soybean Oil",
        "input_quantity_kg": 10000,
        "output_quantity_kg": 1800,
        "status": "completed",
        "processing_date": "2025-12-05"
      }
    ]
  }
}
```

---

## 3. Procurement

### GET `/procurement/`
Browse available lots for procurement.

**Query Parameters:**
- `crop_type` (optional): Filter by crop type (e.g., `soybean`, `mustard`)
- `quality_grade` (optional): Filter by grade (`A+`, `A`, `B`, `C`)
- `max_price` (optional): Maximum price per quintal
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 10)

**Response:**
```json
{
  "status": "success",
  "message": "Procurement opportunities fetched successfully",
  "data": {
    "results": [
      {
        "id": "uuid",
        "lot_number": "LOT2024001",
        "farmer": {
          "id": "uuid",
          "full_name": "Ramesh Kumar",
          "phone_number": "+919876543200"
        },
        "crop_type": "soybean",
        "quantity_quintals": 50.0,
        "quality_grade": "A+",
        "expected_price_per_quintal": 4500.0,
        "harvest_date": "2025-12-01",
        "status": "available",
        "description": "High quality soybean from Village 1",
        "qr_code_url": null,
        "blockchain_tx_id": null,
        "created_at": "2025-12-05T10:30:00Z"
      }
    ]
  },
  "meta": {
    "count": 20,
    "page": 1,
    "page_size": 10,
    "next": null,
    "previous": null
  }
}
```

---

## 4. Processing Batches

### GET `/batches/`
Get all processing batches.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 10)

**Response:**
```json
{
  "status": "success",
  "message": "Batches fetched successfully",
  "data": {
    "results": [
      {
        "id": "uuid",
        "batch_number": "BATCH001",
        "lot": {
          "id": "uuid",
          "lot_number": "LOT2024001",
          "crop_type": "soybean"
        },
        "plant": {
          "id": "uuid",
          "name": "Maharashtra Oil Mills Ltd - Main Plant"
        },
        "processed_quantity": 10000.0,
        "oil_extracted": 1800.0,
        "cake_produced": 8000.0,
        "processing_date": "2025-12-05",
        "created_at": "2025-12-05T10:00:00Z"
      }
    ]
  },
  "meta": {
    "count": 45,
    "page": 1,
    "page_size": 10,
    "next": null,
    "previous": null
  }
}
```

### POST `/batches/`
Create a new processing batch.

**Request Body:**
```json
{
  "lot": "lot-uuid",
  "plant": "plant-uuid",
  "batch_number": "BATCH002",
  "processed_quantity": 15000.0,
  "oil_extracted": 2700.0,
  "cake_produced": 12000.0,
  "processing_date": "2025-12-05"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Batch created successfully",
  "data": {
    "id": "uuid",
    "batch_number": "BATCH002",
    "processed_quantity": 15000.0,
    "oil_extracted": 2700.0,
    "cake_produced": 12000.0
  }
}
```

---

## 5. Inventory

### GET `/inventory/`
Get inventory data (raw materials and finished products).

**Response:**
```json
{
  "status": "success",
  "message": "Inventory fetched successfully",
  "data": {
    "raw_materials": [
      {
        "id": 1,
        "name": "Soybean Seeds",
        "quantity": 15000,
        "unit": "kg",
        "category": "raw",
        "location": "Warehouse 1",
        "min_stock": 5000,
        "status": "optimal",
        "last_updated": "2025-12-05T10:00:00Z"
      },
      {
        "id": 2,
        "name": "Mustard Seeds",
        "quantity": 8000,
        "unit": "kg",
        "category": "raw",
        "location": "Warehouse 1",
        "min_stock": 3000,
        "status": "optimal",
        "last_updated": "2025-12-04T10:00:00Z"
      }
    ],
    "finished_products": [
      {
        "id": 3,
        "name": "Soybean Oil",
        "quantity": 5000,
        "unit": "liters",
        "category": "finished",
        "location": "Storage A",
        "min_stock": 2000,
        "status": "optimal",
        "last_updated": "2025-12-05T10:00:00Z"
      },
      {
        "id": 4,
        "name": "Mustard Oil",
        "quantity": 3500,
        "unit": "liters",
        "category": "finished",
        "location": "Storage B",
        "min_stock": 2000,
        "status": "optimal",
        "last_updated": "2025-12-04T10:00:00Z"
      }
    ]
  }
}
```

---

## Frontend Integration

### Dashboard (`/processor/dashboard`)
**API Call:** `GET /api/processors/dashboard/`
- Shows: Active bids, processing batches, stock levels, recent batches

### Procurement (`/processor/procurement`)
**API Call:** `GET /api/processors/procurement/`
- Shows: Available lots from farmers/FPOs
- Filters: Crop type, quality grade, max price

### Processing Batches (`/processor/batches`)
**API Calls:**
- `GET /api/processors/batches/` - List all batches
- `POST /api/processors/batches/` - Create new batch

### Inventory (`/processor/inventory`)
**API Call:** `GET /api/processors/inventory/`
- Shows: Raw materials and finished products stock levels

---

## Test Credentials

```
Phone: +919876000100
Password: processor123
Role: processor
```

## Notes

1. All endpoints return data in the format expected by the frontend TypeScript interfaces
2. Pagination is implemented with `page` and `page_size` parameters
3. Inventory endpoint currently returns mock data - implement proper inventory models for production
4. Processing batches are linked to procurement lots for traceability
