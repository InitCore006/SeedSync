# SeedSync Mobile App - Implementation Guide

## ✅ Completed Infrastructure (Ready to Use)

### 1. TypeScript Types (`types/api.ts`)
All comprehensive type definitions have been created matching the backend models:
- **User & Auth**: `User`, `AuthResponse`, `RegisterData`, `LoginCredentials`
- **Farmer**: `FarmerProfile`, `FarmerProfileCreateData`
- **Lots**: `ProcurementLot`, `LotImage`, `LotCreateData`
- **Bids**: `Bid`, `BidCreateData`, `MyBidsResponse`
- **Payments**: `Payment`
- **Logistics**: `LogisticsPartner`, `Vehicle`, `Shipment`, `ShipmentCreateData`, `ShipmentUpdateStatus`
- **Market & Weather**: `MandiPrice`, `MSPRecord`, `WeatherData`, `WeatherAlert`, `CropAdvisory`
- **AI**: `DiseaseDetection`, `DiseaseDetectionResult`
- **FPO**: `FPOProfile`
- **Notifications**: `Notification`
- **Blockchain**: `BlockchainTransaction`, `TraceabilityData`

### 2. API Services (All Endpoints Configured)

#### `services/farmersService.ts`
- `getMyProfile()` - Get farmer profile
- `createProfile(data)` - Create farmer profile after registration
- `updateProfile(data)` - Update farmer profile
- `getStats()` - Get farmer statistics
- `getMarketPrices(params)` - Live mandi prices with MSP and trends
- `getWeatherAdvisory(params)` - 5-day forecast with alerts
- `detectDisease(imageUri, cropType)` - AI disease detection
- `getDiseaseHistory()` - Past disease detections
- `getNearbyFPOs(params)` - Find FPOs by location
- `getYieldPrediction(data)` - Predict crop yield
- `getFarmlands()` - Get all farmlands
- `addFarmland(data)` - Add new farmland

#### `services/lotsService.ts` (Already existed, comprehensive)
- All lot CRUD operations
- Image upload
- Market prices

#### `services/bidsService.ts`
- `getLotBids(lotId)` - Get all bids for a lot
- `getMyBids()` - Get received and sent bids
- `getBidDetail(id)` - Get bid details
- `createBid(data)` - Create new bid
- `acceptBid(id, data)` - Accept bid with optional response
- `rejectBid(id, data)` - Reject bid with optional response

#### `services/paymentsService.ts`
- `getMyPayments(params)` - Get user's payments with filters
- `getPaymentDetail(id)` - Get payment details
- `createPayment(data)` - Create new payment
- `verifyPayment(id, data)` - Verify payment

#### `services/logisticsService.ts`
- **Partner**: `getMyProfile()`, `getStats()`, `updateProfile(data)`
- **Vehicles**: `getVehicles()`, `addVehicle(data)`
- **Shipments**: `getShipments(params)`, `getShipmentDetail(id)`
- **Bookings**: `acceptBooking(id, data)`, `rejectBooking(id, data)`
- **Status Updates**: `updateStatus(id, data)`, `updateLocation(id, data)`
- **History**: `getTripHistory(params)`
- **Earnings**: `getEarnings()`, `getPerformance()`
- **Media**: `uploadPhoto(imageUri, type)`
- **Issues**: `reportIssue(shipmentId, data)`

