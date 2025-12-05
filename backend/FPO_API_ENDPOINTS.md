# FPO API Endpoints

All FPO (Farmer Producer Organization) related API endpoints for the SeedSync platform.

## Base URL
```
http://127.0.0.1:8000/api/fpos/
```

## Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

## 1. Profile Management

### GET `/profile/`
Get FPO profile details.

**Response:**
```json
{
  "status": "success",
  "message": "Profile fetched successfully",
  "data": {
    "id": "uuid",
    "organization_name": "Vidarbha Farmers Collective",
    "registration_number": "FPO2023001",
    "registration_type": "fpo",
    "year_of_registration": 2023,
    "total_members": 250,
    "active_members": 250,
    "primary_crops": ["soybean", "mustard"],
    "district": "Nagpur",
    "state": "Maharashtra",
    "is_verified": true
  }
}
```

### PATCH `/profile/`
Update FPO profile.

---

## 2. Dashboard

### GET `/dashboard/`
Get FPO dashboard with key metrics.

**Response:**
```json
{
  "status": "success",
  "message": "Dashboard data fetched successfully",
  "data": {
    "fpo_info": {
      "name": "Vidarbha Farmers Collective",
      "total_members": 250,
      "new_members_this_month": 5,
      "registration_year": 2023,
      "is_verified": true
    },
    "procurement": {
      "total_lots": 45,
      "total_quantity_quintals": 2500.0,
      "active_bids": 8,
      "accepted_bids": 32
    },
    "warehouse": {
      "total_capacity_quintals": 5000.0,
      "current_stock_quintals": 3200.0,
      "utilization_percentage": 64.0,
      "warehouse_count": 2
    },
    "trends": {
      "monthly_procurement": [
        {
          "month": "December 2025",
          "lots": 12,
          "quantity_quintals": 850.0
        }
      ],
      "crop_wise_stats": [
        {
          "crop_type": "soybean",
          "total_quantity": 1500.0,
          "total_lots": 30,
          "avg_price": 4500.0
        }
      ]
    }
  }
}
```

---

## 3. Members Management

### GET `/members/`
Get all FPO members.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 10)

**Response:**
```json
{
  "status": "success",
  "message": "Members fetched successfully",
  "data": {
    "results": [
      {
        "id": "uuid",
        "farmer": {
          "id": "uuid",
          "full_name": "Ramesh Kumar",
          "phone_number": "+919876543200"
        },
        "fpo": "fpo-uuid",
        "joined_date": "2024-06-15",
        "share_capital": 1500.0,
        "is_active": true
      }
    ]
  },
  "meta": {
    "count": 250,
    "page": 1,
    "page_size": 10,
    "next": null,
    "previous": null
  }
}
```

### POST `/members/`
Add a new member to FPO.

**Request Body:**
```json
{
  "farmer_id": "farmer-uuid",
  "share_capital": 1500.0
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Member added successfully",
  "data": {
    "membership_id": "uuid"
  }
}
```

---

## 4. Procurement Opportunities

### GET `/procurement/`
Browse available lots from farmers for procurement.

**Query Parameters:**
- `crop_type` (optional): Filter by crop
- `quality_grade` (optional): Filter by grade
- `max_price` (optional): Max price filter
- `page` (optional): Page number
- `page_size` (optional): Items per page

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
        "description": "High quality soybean",
        "created_at": "2025-12-05T10:00:00Z"
      }
    ]
  },
  "meta": {
    "count": 45,
    "page": 1,
    "page_size": 10
  }
}
```

---

## 5. Warehouses

### GET `/warehouses/`
Get all FPO warehouses.

**Response:**
```json
{
  "status": "success",
  "message": "Warehouses fetched successfully",
  "data": [
    {
      "id": "uuid",
      "warehouse_name": "Main Warehouse",
      "warehouse_code": "WH001",
      "capacity_quintals": 3000.0,
      "current_stock_quintals": 2000.0,
      "district": "Nagpur",
      "state": "Maharashtra",
      "is_operational": true
    }
  ]
}
```

---

## Frontend Integration

### Dashboard (`/fpo/dashboard`)
**API Call:** `GET /api/fpos/dashboard/`

### Members (`/fpo/members`)
**API Calls:**
- `GET /api/fpos/members/` - List members
- `POST /api/fpos/members/` - Add member

### Procurement (`/fpo/procurement`)
**API Call:** `GET /api/fpos/procurement/`

### Warehouse (`/fpo/warehouse`)
**API Call:** `GET /api/fpos/warehouses/`

### Bids (`/fpo/bids`)
**API Call:** `GET /api/bids/my-bids/` (from bids app)

### Marketplace (`/fpo/marketplace`)
**API Call:** `GET /api/lots/` (from lots app)

---

## Test Credentials

```
Phone: +919876000001
Password: fpo123
Role: fpo
```
