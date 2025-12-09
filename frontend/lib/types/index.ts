// User types
export interface User {
  id: string;
  phone_number: string;
  email?: string;
  role: 'farmer' | 'fpo' | 'processor' | 'retailer' | 'logistics' | 'warehouse' | 'government';
  is_verified: boolean;
  is_active: boolean;
  date_joined: string;
}

export interface UserProfile {
  user: User;
  full_name: string;
  profile_photo?: string;
  aadhaar_number?: string;
  pan_number?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

// Authentication types
export interface LoginRequest {
  phone_number: string;
  otp: string; // Backend uses OTP for login, not password
}

export interface RegisterRequest {
  phone_number: string;
  role: string;
  full_name?: string; // Optional in backend
}

export interface OTPRequest {
  phone_number: string;
  otp: string;
  purpose?: 'registration' | 'login' | 'password_reset';
}

// Bid Suggestion types
export interface BidSuggestion {
  should_bid: boolean;
  confidence_score: number;
  recommendation_reason: string;
  lot_id: string;
  lot_crop_type: string;
  lot_quantity_quintals: string | number;
  lot_expected_price_per_quintal: string | number;
  distance_km: number;
  travel_duration_minutes: number;
  distance_calculation_method: 'osrm' | 'estimated';
  recommended_vehicle_type: string;
  vehicle_capacity_tons: number;
  logistics_cost_breakdown: {
    transport_cost: number;
    loading_cost: number;
    unloading_cost: number;
    toll_cost: number;
    total_logistics_cost: number;
  };
  total_logistics_cost: string | number;
  lot_total_price: string | number;
  total_cost_with_logistics: string | number;
  expected_processing_revenue: string | number;
  expected_net_profit: string | number;
  roi_percentage: string | number;
  suggested_bid_min: string | number;
  suggested_bid_max: string | number;
  warnings: string[];
}

export interface VehicleType {
  type: string;
  label: string;
  capacity_tons: number;
  rate_per_km: number;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    user: User;
    tokens?: {
      access: string;
      refresh: string;
    };
    access?: string; // Backend might return tokens in different formats
    refresh?: string;
    user_id?: string;
    phone_number?: string;
    otp_expires_at?: string;
  };
}

// FPO types
export interface FPOProfile {
  id: string;
  organization_name: string;
  registration_number: string;
  total_members: number;
  primary_crops: string[];
  city: string;
  district?: string;
  state: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  verification_status?: 'pending' | 'approved' | 'rejected';
  is_verified: boolean;
  health_score?: number;
  created_at: string;
}

export interface FPOMembership {
  id: string;
  farmer: {
    id: string;
    full_name: string;
    phone_number: string;
  };
  fpo: string;
  joined_date: string;
  share_capital: number;
  is_active: boolean;
}

// Lot types
export interface ProcurementLot {
  id: string;
  lot_number: string;
  farmer: {
    id: string;
    full_name: string;
    phone_number: string;
  };
  crop_type: string;
  crop_type_display?: string;
  quantity_quintals: number;
  quality_grade: string;
  expected_price_per_quintal: number;
  harvest_date: string;
  status: 'available' | 'bidding' | 'sold' | 'delivered' | 'cancelled' | 'aggregated';
  description?: string;
  qr_code_url?: string;
  blockchain_tx_id?: string;
  created_at: string;
  images?: LotImage[];
  // Listing type for FPO aggregation
  listing_type?: 'individual' | 'fpo_managed' | 'fpo_aggregated';
  managed_by_fpo?: boolean;
  fpo_name?: string;
  farmer_name?: string;
  // Warehouse fields
  warehouse_id?: string;
  warehouse_name?: string;
  warehouse_code?: string;
  warehouse_district?: string;
  // Multi-warehouse aggregation
  source_warehouse_ids?: string[];
  source_warehouse_names?: string[];
}

export interface Warehouse {
  id: string;
  warehouse_name: string;
  name?: string;
  warehouse_code: string;
  warehouse_type: 'godown' | 'cold_storage' | 'warehouse' | 'shed';
  address: string;
  village?: string;
  district: string;
  state: string;
  pincode: string;
  capacity_quintals: number;
  current_stock_quintals: number;
  has_scientific_storage: boolean;
  has_pest_control: boolean;
  has_quality_testing_lab: boolean;
  is_active: boolean;
  created_at: string;
}

export interface LotImage {
  id: string;
  image: string;
  uploaded_at: string;
}

export interface CreateLotRequest {
  crop_type: string;
  quantity_quintals: number;
  quality_grade: string;
  expected_price_per_quintal: number;
  harvest_date: string;
  description?: string;
  location_latitude?: number;
  location_longitude?: number;
}

// Bid types
export interface Bid {
  id: string;
  lot: ProcurementLot;
  bidder_type: 'fpo' | 'processor';
  bidder_name: string;
  offered_price_per_quintal: number;
  quantity_quintals: number;
  payment_terms: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  message?: string;
  created_at: string;
}

export interface CreateBidRequest {
  lot_id: string;
  offered_price_per_quintal: number;
  quantity_quintals: number;
  payment_terms: string;
  message?: string;
}

// Blockchain types
export interface BlockchainTransaction {
  id: string;
  transaction_id: string;
  lot: string;
  action_type: string;
  actor_role: string;
  data_hash: string;
  previous_hash?: string;
  timestamp: string;
}

export interface TraceabilityRecord {
  lot: ProcurementLot;
  journey: TraceabilityEvent[];
  qr_code_data: string;
}

export interface TraceabilityEvent {
  stage: string;
  actor: string;
  location: string;
  timestamp: string;
  tx_id: string;
}

// Government Dashboard types
export interface NationalDashboardData {
  total_fpos: number;
  fpo_growth_percent?: number;
  total_production_mt: number;
  production_growth_percent?: number;
  total_market_value: number;
  avg_price_per_quintal?: number;
  active_states: number;
  crop_distribution?: CropDistribution[];
  import_dependency_percent?: number;
  post_harvest_loss_percent?: number;
  price_trends?: PriceTrend[];
  state_production?: StateProduction[];
}

export interface CropDistribution {
  crop_name: string;
  production_mt: number;
  percentage: number;
}

export interface PriceTrend {
  date: string;
  crop: string;
  price: number;
}

export interface StateProduction {
  state: string;
  production_mt: number;
  area_hectares: number;
}

export interface FPOHealthScore {
  fpo: FPOProfile;
  score: number;
  factors: {
    member_growth: number;
    procurement_volume: number;
    payment_timeliness: number;
    technology_adoption: number;
  };
  calculated_at: string;
}

// API Response types
export interface APIResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: {
    timestamp?: string;
    count?: number;
    next?: string;
    previous?: string;
    page?: number;
    page_size?: number;
  };
}

export interface PaginatedResponse<T> {
  status: 'success';
  data: {
    results: T[];
  };
  meta: {
    count: number;
    next: string | null;
    previous: string | null;
    page: number;
    page_size: number;
  };
}

// Notification types
export interface Notification {
  id: string;
  user: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

// Warehouse types
export interface Warehouse {
  id: string;
  name: string;
  address: string;
  capacity_quintals: number;
  current_stock_quintals: number;
  latitude: number;
  longitude: number;
}

// Payment types
export interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payment_method: string;
  transaction_id?: string;
  created_at: string;
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}
