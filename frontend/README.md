# SeedSync Frontend - Smart India Hackathon 2025

Modern Next.js web application for the **Indian Oilseed Value Chain Platform** built for Smart India Hackathon 2025.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Custom SeedSync theme)
- **Data Fetching**: SWR (Stale-While-Revalidate)
- **HTTP Client**: Axios with JWT auto-refresh
- **State Management**: Zustand
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Charts**: Recharts

## 🎨 Brand Colors

- Primary: `#437409` (Dark Green)
- Primary Dark: `#438602`
- Primary Light: `#c8e686`

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── verify-otp/               # OTP verification
│   ├── fpo/dashboard/            # FPO dashboard
│   ├── processor/dashboard/      # Processor dashboard
│   ├── government/dashboard/     # Government national dashboard (Judge Magnet)
│   └── unauthorized/             # Access denied page
├── components/
│   ├── layout/                   # Layout components
│   │   ├── DashboardLayout.tsx   # Main dashboard wrapper
│   │   ├── Navbar.tsx            # Top navigation
│   │   ├── Sidebar.tsx           # Side navigation (role-based)
│   │   └── ProtectedRoute.tsx    # Route protection HOC
│   └── ui/                       # Reusable UI components (9 components)
├── lib/
│   ├── api/                      # 70+ API endpoints
│   ├── hooks/                    # 20+ custom SWR hooks
│   ├── stores/                   # Zustand auth store
│   ├── utils/                    # 20+ utility functions
│   ├── constants.ts              # App-wide constants
│   └── types/                    # TypeScript definitions
└── tailwind.config.ts
```

## 🔑 Key Features

### 🎯 Government Dashboard (Judge Magnet)
- **National KPIs**: Active FPOs, Total Production, Market Value, Active States
- **State-wise Heatmap**: Color-coded production intensity grid
- **Top 10 States**: Ranked with animated progress bars
- **Crop Distribution**: Visual breakdown of all oilseeds
- **Auto-refresh**: Real-time updates every 60 seconds

### 👥 FPO Dashboard
- Verification status tracking
- Member management (total count + growth)
- Active procurement lots
- Pending bid notifications
- Warehouse stock monitoring
- Revenue analytics

### 🏭 Processor Dashboard
- Active bids overview
- Processing batch tracking
- Inventory management (raw + finished)
- Production statistics (yield, quality)
- Monthly revenue trends

## 🛠️ Quick Start

```powershell
# Install dependencies
npm install --legacy-peer-deps

# Create environment file
cp .env.example .env.local

# Start dev server
npm run dev
```

Visit `http://localhost:3000`

## 📱 User Flows

### Registration
1. `/register` → Enter phone (10 digits: 9137966960), role, name
2. System auto-adds +91 prefix internally
3. OTP sent automatically
4. `/verify-otp` → Enter 6-digit OTP
5. Auto-redirect to role-based dashboard

### Login
1. `/login` → Enter phone number (10 digits only, no +91 needed)
2. System sends OTP to registered number
3. `/verify-otp` → Enter 6-digit OTP
4. JWT tokens stored securely
5. Redirect: FPO → `/fpo/dashboard`, Processor → `/processor/dashboard`, Gov → `/government/dashboard`

**Important**: Users only need to enter **10 digits** (e.g., 9137966960). The system automatically handles the +91 country code internally.

## 🔐 Security

- JWT access + refresh tokens
- Auto token refresh on 401
- Role-based access control
- Phone validation (Indian numbers only)
- Protected routes with HOC

## 📚 Built Files (30+ files)

### Core Infrastructure
✅ Complete TypeScript types (270 lines)  
✅ 70+ API endpoints organized by domain  
✅ Axios client with JWT interceptors  
✅ 20+ SWR hooks with caching  
✅ 20+ utility functions  
✅ Auth store with persistence  

### UI Components (9)
✅ Button, Input, Card, Badge, Loading, Alert, Select, Modal, Table

### Pages
✅ Login, Register, OTP Verification  
✅ FPO Dashboard  
✅ Processor Dashboard  
✅ Government Dashboard (Heatmap + National KPIs)  
✅ Unauthorized page  

## 🎨 Component Examples

```typescript
// Button variants
<Button variant="primary" size="lg" isLoading={loading}>
  Submit
</Button>

// Status badge with auto-color
<Badge variant="status" status="approved">Approved</Badge>

// Card layout
<Card>
  <CardHeader><CardTitle>Stats</CardTitle></CardHeader>
  <CardContent>Content here</CardContent>
</Card>

// SWR hook usage
const { dashboard, isLoading, isError } = useFPODashboard();
```

## 🔮 Next Steps (Not Yet Built)

- [ ] FPO members list/management
- [ ] Procurement lot creation form
- [ ] Bid management interface
- [ ] Warehouse inventory pages
- [ ] Blockchain traceability viewer
- [ ] Marketplace features
- [ ] Payment integration
- [ ] Notification center
- [ ] Reports & analytics pages

## 📝 Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_APP_NAME=SeedSync
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🐛 Notes

- Use `--legacy-peer-deps` for React 19 compatibility
- Backend Django API must be running on `http://127.0.0.1:8000`
- Phone numbers: 10 digits starting with 6, 7, 8, or 9

---

**Built for Smart India Hackathon 2025** 🇮🇳
