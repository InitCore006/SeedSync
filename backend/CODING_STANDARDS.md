# SeedSync Coding Standards

## 1. Naming Conventions

### Models
- PascalCase: `FarmerProfile`, `ProcurementLot`, `BlockchainTransaction`
- Always singular: `User` not `Users`

### Fields
- snake_case: `created_at`, `phone_number`, `total_quantity`
- Foreign Keys: `{model}` → `farmer`, `fpo` (Django auto-adds _id)
- Booleans: `is_active`, `is_verified`, `has_warehouse`
- Dates: `created_at`, `updated_at`, `harvested_at`
- Status: `status` (use choices)

### API Endpoints
Pattern: `/api/{app_name}/{resource}/{action}/`

Examples:
- `/api/farmers/register/`
- `/api/lots/create/`
- `/api/lots/{id}/bids/`
- `/api/blockchain/trace/{lot_id}/`

### ViewSets & Views
- ViewSet: `{Model}ViewSet` → `FarmerViewSet`
- APIView: `{Action}{Model}APIView` → `CreateLotAPIView`

### Serializers
- `{Model}Serializer` → `FarmerSerializer`
- `{Model}CreateSerializer` → `FarmerCreateSerializer`
- `{Model}DetailSerializer` → `FarmerDetailSerializer`

### Services
- `{domain}_service.py` → `blockchain_service.py`
- Function: `verb_noun()` → `generate_qr_code()`, `create_blockchain_entry()`

## 2. Status Choices (Standardized)

```python
# Use these everywhere
STATUS_PENDING = 'pending'
STATUS_ACTIVE = 'active'
STATUS_COMPLETED = 'completed'
STATUS_CANCELLED = 'cancelled'
STATUS_REJECTED = 'rejected'

# Quality Grades
GRADE_A_PLUS = 'A+'
GRADE_A = 'A'
GRADE_B = 'B'
GRADE_C = 'C'

# Payment Status
PAYMENT_PENDING = 'pending'
PAYMENT_PROCESSING = 'processing'
PAYMENT_COMPLETED = 'completed'
PAYMENT_FAILED = 'failed'
```

## 3. Response Format (Consistent)

```python
# Success Response
{
    "status": "success",
    "message": "Lot created successfully",
    "data": { ... },
    "meta": { "timestamp": "2025-01-15T10:30:00Z" }
}

# Error Response
{
    "status": "error",
    "message": "Invalid data provided",
    "errors": { "quantity": ["This field is required"] },
    "meta": { "timestamp": "2025-01-15T10:30:00Z" }
}

# Pagination Response
{
    "status": "success",
    "data": { "results": [...] },
    "meta": {
        "count": 50,
        "next": "http://...",
        "previous": null,
        "page": 1,
        "page_size": 10
    }
}
```

## 4. Oilseed Types (Indian Market)

```python
OILSEED_CHOICES = [
    ('soybean', 'Soybean (सोयाबीन)'),
    ('mustard', 'Mustard (सरसों)'),
    ('groundnut', 'Groundnut (मूंगफली)'),
    ('sunflower', 'Sunflower (सूरजमुखी)'),
    ('safflower', 'Safflower (कुसुम)'),
    ('sesame', 'Sesame (तिल)'),
    ('linseed', 'Linseed (अलसी)'),
    ('niger', 'Niger (रामतिल)'),
]
```

## 5. Indian States for FPO/Farmers

```python
INDIAN_STATES = [
    ('maharashtra', 'Maharashtra'),
    ('madhya_pradesh', 'Madhya Pradesh'),
    ('rajasthan', 'Rajasthan'),
    ('gujarat', 'Gujarat'),
    ('andhra_pradesh', 'Andhra Pradesh'),
    ('telangana', 'Telangana'),
    ('karnataka', 'Karnataka'),
    ('uttar_pradesh', 'Uttar Pradesh'),
    # ... add more as needed
]
```

## 6. Color Palette (Brand Identity)

```
Primary Green: #437409
Secondary Green: #438602
Light Green: #c8e686
```

## 7. Indian Context

- All prices in INR (₹)
- Quantity in Quintals (100 kg)
- Area in Acres/Hectares
- Phone numbers: +91 format
- MSP (Minimum Support Price) integration
- eNAM (National Agriculture Market) integration
- NMEO-OP (National Mission on Edible Oils) alignment
