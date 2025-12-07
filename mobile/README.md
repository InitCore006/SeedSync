# SeedSync Mobile App

## 🎯 Complete Mobile Application
Full-featured React Native mobile app for SeedSync oilseed value chain platform supporting **Farmer** and **Logistics** roles.

## Quick Links
- 📖 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Complete feature list
- 🐛 [Error Tracking & API Logging](./ERROR_TRACKING.md)
- 🚀 [Running the App](#running-the-app)

## ✅ What's Implemented

### Infrastructure ✅
- Complete TypeScript types for all models
- 6 API service files with full CRUD operations
- 4 Zustand stores for state management
- Shared components (BidCard, ShipmentCard, PaymentCard, LotCard)
- Constants for crops, quality grades, statuses

### Farmer Features (12 screens) ✅
- **Dashboard** - Stats and quick actions
- **Lots Management** - List, create (with all fields), details with QR code
- **Bids** - Received/sent tabs, accept/reject, details
- **Market** - Prices and weather advisory
- **AI** - Disease detection with camera
- **FPOs** - Find nearby farmer organizations
- **Payments** - History and details with verification

### Logistics Features (6 screens) ✅
- **Dashboard** - Stats and quick actions
- **Trips** - Pending/active/completed tabs
- **Trip Details** - Map view with pickup/delivery
- **Pickup Completion** - Photos + signature capture
- **Delivery Completion** - Photos + signature + quality verification
- **History** - Earnings summary and trip history

## Technology Stack
- **Expo SDK**: ~54.0.26
- **React Native**: 0.81.5
- **Navigation**: Expo Router 6.0.16 (file-based routing)
- **State Management**: Zustand 5.0.9
- **HTTP Client**: Axios 1.7.9
- **Maps**: react-native-maps 1.18.2
- **QR Codes**: react-native-qrcode-svg
- **Signatures**: react-native-signature-canvas
- **Icons**: @expo/vector-icons

## Backend Integration
- **API Base URL**: http://127.0.0.1:8000/api
- **Authentication**: JWT with refresh token flow
- **Phone Format**: Users enter 10 digits, backend adds +91 prefix

## Project Structure

```
mobile/
├── app/
│   ├── (auth)/                 # Authentication flow
│   │   ├── login.tsx          # Login with OTP
│   │   ├── register.tsx       # User registration
│   │   └── verify-otp.tsx     # OTP verification
│   ├── (tabs)/                # Main app (role-based tabs)
│   │   ├── index.tsx          # Dashboard (farmer/logistics)
│   │   ├── lots/              # Farmer: Lot management
│   │   │   ├── index.tsx      # List with filters
│   │   │   ├── create.tsx     # Create with all fields ⭐
│   │   │   └── [id].tsx       # Details with QR ⭐
│   │   ├── bids/              # Farmer: Bid management
│   │   │   ├── index.tsx      # Received/sent tabs
│   │   │   └── [id].tsx       # Bid details
│   │   ├── market/            # Farmer: Market intelligence
│   │   │   ├── prices.tsx     # Market prices
│   │   │   └── weather.tsx    # Weather advisory
│   │   ├── payments/          # Payments ⭐ NEW
│   │   │   ├── index.tsx      # History with filters
│   │   │   └── [id].tsx       # Payment details
│   │   ├── trips/             # Logistics: Trip management
│   │   │   ├── index.tsx      # Pending/active/completed
│   │   │   ├── [id].tsx       # Trip details + map ⭐
│   │   │   ├── pickup/        # ⭐ NEW
│   │   │   │   └── [id].tsx   # Pickup completion
│   │   │   └── delivery/      # ⭐ NEW
│   │   │       └── [id].tsx   # Delivery completion
│   │   └── history/           # Logistics: Earnings history
│   ├── ai/                    # AI features
│   │   └── disease-detection.tsx
│   └── fpos/                  # FPO finder
│       └── index.tsx
├── components/                # Reusable components
│   ├── BidCard.tsx           # Bid display with actions
│   ├── ShipmentCard.tsx      # Trip display
│   ├── PaymentCard.tsx       # Payment breakdown
│   └── LotCard.tsx           # Lot display
├── constants/
│   ├── colors.ts             # Theme colors
│   ├── config.ts             # API endpoints
│   └── crops.ts              # Crop types, grades, statuses
├── services/                 # API integration
│   ├── farmersService.ts     # 11 endpoints
│   ├── logisticsService.ts   # 14 endpoints
│   ├── paymentsService.ts    # 5 endpoints
│   ├── bidsService.ts        # 7 endpoints
│   ├── notificationsService.ts
│   └── blockchainService.ts
├── store/                    # Zustand state
│   ├── farmerStore.ts
│   ├── logisticsStore.ts
│   ├── paymentsStore.ts
│   └── notificationsStore.ts
└── types/
    └── api.ts                # Complete TypeScript types
```
│   │       ├── prices.tsx     # Live prices
│   │       └── weather.tsx    # Weather forecast
│   ├── ai/                    # AI features
│   │   ├── disease-detection.tsx
│   │   └── price-prediction.tsx
│   ├── fpos/                  # FPO finder
│   │   └── index.tsx
│   ├── _layout.tsx            # Root layout
│   └── index.tsx              # Entry point
├── components/                # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Loading.tsx
│   ├── LotCard.tsx
│   └── index.ts
├── constants/                 # Configuration
│   ├── colors.ts             # Color palette
│   └── config.ts             # API endpoints
├── services/                  # API integration
│   ├── api.ts                # Axios instance
│   ├── authService.ts        # Authentication
│   ├── lotsService.ts        # Lot management
│   ├── bidsService.ts        # Bidding
│   ├── aiService.ts          # AI features
│   ├── advisoryService.ts    # Weather/advisory
│   ├── fpoService.ts         # FPO finder
│   └── blockchainService.ts  # Blockchain
├── store/                     # Zustand state management
│   ├── authStore.ts          # User & auth state
│   ├── lotsStore.ts          # Lots management
│   └── bidsStore.ts          # Bids management
├── types/                     # TypeScript types
│   └── api.ts                # API interfaces
├── utils/                     # Utilities
│   ├── storage.ts            # AsyncStorage wrapper
│   └── formatters.ts         # Formatting functions
├── app.json                   # Expo configuration
└── package.json              # Dependencies
```

## Features Implemented

### Authentication
- ✅ Phone number-based OTP authentication
- ✅ User registration with multiple user types (Farmer, FPO, Processor, Retailer)
- ✅ JWT token management with auto-refresh
- ✅ Persistent login state

### Lot Management
- ✅ Create procurement lots with images
- ✅ View all lots with filters
- ✅ Lot details with image gallery
- ✅ Real-time bid tracking
- ✅ Accept/reject bids (for farmers)

### Bidding System
- ✅ Place bids on lots
- ✅ View received bids
- ✅ View sent bids
- ✅ Bid status tracking (pending/accepted/rejected)

### Market Intelligence
- ✅ Live mandi prices
- ✅ MSP (Minimum Support Price) information
- ✅ 5-day weather forecast
- ✅ Crop-specific advisory

### AI Features
- ✅ Disease detection via leaf image analysis
- ✅ 30-day price prediction with charts
- ✅ Confidence scores and treatment recommendations

### FPO Finder
- ✅ Location-based FPO search
- ✅ Interactive map with markers
- ✅ Distance calculation
- ✅ Direct call functionality

### Dashboard
- ✅ User statistics (lots, bids)
- ✅ Quick actions
- ✅ Pull-to-refresh

## Running the App

### Development
```bash
cd mobile
npx expo start
```

### Run on Device
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### Build for Production
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## API Endpoints Used

### Authentication
- POST /users/register/ - User registration
- POST /users/send-otp/ - Send registration OTP
- POST /users/send-login-otp/ - Send login OTP
- POST /users/verify-otp/ - Verify OTP
- POST /users/login/ - Login with OTP
- GET /users/profile/ - Get user profile
- PATCH /users/profile/ - Update profile

### Lots
- GET /lots/ - List all lots
- GET /lots/my-lots/ - Get user's lots
- GET /lots/{id}/ - Get lot details
- POST /lots/create/ - Create lot
- PATCH /lots/{id}/update/ - Update lot
- DELETE /lots/{id}/delete/ - Delete lot
- POST /lots/{id}/upload-image/ - Upload image
- GET /lots/market-prices/ - Get market prices

### Bids
- GET /bids/ - List all bids
- GET /bids/my-bids/ - Get user's bids
- GET /bids/lot/{id}/ - Get bids for lot
- POST /bids/create/ - Create bid
- POST /bids/{id}/accept/ - Accept bid
- POST /bids/{id}/reject/ - Reject bid

### AI
- POST /ai/detect-disease/ - Detect disease
- POST /ai/predict-price/ - Predict prices

### Advisory
- GET /advisory/weather/ - Weather forecast
- GET /advisory/crop-advisory/ - Crop advisory

### FPO
- GET /fpos/nearby/ - Find nearby FPOs

### Blockchain
- POST /blockchain/lots/{id}/generate-qr/ - Generate QR
- GET /blockchain/lots/{id}/trace/ - Get traceability

## Configuration

### API URL
Update in `constants/config.ts`:
```typescript
export const API_URL = 'http://127.0.0.1:8000/api';
```

### Color Theme
Primary color: #437409 (agricultural green)
Defined in `constants/colors.ts`

## Permissions Required

### iOS
- Camera access
- Photo library access
- Location (when in use)

### Android
- Camera
- Read/Write external storage
- Fine & coarse location

## State Management

### Auth Store
- User data
- JWT tokens
- Authentication state
- Login/logout actions

### Lots Store
- All lots
- User's lots
- Selected lot
- CRUD operations

### Bids Store
- Received bids
- Sent bids
- Bid status updates

## Key Features

### Auto-Refresh Token
- Axios interceptor automatically refreshes expired tokens
- Retries failed requests after refresh
- Auto-logout on refresh failure

### Image Upload
- FormData multipart/form-data for React Native
- Image picker with camera/gallery options
- Image compression for optimization

### Location Services
- GPS-based FPO search
- Weather by location
- Distance calculation

### Real-time Updates
- Pull-to-refresh on all lists
- Live bid updates
- Market price updates

## Development Notes

### Important Patterns
1. **Service Layer**: All API calls go through service files
2. **Store Layer**: Zustand stores manage global state
3. **Component Layer**: Reusable UI components
4. **Screen Layer**: Feature screens use stores and services

### Phone Number Handling
- Users enter 10 digits
- Backend formats to +91XXXXXXXXXX
- Display uses formatPhoneNumber utility

### Error Handling
- All API calls wrapped in try-catch
- User-friendly Alert messages
- Network error handling

### Type Safety
- Complete TypeScript coverage
- API response types match Django models
- Strict type checking enabled

## Next Steps

1. **Backend Connection**
   - Ensure Django backend is running
   - Update API_URL if needed
   - Test all endpoints

2. **Testing**
   - Test authentication flow
   - Test lot creation with images
   - Test bidding workflow
   - Test AI features

3. **Deployment**
   - Set up EAS Build
   - Configure environment variables
   - Submit to app stores

## Support

For issues or questions:
- Check backend API is running: http://127.0.0.1:8000/api
- Verify phone format: 10 digits without prefix
- Check permissions are granted
- Review network connectivity

---

**Status**: ✅ Mobile app fully implemented and ready for testing
**Last Updated**: 2024
**Version**: 1.0.0
