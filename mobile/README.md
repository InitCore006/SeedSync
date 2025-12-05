# SeedSync Mobile App - Setup Complete

## Project Overview
Complete React Native mobile application for the SeedSync oilseed value chain platform, built with Expo Router and TypeScript.

## Technology Stack
- **Expo SDK**: ~54.0.26
- **React Native**: 0.81.5
- **React**: 19.1.0
- **Navigation**: Expo Router 6.0.16 (file-based routing)
- **State Management**: Zustand 5.0.9
- **HTTP Client**: Axios 1.13.2
- **Storage**: AsyncStorage 2.2.0
- **Camera/Media**: expo-camera, expo-image-picker
- **Location**: expo-location, react-native-maps
- **Charts**: react-native-chart-kit
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
│   │   ├── _layout.tsx        # Auth stack navigation
│   │   ├── login.tsx          # Login with OTP
│   │   ├── register.tsx       # User registration
│   │   └── verify-otp.tsx     # OTP verification
│   ├── (tabs)/                # Main app tabs
│   │   ├── _layout.tsx        # Bottom tab navigation
│   │   ├── index.tsx          # Dashboard
│   │   ├── profile.tsx        # User profile
│   │   ├── lots/              # Lot management
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx      # Lots list
│   │   │   ├── create.tsx     # Create lot
│   │   │   └── [id].tsx       # Lot details & bids
│   │   └── market/            # Market intelligence
│   │       ├── _layout.tsx
│   │       ├── index.tsx      # Market hub
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