#### `services/notificationsService.ts`
- `getNotifications(params)` - Get all notifications
- `markAsRead(id)` - Mark single as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(id)` - Delete notification

#### `services/blockchainService.ts`
- `generateQRCode(lotId)` - Generate QR for lot
- `getTrace(lotId)` - Get traceability timeline
- `getCertificate(lotId)` - Download certificate
- `addBlockchainEntry(data)` - Add blockchain transaction (mock)

### 3. Zustand Stores (State Management)

#### `store/authStore.ts` (Already existed)
- User authentication state

#### `store/lotsStore.ts` (Already existed)
- Lots management

#### `store/bidsStore.ts` (Already existed)
- Bids management

#### `store/farmerStore.ts` ✨ NEW
- `profile` - Farmer profile state
- `stats` - Farmer statistics
- Actions: `setProfile`, `updateProfile`, `setStats`, `clearProfile`

#### `store/paymentsStore.ts` ✨ NEW
- `payments` - All payments
- `selectedPayment` - Currently selected payment
- Actions: `setPayments`, `addPayment`, `updatePayment`, `clearPayments`

#### `store/logisticsStore.ts` ✨ NEW
- `profile` - Logistics partner profile
- `vehicles` - All vehicles
- `shipments` - All shipments
- `activeShipments` - Active/pending shipments
- `tripHistory` - Completed trips
- `stats` - Partner statistics
- `earnings` - Earnings data
- Actions: Complete CRUD for all entities

#### `store/notificationsStore.ts` ✨ NEW
- `notifications` - All notifications
- `unreadCount` - Count of unread
- Actions: `setNotifications`, `markAsRead`, `markAllAsRead`, `removeNotification`

### 4. UI Components

#### `components/BidCard.tsx` ✨ NEW
- Displays bid information
- Shows bidder details, offered price, total amount
- Payment terms and pickup date
- Accept/Reject actions for farmers
- Status badges

#### `components/ShipmentCard.tsx` ✨ NEW
- Displays shipment/trip information
- Pickup and delivery locations with icons
- Distance and scheduled dates
- Farmer contact information
- Accept/Reject actions for drivers
- Status badges with icons

#### `components/PaymentCard.tsx` ✨ NEW
- Displays payment details
- Gross amount, commission, tax breakdown
- Net amount calculation
- Payment method and dates
- Status indicators

#### `components/LotCard.tsx` (Already existed)
- Lot display card

#### `components/Button.tsx`, `Input.tsx`, `Loading.tsx` (Already existed)
- Base UI components

### 5. Constants

#### `constants/crops.ts` ✨ NEW
Complete crop and status definitions:
- `CROP_TYPES` - 8 oilseeds with icons (soybean, mustard, groundnut, etc.)
- `QUALITY_GRADES` - A+, A, B, C with colors
- `LOT_STATUS` - available, bidding, sold, delivered
- `BID_STATUS` - pending, accepted, rejected
- `PAYMENT_STATUS` - pending, processing, completed, failed
- `SHIPMENT_STATUS` - pending, accepted, in_transit, delivered, cancelled
- `PAYMENT_TERMS` - immediate, 7_days, 15_days, 30_days
- `VEHICLE_TYPES` - truck, mini_truck, van, tractor
- `INDIAN_STATES` - All Indian states with codes
- Helper functions: `getCropLabel()`, `getCropIcon()`, `getQualityGradeColor()`, `getStatusInfo()`

#### `constants/config.ts` - Updated
All API endpoints configured for both farmer and logistics modules

## 📱 Screens to Build

### Farmer App Screens (Role: 'farmer')

#### 1. Dashboard (`app/(tabs)/index.tsx`)
**Update needed for role-based display**
- Stats cards: Total lots, earnings, active bids, pending payments
- Quick actions: Create lot, view bids, market prices
- Recent lots list
- Notifications bell with unread count

**API Calls**:
```typescript
import { farmersAPI } from '@/services/farmersService';
import { useFarmerStore } from '@/store/farmerStore';

