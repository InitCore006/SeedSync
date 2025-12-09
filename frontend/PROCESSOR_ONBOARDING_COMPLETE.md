# Processor Onboarding - Backend Integration Complete ✅

## Overview
Updated the processor onboarding form to fully align with the backend `ProcessorProfile` model, ensuring complete end-to-end registration functionality.

## Changes Made

### 1. Form State Alignment
**Removed Fields** (not in backend model):
- ❌ `registration_number`
- ❌ `year_of_establishment`
- ❌ `processor_type`
- ❌ `processing_capacity` + `processing_capacity_unit` (separate fields)
- ❌ `products_manufactured[]`
- ❌ `district`
- ❌ `pincode`

**Added/Updated Fields** (matching backend):
- ✅ `company_name` (CharField, max 200)
- ✅ `contact_person` (CharField, max 200) - NEW
- ✅ `phone` (CharField, max 15, with +91 prefix) - NEW
- ✅ `email` (EmailField) - REQUIRED
- ✅ `address` (TextField) - renamed from factory_address
- ✅ `city` (CharField, max 100)
- ✅ `state` (CharField with INDIAN_STATES choices)
- ✅ `processing_capacity_quintals_per_day` (DecimalField) - CONSOLIDATED
- ✅ `latitude` (DecimalField, optional)
- ✅ `longitude` (DecimalField, optional)

### 2. Form Structure
**2-Step Registration Process:**

#### Step 1: Company & Processing Details
- Company Name (max 200 chars)
- Contact Person Name (letters and spaces only, max 200 chars)
- Phone Number (10 digits, starts with 6-9)
- Email Address (valid email format)
- Processing Capacity in Quintals Per Day (decimal)

#### Step 2: Address Information
- Factory Address (textarea, min 10 chars, max 500 chars)
- City (letters and spaces only, max 100 chars)
- State (dropdown from INDIAN_STATES)
- Location Coordinates (optional, auto-fetchable)
  - Latitude (6 decimal places)
  - Longitude (6 decimal places)
  - "Fetch from Address" button using Nominatim API

### 3. Validation Rules

#### Step 1 Validation:
- **Company Name**: Required, min 3 characters, max 200
- **Contact Person**: Required, only letters and spaces, max 200
- **Phone**: Required, exactly 10 digits, starts with 6-9
- **Email**: Required, valid email format
- **Processing Capacity**: Required, must be > 0, decimal allowed

#### Step 2 Validation:
- **Address**: Required, min 10 characters, max 500
- **City**: Required, only letters and spaces, max 100
- **State**: Required, must be from dropdown

### 4. Data Submission

**API Endpoint:** `POST /api/processors/profile/`

**Request Body Structure:**
```json
{
  "company_name": "ABC Processing Ltd",
  "contact_person": "John Doe",
  "phone": "+919876543210",
  "email": "contact@company.com",
  "address": "Plot 123, Industrial Area, Sector 45",
  "city": "Mumbai",
  "state": "MH",
  "processing_capacity_quintals_per_day": 100.50,
  "latitude": 19.076090,
  "longitude": 72.877426
}
```

**Key Transformations:**
1. Phone number: Adds `+91` prefix if not present
2. State: Converts display name to backend code using `stateNameToCode()`
3. Processing capacity: Parses to float
4. Coordinates: Parses to float or null if empty

### 5. Geolocation Integration

**Nominatim API Integration:**
- Endpoint: `https://nominatim.openstreetmap.org/search`
- Query format: `{address}, {city}, {state}, India`
- Returns coordinates with 6 decimal precision
- Button to trigger fetch: "Fetch from Address"
- User feedback via toast notifications

### 6. Backend Model Compatibility

**ProcessorProfile Model (apps/processors/models.py):**
```python
class ProcessorProfile(TimeStampedModel):
    user = models.OneToOneField(...)
    company_name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=200)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2, choices=INDIAN_STATES)
    processing_capacity_quintals_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    is_verified = models.BooleanField(default=False)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
```

✅ All frontend form fields now match backend model exactly

### 7. UI/UX Preserved
- Same 2-step wizard interface
- Progress indicator with step tracking
- Responsive design (mobile-friendly)
- Input validation with error messages
- Loading states for async operations
- Toast notifications for user feedback
- Clean, professional styling maintained

## Testing Checklist

### Form Validation
- [ ] Company name requires min 3 characters
- [ ] Contact person only accepts letters and spaces
- [ ] Phone validates 10 digits starting with 6-9
- [ ] Email validates proper format
- [ ] Processing capacity must be positive number
- [ ] Address requires min 10 characters
- [ ] City only accepts letters and spaces
- [ ] State dropdown works correctly

### Geolocation
- [ ] "Fetch from Address" button triggers API call
- [ ] Coordinates populate correctly
- [ ] Loading state displays during fetch
- [ ] Error handling for invalid addresses
- [ ] Success/error toasts display appropriately

### Submission
- [ ] Step 1 validation prevents progression
- [ ] Step 2 validation prevents submission
- [ ] Phone number gets +91 prefix
- [ ] State converts to backend code
- [ ] Decimal fields parse correctly
- [ ] API receives correct JSON structure
- [ ] Success redirects to /processor/dashboard
- [ ] Error messages display clearly

## API Integration

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
```

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "company_name": "ABC Processing Ltd",
    "contact_person": "John Doe",
    "phone": "+919876543210",
    ...
  }
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Validation error details..."
}
```

## Files Modified
- `frontend/app/processor/onboarding/page.tsx` - Complete rewrite to match backend

## Dependencies
- OpenStreetMap Nominatim API (geolocation)
- `stateNameToCode()` utility (state conversion)
- JWT authentication (token in localStorage)

## Next Steps
1. Test complete registration flow
2. Verify JWT authentication
3. Test coordinate fetching with various addresses
4. Confirm profile creation in database
5. Test redirect to processor dashboard
6. Validate phone number storage with +91 prefix
7. Check decimal precision for processing capacity

## Notes
- Form now collects ONLY backend-required fields
- No extraneous data submitted to API
- State names converted to 2-letter codes automatically
- Coordinates are optional (can be null)
- User field set automatically by backend from JWT token
- Processing capacity standardized to quintals/day
