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
  quantity_quintals: number;
  quality_grade: string;
  expected_price_per_quintal: number;
  harvest_date: string;
  status: 'available' | 'bidding' | 'sold' | 'delivered' | 'cancelled';
  description?: string;
  qr_code_url?: string;
  blockchain_tx_id?: string;
  created_at: string;
  images?: LotImage[];
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