const stats = await farmersAPI.getStats();
useFarmerStore.getState().setStats(stats.data);
```

#### 2. Lots Module (`app/(tabs)/lots/`)

**`lots/index.tsx`** - My Lots List
- Tab filters: All, Available, Bidding, Sold, Delivered
- Use `LotCard` component
- Pull-to-refresh
- FAB button for Create Lot

**API Calls**:
```typescript
import { lotsAPI } from '@/services/lotsService';
const response = await lotsAPI.getMyLots();
```

**`lots/create.tsx`** - Create Lot Screen
Fields needed:
- Crop type (dropdown from CROP_TYPES)
- Crop variety (optional text)
- Harvest date (date picker)
- Quantity in quintals (number input)
- Quality grade (A+/A/B/C picker)
- Expected price per quintal (number input)
- Moisture content % (optional)
- Oil content % (optional)
- Description (multiline text)
- Organic certified (switch)
- Pickup address (text)
- Upload 2-3 images (camera/gallery)

**API Calls**:
```typescript
const lot = await lotsAPI.createLot(formData);
// Then upload images
for (const imageUri of selectedImages) {
  await lotsAPI.uploadImage(lot.data.id, imageUri);
}
```

**`lots/[id].tsx`** - Lot Details Screen
- Display all lot information
- Image gallery
- QR code display
- View bids button (navigate to bids list)
- Blockchain trace button

#### 3. Bids Module (`app/bids/`)

**`bids/index.tsx`** - My Bids List
- Tab: Received Bids, Sent Bids (if bidding on other lots)
- Use `BidCard` component with showActions={true}
- Filter by status
- Real-time updates via notifications

**API Calls**:
```typescript
import { bidsAPI } from '@/services/bidsService';
const response = await bidsAPI.getMyBids();
// response.data.received - bids on my lots
// response.data.sent - bids I made
```

**`bids/[id].tsx`** - Bid Details Screen
- Full bid information
- Bidder profile (if FPO, show FPO details)
- Accept/Reject buttons with response textarea
- Timeline of bid status changes

**API Calls**:
```typescript
// Accept bid
await bidsAPI.acceptBid(bidId, {
  farmer_response: "Accepted. Please arrange pickup on agreed date."
});

// Reject bid
await bidsAPI.rejectBid(bidId, {
  farmer_response: "Price too low for this quality."
});
```

#### 4. Payments Module (`app/payments/`)

**`payments/index.tsx`** - Payments List
- Use `PaymentCard` component
- Filter by status: All, Pending, Completed, Failed
- Show total earnings
- Filter by date range

**API Calls**:
```typescript
import { paymentsAPI } from '@/services/paymentsService';
const response = await paymentsAPI.getMyPayments({
  status: 'completed'
});
```

**`payments/[id].tsx`** - Payment Details
- Complete payment breakdown
- Receipt download button
- Bank transfer details
- Transaction timeline

#### 5. Market Prices (`app/(tabs)/market/prices.tsx`)
- Crop selector dropdown
- State/District filter
- Display mandi prices in cards
- MSP rates highlighted
- 7-day price trend line chart (use react-native-chart-kit)
- Refresh button for latest prices

**API Calls**:
```typescript
const response = await farmersAPI.getMarketPrices({
  crop_type: 'soybean',
  state: 'MH',
  district: 'Pune'
});
// response.data.mandi_prices - array of mandi prices
// response.data.msp_records - MSP data
// response.data.price_trend - chart data
```

#### 6. Weather Advisory (`app/(tabs)/market/weather.tsx`)
- Get user location automatically
- 5-day forecast cards with weather icons
- Temperature, humidity, rainfall
- Weather alerts banner
- Crop-specific advisory cards

**API Calls**:
```typescript
import * as Location from 'expo-location';

const location = await Location.getCurrentPositionAsync({});
const response = await farmersAPI.getWeatherAdvisory({
  latitude: location.coords.latitude,
  longitude: location.coords.longitude
});
// response.data.forecast - 5-day forecast
// response.data.alerts - weather alerts
// response.data.crop_advisory - crop advisory
```

#### 7. AI Disease Detection (`app/ai/disease-detection.tsx`)
- Camera/Gallery image picker
- Crop type selector
- Upload image
- Show detection result with confidence score
- Treatment recommendations
- Detection history list

**API Calls**:
```typescript
import * as ImagePicker from 'expo-image-picker';

const result = await ImagePicker.launchCameraAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  quality: 0.8,
});

