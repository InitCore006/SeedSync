# Blockchain Traceability - UI Access Guide

## 🎯 Where to See Blockchain Traceability in the UI

### 1. **Public Traceability Page** (Consumer-Facing)
**URL Pattern:** `http://localhost:3000/trace/{LOT_NUMBER}`

**Example:** `http://localhost:3000/trace/SB2025042`

**Access:** ✅ No login required - Anyone can scan QR code or enter lot number

**Features:**
- Complete journey timeline from farmer to consumer
- All blockchain transactions with timestamps
- GPS location tracking on map
- Actor information (farmer, FPO, processor)
- Quality check details
- Processing stage metrics
- Verification status (chain integrity check)

**What You'll See:**
```
Farm Origin → FPO Procurement → Warehouse Storage → Quality Check 
→ Marketplace Listing → Bid Accepted → Shipped → Processor Received 
→ 8 Processing Stages → Packaged → Payment Settled
```

---

### 2. **QR Code Access**

**Location:** Every lot automatically gets a QR code when created

**Backend API:** `GET /api/blockchain/qr/{lot_number}/`

**QR Code Points To:** `https://yourdomain.com/trace/{lot_number}`

**How to Use:**
1. Scan QR code with phone camera
2. Opens public trace page
3. View complete supply chain journey

**QR Code Location in System:**
- Farmer dashboard - Each lot card
- FPO procurement dashboard - Lot details
- Processor batches - Source lot QR
- Product packaging - Final product QR

---

### 3. **Farmer Dashboard** (Authenticated)

**URL:** `http://localhost:3000/farmer/dashboard`

**Where to Find Traceability:**

#### Option A: Lot Details View
1. Navigate to "My Lots" section
2. Click on any lot card
3. Look for **"View Traceability"** or **QR Code icon** button
4. Opens trace page with blockchain history

#### Option B: Add Traceability Button (Implementation Needed)
```tsx
// In farmer lot card component
<button onClick={() => router.push(`/trace/${lot.lot_number}`)}>
  <ShieldCheck className="w-4 h-4" />
  View Blockchain Trail
</button>
```

---

### 4. **FPO Dashboard** (Authenticated)

**URL:** `http://localhost:3000/fpo/dashboard`

**Traceability Access Points:**

#### A. Procurement Page
**URL:** `http://localhost:3000/fpo/procurement`

1. View procured lots list
2. Each lot shows blockchain status
3. Click **"Trace"** button to view journey
4. See all transactions from farm to FPO

#### B. Warehouse Page
**URL:** `http://localhost:3000/fpo/warehouse`

1. Select warehouse
2. View stored lots
3. Click lot → **"View Traceability"**
4. Track lot from farmer through warehouse storage

#### C. Add QR Code Display (Implementation Needed)
```tsx
// In warehouse lot card
<div className="flex items-center gap-2">
  <QRCodeSVG value={`https://seedsync.app/trace/${lot.lot_number}`} size={80} />
  <button>Download QR</button>
</div>
```

---

### 5. **Marketplace View**

**URL:** `http://localhost:3000/marketplace`

**Traceability Features:**

1. Browse available lots
2. Each lot card shows:
   - ✅ **"Blockchain Verified"** badge
   - Transaction count (e.g., "12 verified transactions")
3. Click **"View Origin"** → Opens trace page
4. Buyers can verify authenticity before purchasing

**Implementation Needed:**
```tsx
// Add to lot card
<div className="flex items-center gap-1 text-green-600">
  <ShieldCheck className="w-4 h-4" />
  <span className="text-xs">Blockchain Verified</span>
</div>
<button className="text-blue-600 text-sm">
  View Full Journey →
</button>
```

---

### 6. **Processor Dashboard**

**URL:** `http://localhost:3000/processor/dashboard`

**Traceability Access:**

#### A. Processing Batches
1. View batch list
2. Each batch shows source lot number
3. Click **"Source Traceability"** → View lot origin
4. See complete upstream journey (farm → FPO → processor)

#### B. Finished Products
1. Navigate to finished products inventory
2. Each product linked to source batch
3. Click **"Full Traceability"** button
4. View complete journey: raw material → processing → finished product

**Implementation Needed:**
```tsx
// In batch detail view
<section>
  <h3>Source Traceability</h3>
  <button onClick={() => router.push(`/trace/${batch.source_lot_number}`)}>
    View Raw Material Origin
  </button>
  <div>
    <strong>Processing Chain:</strong>
    <ul>
      {batch.stage_logs.map(stage => (
        <li key={stage.id}>
          {stage.stage}: {stage.yield_percentage}% yield
          <span className="text-green-600">✓ Blockchain Verified</span>
        </li>
      ))}
    </ul>
  </div>
</section>
```

---

### 7. **Government Dashboard**

**URL:** `http://localhost:3000/government/dashboard`

**Traceability Monitoring:**

1. View all FPOs and their activities
2. Monitor procurement volumes
3. **Add:** "Verify Blockchain Integrity" button
4. Bulk verification of supply chain records

**Implementation Needed:**
```tsx
// Government verification panel
<Card>
  <h3>Blockchain Verification</h3>
  <button onClick={verifyAllChains}>
    Verify All Supply Chain Records
  </button>
  <div>
    <p>Total Verified Lots: {verifiedCount}</p>
    <p>Chain Integrity: {integrityPercentage}%</p>
  </div>
</Card>
```

---

## 🔧 Quick Implementation Checklist

