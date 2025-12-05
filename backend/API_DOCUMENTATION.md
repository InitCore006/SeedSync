# SeedSync Backend API Documentation

## 🌾 Complete Django REST API Server

**Version**: 1.0.0 (Hackathon MVP)  
**Base URL**: `http://localhost:8000/api/`  
**Database**: SQLite3  
**Authentication**: JWT (JSON Web Tokens)

---

## 📋 Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Farmers APIs](#farmers-apis)
3. [FPO APIs](#fpo-apis)
4. [Lots/Procurement APIs](#lots-apis)
5. [Bids APIs](#bids-apis)
6. [Blockchain APIs](#blockchain-apis)
7. [Crops & Prices APIs](#crops-apis)
8. [Government Dashboard APIs](#government-apis)
9. [Advisories APIs](#advisories-apis)
10. [Notifications APIs](#notifications-apis)
11. [Payments APIs](#payments-apis)

---

## 🔐 Authentication APIs

### Register User
```
POST /api/users/register/
```
**Body:**
```json
{
  "phone_number": "+919876543210",
  "role": "farmer",
  "password": "SecurePass123"
}
```

### Send OTP
```
POST /api/users/send-otp/
```

### Verify OTP
```
POST /api/users/verify-otp/
```

### Login
```
POST /api/users/login/
```
**Body:**
```json
{
  "phone_number": "+919876543210",
  "password": "SecurePass123"
}
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "access": "eyJ0eXAiOiJKV1...",
    "refresh": "eyJ0eXAiOiJKV1...",
    "user": {...}
  }
}
```

### Get Profile
```
GET /api/users/profile/
Headers: Authorization: Bearer {access_token}
```

---

## 👨‍🌾 Farmers APIs

### Create Farmer Profile
```
POST /api/farmers/profiles/
```
**Body:**
```json
{
  "full_name": "Ramesh Kumar",
  "district": "Nagpur",
  "state": "Maharashtra",
  "total_land_acres": 5.5,
  "primary_crops": ["soybean", "mustard"],
  "bank_account_number": "1234567890",
  "ifsc_code": "SBIN0001234"
}
```

### Get My Farmer Profile
```
GET /api/farmers/profiles/my_profile/
```

### Add Farm Land
```
POST /api/farmers/farmlands/
```
**Body:**
```json
{
  "land_name": "North Field",
  "land_area_acres": 2.5,
  "soil_type": "black",
  "latitude": 21.1458,
  "longitude": 79.0882,
  "irrigation_available": true
}
```

### Get Market Prices
```
GET /api/farmers/market-prices/?crop_type=soybean&state=Maharashtra&days=7
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "prices": [
      {
        "crop_type": "soybean",
        "market_name": "Nagpur APMC",
        "modal_price": 4400,
        "date": "2025-12-05"
      }
    ],
    "msp": {"soybean": {"msp": 4600, "year": 2024}}
  }
}
```

### Get Weather Advisory
```
GET /api/farmers/weather-advisory/?latitude=21.1458&longitude=79.0882
```

### Detect Crop Disease (AI)
```
POST /api/farmers/disease-detection/
Content-Type: multipart/form-data
```
**Body:**
- `image`: (file) Image of diseased leaf
- `crop_type`: "soybean"

**Response:**
```json
{
  "status": "success",
  "data": {
    "disease_detected": "Soybean Rust",
    "confidence": 0.87,
    "treatment": {
      "chemical_control": "Apply fungicide...",
      "organic_option": "Neem oil spray..."
    }
  }
}
```

### Predict Crop Yield (AI)
```
POST /api/farmers/yield-prediction/
```
**Body:**
```json
{
  "crop_type": "soybean",
  "land_area_acres": 5.0,
  "soil_type": "black",
  "irrigation_available": true
}
```

### Find Nearby FPOs
```
GET /api/farmers/profiles/nearby_fpos/?latitude=21.1458&longitude=79.0882&max_distance=50
```

---

## 🏢 FPO APIs

### Create FPO Profile
```
POST /api/fpos/profiles/
```

### Get FPO Dashboard
```
GET /api/fpos/dashboard/
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "fpo_info": {
      "name": "Vidarbha Farmers Collective",
      "total_members": 250,
      "new_members_this_month": 15
    },
    "procurement": {
      "total_lots": 125,
      "total_quantity_quintals": 5000,
      "active_bids": 8
    },
    "warehouse": {
      "total_capacity_quintals": 10000,
      "current_stock_quintals": 3500,
      "utilization_percentage": 35.0
    }
  }
}
```

### Get FPO Members
```
GET /api/fpos/members/
```

### Add New Member
```
POST /api/fpos/members/
```
**Body:**
```json
{
  "farmer_id": "uuid-here",
  "share_capital": 1000
}
```

### Browse Lots for Procurement
```
GET /api/fpos/procurement/?crop_type=soybean&max_price=4500
```

---

## 📦 Lots/Procurement APIs

### Create Lot (Farmer)
```
POST /api/lots/
```
**Body:**
```json
{
  "crop_type": "soybean",
  "quantity_quintals": 50,
  "quality_grade": "A",
  "expected_price_per_quintal": 4500,
  "harvest_date": "2025-11-15",
  "description": "Good quality soybean"
}
```

### Get All Available Lots (Marketplace)
```
GET /api/lots/?status=available&crop_type=soybean&quality_grade=A
```

### Get My Lots (Farmer)
```
GET /api/lots/my_lots/
```

### Get Lot Details
```
GET /api/lots/{lot_id}/
```

### Upload Lot Images
```
POST /api/lots/{lot_id}/upload_images/
Content-Type: multipart/form-data
```

### Update Lot Status
```
POST /api/lots/{lot_id}/update_status/
```

---

## 💰 Bids APIs

### Create Bid (FPO/Processor)
```
POST /api/bids/
```
**Body:**
```json
{
  "lot": "lot-uuid",
  "offered_price_per_quintal": 4600,
  "quantity_quintals": 50,
  "expected_pickup_date": "2025-12-10",
  "payment_terms": "7_days",
  "message": "We offer best price in region"
}
```

### Get Bids for My Lot (Farmer)
```
GET /api/bids/?lot={lot_id}
```

### Accept Bid (Farmer)
```
POST /api/bids/{bid_id}/accept_bid/
```

### Reject Bid (Farmer)
```
POST /api/bids/{bid_id}/reject_bid/
```
**Body:**
```json
{
  "reason": "Price too low"
}
```

### Get My Bids (FPO/Processor)
```
GET /api/bids/?bidder_user={user_id}
```

---

## 🔗 Blockchain APIs

### Generate QR Code for Lot
```
POST /api/blockchain/generate-qr/
```
**Body:**
```json
{
  "lot_id": "lot-uuid"
}
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "qr_url": "http://localhost:8000/media/qr_codes/qr_SB2025001.png",
    "trace_url": "https://seedsync.com/trace/SB2025001"
  }
}
```

### Trace Lot Journey (Public)
```
GET /api/blockchain/trace/{lot_number}/
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "lot_info": {
      "lot_number": "SB2025001",
      "crop_type": "soybean",
      "quantity_quintals": 50
    },
    "farmer_info": {
      "name": "Ramesh Kumar",
      "village": "Katol",
      "district": "Nagpur"
    },
    "journey": [
      {
        "stage": "Lot Created",
        "actor": "Ramesh Kumar",
        "timestamp": "2025-11-15T10:30:00Z",
        "transaction_id": "abc123..."
      },
      {
        "stage": "Procured by FPO",
        "actor": "Vidarbha FPO",
        "timestamp": "2025-11-18T14:00:00Z"
      }
    ],
    "blockchain_verified": true
  }
}
```

### Add Blockchain Transaction
```
POST /api/blockchain/add-transaction/
```
**Body:**
```json
{
  "lot_id": "lot-uuid",
  "action_type": "procured",
  "transaction_data": {
    "price": 4600,
    "quality_check": "passed"
  }
}
```

### Verify Blockchain Integrity
```
GET /api/blockchain/verify/{lot_number}/
```

### Download Certificate
```
GET /api/blockchain/certificate/{lot_number}/
```

---

## 🌾 Crops & Prices APIs

### Get All Oilseed Crops
```
GET /api/crops/master/
```

### Get Crop Varieties
```
GET /api/crops/varieties/{crop_code}/
```

### Get Mandi Prices
```
GET /api/crops/mandi-prices/?crop_type=soybean&state=Maharashtra&days=30
```

### Get MSP Records
```
GET /api/crops/msp-records/?year=2024&season=kharif
```

### Get Price Trend
```
GET /api/crops/price-trend/?crop_type=soybean&months=6
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "crop_type": "soybean",
    "trend": [
      {"month": "June 2024", "average_price": 4200},
      {"month": "July 2024", "average_price": 4350}
    ],
    "msp": 4600
  }
}
```

### Fetch eNAM Prices (Admin)
```
POST /api/crops/fetch-enam/
```

---

## 🏛️ Government Dashboard APIs

### National Dashboard
```
GET /api/government/dashboard/
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "overview": {
      "total_farmers": 5000,
      "total_fpos": 50,
      "fpo_coverage_percentage": 65.5
    },
    "production": {
      "total_procurement_quintals": 250000,
      "total_procurement_mt": 25000
    },
    "policy_metrics": {
      "import_dependency_percentage": 25.0,
      "post_harvest_loss_percentage": 8.5
    },
    "crop_wise_production": [...],
    "state_wise_distribution": [...],
    "monthly_trends": [...]
  }
}
```

### State Heatmap Data
```
GET /api/government/heatmap/?crop_type=soybean
```
**Returns GeoJSON format for map visualization**

### FPO Monitoring
```
GET /api/government/fpo-monitoring/?state=Maharashtra
```
**Response includes FPO health scores**

### Approval Queue
```
GET /api/government/approval-queue/
```

### Approve Registration
```
POST /api/government/approve/{user_id}/
```
**Body:**
```json
{
  "type": "farmer",
  "remarks": "All documents verified"
}
```

### Reject Registration
```
POST /api/government/reject/{user_id}/
```

---

## 🌤️ Advisories APIs

### Weather Forecast (5-day)
```
GET /api/advisories/weather/?latitude=21.1458&longitude=79.0882
```

### Crop Advisory
```
GET /api/advisories/crop-advisory/?crop_type=soybean&stage=flowering
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "crop_type": "soybean",
    "growth_stage": "flowering",
    "advisories": [
      "Critical water requirement period",
      "Monitor for pod borer",
      "Foliar spray of DAP 2%"
    ]
  }
}
```

### Pest & Disease Alerts
```
GET /api/advisories/pest-alerts/?district=Nagpur&crop_type=soybean
```

### Market Insights
```
GET /api/advisories/market-insights/
```

---

## 🔔 Notifications APIs

### Get My Notifications
```
GET /api/notifications/
```

### Mark as Read
```
POST /api/notifications/{notification_id}/mark_read/
```

### Register Push Token (Mobile)
```
POST /api/notifications/push-tokens/
```

---

## 💳 Payments APIs

### Get Payment Details
```
GET /api/payments/{payment_id}/
```

### Get Transaction History
```
GET /api/payments/transactions/
```

### Get Wallet Balance
```
GET /api/payments/wallet/
```

---

## 📊 Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {...},
  "meta": {
    "timestamp": "2025-12-05T10:30:00Z"
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Operation failed",
  "errors": {
    "field_name": ["Error message"]
  },
  "meta": {
    "timestamp": "2025-12-05T10:30:00Z"
  }
}
```

### Paginated Response
```json
{
  "status": "success",
  "data": {
    "results": [...]
  },
  "meta": {
    "count": 100,
    "next": "http://...",
    "previous": null,
    "page": 1,
    "page_size": 10
  }
}
```

---

## 🔑 Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

Get token from `/api/users/login/`

Refresh token:
```
POST /api/token/refresh/
Body: {"refresh": "refresh_token_here"}
```

---

## 🎯 Key Features Implemented

### ✅ Farmer Features
- Phone OTP registration & login
- Create lots/listings
- Receive & accept bids
- Track payments
- Live market prices
- Weather advisories
- AI crop disease detection
- Yield prediction
- Nearby FPO finder

### ✅ FPO Features
- Dashboard with analytics
- Member management
- Procurement from farmers
- Warehouse management
- Bid placement
- Blockchain tracking

### ✅ Government Features
- National dashboard
- State-wise heatmap
- FPO monitoring & health scores
- Approval workflow
- Policy metrics tracking

### ✅ Blockchain Features
- QR code generation
- Complete traceability
- Hash chain verification
- Certificate download

### ✅ AI/ML Features (Mock)
- Crop disease detection
- Price prediction
- Yield estimation
- Demand forecasting

---

## 🚀 Setup Instructions

1. **Install Dependencies**
```bash
pip install -r requirements.txt
```

2. **Run Migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

3. **Create Superuser**
```bash
python manage.py createsuperuser
```

4. **Run Server**
```bash
python manage.py runserver
```

5. **Access APIs**
- API Base: `http://localhost:8000/api/`
- Admin Panel: `http://localhost:8000/admin/`

---

## 📝 Notes

- Database: SQLite (for hackathon simplicity)
- No Redis/Celery (kept simple)
- AI models mocked (actual ML separate service)
- Blockchain simplified (hash chain, not Hyperledger for MVP)
- All responses follow consistent format
- JWT authentication throughout
- CORS enabled for frontend integration

---

## 🏆 Hackathon Ready!

All endpoints tested and working. Ready for frontend integration! 🚀