if (!result.canceled) {
  const detection = await farmersAPI.detectDisease(
    result.assets[0].uri,
    'soybean'
  );
  // detection.data - DiseaseDetectionResult with recommendations
}
```

#### 8. Nearby FPO Finder (`app/fpos/index.tsx`)
- Map view with FPO markers (react-native-maps)
- List view toggle
- Distance calculation
- FPO cards with contact buttons (call/WhatsApp)
- Get directions button

**API Calls**:
```typescript
const location = await Location.getCurrentPositionAsync({});
const response = await farmersAPI.getNearbyFPOs({
  latitude: location.coords.latitude,
  longitude: location.coords.longitude,
  radius_km: 50
});
```

#### 9. Profile (`app/(tabs)/profile.tsx`)
**Update for farmer role**:
- Display farmer profile info
- Edit profile button
- Stats: Total lots, earnings, quantity sold
- Bank details
- KYC status
- Logout button

### Logistics App Screens (Role: 'logistics')

#### 1. Dashboard (`app/(tabs)/index.tsx`)
**For logistics role**:
- Stats cards: Total trips, earnings, on-time delivery %
- Active shipments count
- Today's pickups/deliveries
- Quick actions: View bookings, trip history

**API Calls**:
```typescript
import { logisticsAPI } from '@/services/logisticsService';
const stats = await logisticsAPI.getStats();
const earnings = await logisticsAPI.getEarnings();
```

#### 2. Bookings/Trips (`app/logistics/bookings/`)

**`bookings/index.tsx`** - Trips List
- Tabs: Pending, Accepted, In Transit, Delivered
- Use `ShipmentCard` component
- For pending: showActions={true} for accept/reject

**API Calls**:
```typescript
// Get pending bookings
const response = await logisticsAPI.getShipments({
  status: 'pending'
});

// Get active shipments
const activeResponse = await logisticsAPI.getShipments({
  status: 'in_transit'
});
```

**`bookings/[id].tsx`** - Trip Details
- Complete shipment information
- Pickup and delivery locations on map
- Contact information (call buttons)
- QR code scanner
- Status update buttons based on current status
- Photo upload section
- Signature capture

**Status Flow**:
1. **Pending** → Accept/Reject
2. **Accepted** → Mark Pickup Complete
3. **In Transit** → Mark Delivered
4. **Delivered** → View only

**API Calls**:
```typescript
// Accept booking
await logisticsAPI.acceptBooking(shipmentId, {
  vehicle_id: selectedVehicleId,
  estimated_pickup_time: new Date().toISOString()
});

// Reject booking
await logisticsAPI.rejectBooking(shipmentId, {
  rejection_reason: "Vehicle not available",
  notes: "Already scheduled for another trip"
});
```

#### 3. Pickup Complete Screen (`app/logistics/pickup/[id].tsx`)
Fields needed:
- Scan lot QR code (expo-barcode-scanner)
- Upload pickup photo (camera)
- Capture farmer signature (react-native-signature-canvas)
- Actual quantity received (number input)
- Quality check notes (textarea)

**API Calls**:
```typescript
// First upload photo
const photoResponse = await logisticsAPI.uploadPhoto(imageUri, 'pickup');

// Then update status
await logisticsAPI.updateStatus(shipmentId, {
  status: 'in_transit',
  actual_pickup_date: new Date().toISOString(),
  pickup_photo: photoResponse.data.url,
  pickup_signature: signatureDataUrl,
  actual_quantity_received_quintals: actualQuantity,
  quality_check_notes: notes
});
```

#### 4. Delivery Complete Screen (`app/logistics/delivery/[id].tsx`)
Fields needed:
- Scan QR code at delivery location
- Upload delivery photo
- Capture receiver signature
- Receiver name confirmation
- Quality grade verified (dropdown)
- Delivery notes

**API Calls**:
```typescript
const photoResponse = await logisticsAPI.uploadPhoto(imageUri, 'delivery');

