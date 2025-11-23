import { ApprovalStatus, Location, FileUpload } from './common.types';

// ============================================================================
// FARMER REGISTRATION
// ============================================================================

export interface FarmerRegistrationStep1 {
  first_name: string;
  last_name?: string;
  father_husband_name: string;
  date_of_birth: string; // YYYY-MM-DD
  gender: 'M' | 'F' | 'O';
  phone_number: string;
}

export interface FarmerRegistrationStep2 {
  total_land_area: number;
  village: string;
  block?: string;
  district: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  crops_grown: string[];
  expected_annual_production: number;
  has_storage: boolean;
  storage_capacity?: number;
}

export interface FarmerRegistrationStep3 {
  bank_account_number: string;
  ifsc_code: string;
  bank_name?: string;
  branch_name?: string;
  upi_id?: string;
  aadhaar_number?: string;
  password: string;
  password_confirm: string;
}

export interface FarmerRegistrationResponse {
  detail: string;
  user_id: string;
  farmer_id: string;
  approval_status: ApprovalStatus;
  message: string;
  tokens: {
    refresh: string;
    access: string;
  };
  user: {
    id: string;
    username: string;
    full_name: string;
    phone_number: string;
    role: 'FARMER';
    farmer_id: string;
  };
  redirect_to: string;
}

// ============================================================================
// FARMER PROFILE
// ============================================================================

export interface FarmerProfile {
  id: string;
  user: string;
  farmer_id: string;
  father_husband_name: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'O';
  total_land_area: number;
  village: string;
  block: string;
  district: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  crops_grown: string[];
  expected_annual_production: number;
  has_storage: boolean;
  storage_capacity: number;
  bank_account_number: string;
  ifsc_code: string;
  bank_name: string;
  branch_name: string;
  upi_id: string;
  aadhaar_verified: boolean;
  land_records_uploaded: boolean;
  credit_score: number;
  performance_rating: number;
  total_transactions: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// LOT (PRODUCE LISTING)
// ============================================================================

export type LotStatus = 'DRAFT' | 'ACTIVE' | 'SOLD' | 'EXPIRED' | 'CANCELLED';

export interface CreateLotStep1 {
  crop_type: string;
  variety: string;
  quantity: number;
  quality_grade: 'A+' | 'A' | 'B' | 'C';
  description?: string;
  images?: FileUpload[];
}

export interface CreateLotStep2 {
  moisture_content?: number;
  oil_content?: number;
  foreign_matter?: number;
  damaged_seeds?: number;
  quality_certificate?: FileUpload;
}

export interface CreateLotStep3 {
  reserve_price: number;
  pickup_location: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  available_from: string;
  available_to: string;
  packaging_type: 'jute_bags' | 'plastic_bags' | 'bulk';
}

export interface Lot {
  id: string;
  lot_number: string;
  farmer: string;
  farmer_name: string;
  crop_type: string;
  variety: string;
  quantity: number;
  quality_grade: string;
  moisture_content?: number;
  oil_content?: number;
  foreign_matter?: number;
  damaged_seeds?: number;
  reserve_price: number;
  pickup_location: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  available_from: string;
  available_to: string;
  packaging_type: string;
  status: LotStatus;
  description?: string;
  images: string[];
  quality_certificate?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// MARKET PRICES
// ============================================================================

export interface MarketPrice {
  id: string;
  crop_type: string;
  variety: string;
  market_location: string;
  state: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  price_date: string;
  trend: 'up' | 'down' | 'stable';
  change_percentage: number;
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Transaction {
  id: string;
  transaction_id: string;
  order: string;
  lot: Lot;
  buyer_name: string;
  amount: number;
  platform_fee: number;
  tax: number;
  net_amount: number;
  payment_method: string;
  payment_status: TransactionStatus;
  utr_number?: string;
  payment_date?: string;
  created_at: string;
}

// ============================================================================
// NEARBY FPO
// ============================================================================

export interface NearbyFPO {
  id: string;
  organization_name: string;
  contact_person: string;
  phone_number: string;
  office_address: string;
  total_members: number;
  primary_oilseeds: string[];
  distance?: number; // in km
}

// ============================================================================
// WAREHOUSE BOOKING
// ============================================================================

export interface AvailableWarehouse {
  id: string;
  name: string;
  location: string;
  state: string;
  district: string;
  capacity: number;
  available_capacity: number;
  storage_type: string[];
  price_per_quintal: number;
  latitude?: number;
  longitude?: number;
  distance?: number;
  facilities: string[];
}

export interface WarehouseBooking {
  id: string;
  warehouse: AvailableWarehouse;
  farmer: string;
  crop_type: string;
  quantity: number;
  start_date: string;
  end_date: string;
  total_cost: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';
  created_at: string;
}

// ============================================================================
// TRANSPORT
// ============================================================================

export interface TransportRequest {
  id: string;
  farmer: string;
  pickup_location: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  delivery_location: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  crop_type: string;
  quantity: number;
  preferred_date: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  vehicle_assigned?: string;
  driver_name?: string;
  driver_phone?: string;
  estimated_cost?: number;
  created_at: string;
}

// ============================================================================
// TRACEABILITY
// ============================================================================

export interface TraceabilityRecord {
  id: string;
  qr_code: string;
  lot: Lot;
  batch_number: string;
  origin_farm: string;
  current_location: string;
  status: string;
  timeline: TraceabilityEvent[];
  created_at: string;
}

export interface TraceabilityEvent {
  id: string;
  event_type: string;
  location: string;
  actor: string;
  timestamp: string;
  notes?: string;
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export interface FarmerDashboardStats {
  total_lots: number;
  active_lots: number;
  sold_lots: number;
  total_earnings: number;
  pending_payments: number;
  this_month_earnings: number;
  avg_price_per_quintal: number;
  total_quantity_sold: number;
}