### ✅ Already Implemented:
- [x] Backend blockchain models (BlockchainTransaction, TraceabilityRecord, QRCode)
- [x] Automatic signals for hash chain generation
- [x] Public trace page (`/trace/[lot_number]`)
- [x] API endpoints for traceability

### 🚧 To Add in UI (Quick Wins):

#### 1. **Add "View Traceability" Button to Lot Cards**
**Files to Update:**
- `frontend/app/fpo/procurement/page.tsx`
- `frontend/app/marketplace/page.tsx`
- `frontend/app/processor/dashboard/page.tsx`

```tsx
import { ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Add to lot card component
<button
  onClick={() => router.push(`/trace/${lot.lot_number}`)}
  className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
>
  <ShieldCheck className="w-4 h-4" />
  View Blockchain Trail
</button>
```

#### 2. **Display QR Codes**
**Create Component:** `frontend/components/blockchain/QRCodeDisplay.tsx`

```tsx
'use client';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeDisplay({ lotNumber }: { lotNumber: string }) {
  const traceUrl = `${window.location.origin}/trace/${lotNumber}`;
  
  return (
    <div className="p-4 bg-white rounded-lg border text-center">
      <QRCodeSVG value={traceUrl} size={150} />
      <p className="text-xs text-gray-600 mt-2">Scan to trace</p>
      <button onClick={() => downloadQR(lotNumber)}>Download</button>
    </div>
  );
}
```

#### 3. **Add Blockchain Verified Badge**
**Create Component:** `frontend/components/blockchain/VerifiedBadge.tsx`

```tsx
import { ShieldCheck } from 'lucide-react';

export default function VerifiedBadge({ transactionCount }: { transactionCount: number }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
      <ShieldCheck className="w-3 h-3" />
      <span>Blockchain Verified ({transactionCount} transactions)</span>
    </div>
  );
}
```

---

## 🧪 How to Test Blockchain Traceability

### Test Flow:

1. **Create a Lot (Farmer)**
   - Navigate to farmer dashboard
   - Create new lot
   - ✅ **Blockchain transaction automatically created** (via signals)

2. **FPO Procurement**
   - FPO procures the lot
   - ✅ **"Procured" transaction added to blockchain**

3. **Warehouse Entry**
   - Lot moved to warehouse
   - ✅ **"Warehouse In" transaction recorded**

4. **Quality Check**
   - Run quality test
   - ✅ **"Quality Checked" transaction with test results**

5. **Marketplace Listing**
   - List lot for sale
   - ✅ **"Listed" transaction**

6. **Processor Bid & Purchase**
   - Processor places bid
   - Bid accepted
   - ✅ **"Sale Agreed" transaction**
   - ✅ **"Shipped" transaction**
   - ✅ **"Received" transaction**

7. **Processing Stages**
   - Process through 8 stages
   - ✅ **8 "Stage Completed" transactions with yield data**

8. **Finished Product**
   - Package final product
   - ✅ **"Packaged" transaction**

9. **Payment**
   - Complete payment
   - ✅ **"Payment Settled" transaction**

10. **View Traceability**
    - Go to: `http://localhost:3000/trace/{LOT_NUMBER}`
    - See complete journey with all 15+ transactions
    - Verify chain integrity (all hashes match)

---

## 📱 Mobile/Consumer Access

### Scan QR Code Flow:
1. Consumer buys packaged product
2. Scans QR code on package
3. Opens trace page on mobile browser
4. Views:
   - Farmer who grew the crop
   - Farm location on map
   - FPO that procured it
   - Processing plant details
   - All quality checks
   - Complete timeline

**Trust Indicators:**
- ✅ Blockchain Verified badge
- Total transaction count
- Last updated timestamp
- Chain integrity status

---

## 🎨 UI Design Suggestions

### Lot Card Enhancement:
```tsx
<Card>
  <div className="flex justify-between items-start">
    <div>
      <h3>{lot.lot_number}</h3>
      <p>{lot.crop_type} - {lot.quantity_quintals}Q</p>
      
      {/* ADD THIS */}
      <VerifiedBadge transactionCount={lot.blockchain_transactions_count} />
    </div>
    
    <QRCodeDisplay lotNumber={lot.lot_number} />
  </div>
  
  {/* ADD THIS */}
  <button
    onClick={() => router.push(`/trace/${lot.lot_number}`)}
    className="w-full mt-4 btn-primary"
  >
    View Full Supply Chain Journey
  </button>
</Card>
```

---

## 🔗 API Endpoints for Frontend Integration

### Public Endpoints (No Auth):
```
GET /api/blockchain/trace/{lot_number}/
→ Returns complete journey with all transactions

GET /api/blockchain/verify/{lot_number}/
→ Verifies chain integrity

GET /api/blockchain/qr/{lot_number}/
→ Returns QR code image
```

### Authenticated Endpoints:
```
GET /api/blockchain/transactions/?lot_number={lot_number}
→ Get all transactions for a lot

GET /api/blockchain/traceability/{traceability_id}/verify_chain/
→ Verify blockchain chain integrity
```

---

## 🚀 Next Steps

1. **Test the backend first:**
   ```bash
   cd backend
   python manage.py migrate
   python manage.py runserver
   ```

2. **Create a test lot** via Django admin or API

3. **Access trace page:**
   ```
   http://localhost:3000/trace/SB2025042
   ```

4. **Add buttons to existing pages** (see checklist above)

5. **Test QR code generation** - should auto-generate for new lots

---

**🎯 Key Takeaway:** The trace page (`/trace/{lot_number}`) is the main UI for blockchain traceability. You just need to add buttons throughout the application to navigate there from various lot/product views.