await logisticsAPI.updateStatus(shipmentId, {
  status: 'delivered',
  actual_delivery_date: new Date().toISOString(),
  delivery_photo: photoResponse.data.url,
  delivery_signature: signatureDataUrl,
  quality_grade_verified: 'A'
});
```

#### 5. Trip History (`app/logistics/history/index.tsx`)
- List of completed/cancelled trips
- Filter by date range, crop type
- Earnings per trip
- On-time delivery indicator
- Tap to view full details

**API Calls**:
```typescript
const response = await logisticsAPI.getTripHistory({
  start_date: '2025-01-01',
  end_date: '2025-12-31'
});
```

#### 6. Earnings (`app/logistics/earnings/index.tsx`)
- Total earnings dashboard
- Current month earnings
- Pending payments
- Payment history list
- Average per trip
- Graph showing monthly earnings

**API Calls**:
```typescript
const earnings = await logisticsAPI.getEarnings();
// earnings.data.total_earnings
// earnings.data.current_month_earnings
// earnings.data.payment_history - array of payments
```

#### 7. Performance Metrics (`app/logistics/performance/index.tsx`)
- Total trips completed
- On-time delivery percentage (progress circle)
- Average rating
- Total distance traveled
- Month-over-month comparison

**API Calls**:
```typescript
const performance = await logisticsAPI.getPerformance();
```

#### 8. Profile (`app/(tabs)/profile.tsx`)
**For logistics role**:
- Company information
- Vehicles list with add button
- Contact details
- Statistics
- Logout

**API Calls**:
```typescript
const profile = await logisticsAPI.getMyProfile();
const vehicles = await logisticsAPI.getVehicles();

// Add vehicle
await logisticsAPI.addVehicle({
  vehicle_number: 'MH12AB1234',
  vehicle_type: 'truck',
  capacity_quintals: 100
});
```

## 🎨 Navigation Structure Update

Update `app/(tabs)/_layout.tsx` to be role-based:

```typescript
import { useAuthStore } from '@/store/authStore';

export default function TabsLayout() {
  const user = useAuthStore(state => state.user);
  
  if (user?.role === 'farmer') {
    return (
      <Tabs>
        <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
        <Tabs.Screen name="lots" options={{ title: 'My Lots' }} />
        <Tabs.Screen name="market" options={{ title: 'Market' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    );
  }
  
  if (user?.role === 'logistics') {
    return (
      <Tabs>
        <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
        <Tabs.Screen name="bookings" options={{ title: 'Trips' }} />
        <Tabs.Screen name="history" options={{ title: 'History' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    );
  }
  
  return null;
}
```

## 📦 Additional Dependencies Needed

Install these packages:

```bash
npx expo install expo-image-picker expo-camera expo-barcode-scanner expo-location react-native-maps
npm install react-native-chart-kit react-native-signature-canvas
```

## 🔧 Implementation Priority

### Phase 1 - Core Features (Week 1)
1. ✅ Update navigation for role-based tabs
2. ✅ Farmer Dashboard
3. ✅ Create Lot screen
4. ✅ My Lots list
5. ✅ Lot Details
6. ✅ Logistics Dashboard
7. ✅ Trips/Bookings list
8. ✅ Trip Details

### Phase 2 - Transaction Flow (Week 2)
1. ✅ Bids list and details
2. ✅ Accept/Reject bids
3. ✅ Payments list
4. ✅ Accept/Reject trips (logistics)
5. ✅ Pickup complete flow
6. ✅ Delivery complete flow

### Phase 3 - Value-Added Features (Week 3)
1. ✅ Market prices with charts
2. ✅ Weather advisory
3. ✅ Disease detection
4. ✅ Nearby FPO finder
5. ✅ Trip history
6. ✅ Earnings dashboard

### Phase 4 - Polish (Week 4)
1. ✅ QR code generation and scanning
2. ✅ Blockchain traceability view
3. ✅ Notifications integration
4. ✅ Profile management
5. ✅ Testing and bug fixes

## 🚀 Next Steps

1. **Start with navigation update** - Make tabs role-based
2. **Build farmer dashboard** - Shows stats and quick actions
3. **Create lot creation screen** - Most critical farmer feature
4. **Build logistics trips screen** - Most critical logistics feature
5. **Implement status update flows** - Complete the transaction cycle

All the infrastructure (types, services, stores, components) is ready. You just need to build the screens using the provided services and components!
