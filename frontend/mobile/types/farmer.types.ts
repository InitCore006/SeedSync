// ============================================================================
// FARMER TYPES
// ============================================================================

export type FarmerCategory = 'marginal' | 'small' | 'semi_medium' | 'medium' | 'large';
export type CasteCategory = 'general' | 'obc' | 'sc' | 'st';

export interface Farmer {
  id: string;
  user_id: string;
  farmer_id: string;
  
  // Land Details
  total_land_area: number;
  irrigated_land: number;
  rain_fed_land: number;
  
  // Categorization
  farmer_category: FarmerCategory;
  caste_category: CasteCategory;
  
  // FPO Membership
  is_fpo_member: boolean;
  primary_fpo: string | null;
  fpo_member_since: string | null;
  
  // Government Schemes
  has_kisan_credit_card: boolean;
  kcc_number: string;
  kcc_limit: number;
  kcc_expiry_date: string | null;
  
  has_pmfby_insurance: boolean;
  pmfby_policy_number: string;
  pmfby_sum_insured: number;
  
  has_pm_kisan: boolean;
  pm_kisan_status: string;
  
  // Farm Details
  primary_soil_type: string;
  secondary_soil_type: string;
  irrigation_method: string;
  water_source: string;
  
  // Farming Info
  farming_experience_years: number;
  primary_crops: string[];
  farming_type: 'organic' | 'conventional' | 'mixed';
  
  // Financial
  annual_income: number;
  credit_score: number;
  total_production: number;
  average_yield: number;
  
  // Status
  is_active: boolean;
  is_verified: boolean;
  verification_date: string | null;
  verified_by: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// FARMER WITH DETAILS (includes user and profile)
// ============================================================================

export interface FarmerWithDetails extends Farmer {
  user: {
    id: string;
    phone_number: string;
    email: string;
    full_name: string;
    role: string;
    is_phone_verified: boolean;
    is_email_verified: boolean;
    is_kyc_verified: boolean;
    preferred_language: string;
    date_joined: string;
    last_login: string;
  };
  profile: {
    date_of_birth: string | null;
    gender: 'M' | 'F' | 'O' | null;
    profile_picture: string | null;
    address_line1: string;
    address_line2: string;
    village: string;
    block: string;
    district: string;
    state: string;
    pincode: string;
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    account_holder_name: string;
    education_level: string;
    created_at: string;
    updated_at: string;
  };
}

// ============================================================================
// FARMER DASHBOARD
// ============================================================================

export interface FarmerDashboard {
  farmer: FarmerWithDetails;
  statistics: FarmerStatistics;
  recent_crops: CropSummary[];
  recent_transactions: TransactionSummary[];
  upcoming_activities: ActivitySummary[];
  weather: WeatherInfo | null;
  market_prices: MarketPrice[];
  notifications: NotificationSummary[];
}

export interface FarmerStatistics {
  total_crops: number;
  active_crops: number;
  completed_harvests: number;
  total_harvest_quantity: number;
  total_revenue: number;
  average_yield_per_acre: number;
  land_utilization_percentage: number;
  
  // Crop diversity
  unique_crops_grown: number;
  current_season_crops: number;
  
  // Financial
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  
  // Time-based
  crops_this_month: number;
  harvests_this_month: number;
  revenue_this_month: number;
}

export interface CropSummary {
  id: string;
  crop_name: string;
  crop_variety: string;
  plot_name: string;
  area: number;
  planting_date: string;
  expected_harvest_date: string;
  status: CropStatus;
  health_status: HealthStatus;
  growth_stage: string;
  days_to_harvest: number;
  image: string | null;
}

export type CropStatus = 
  | 'planned'
  | 'planted'
  | 'germinating'
  | 'growing'
  | 'flowering'
  | 'matured'
  | 'harvesting'
  | 'harvested'
  | 'failed';

export type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface TransactionSummary {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface ActivitySummary {
  id: string;
  title: string;
  description: string;
  activity_type: ActivityType;
  scheduled_date: string;
  crop_name: string | null;
  plot_name: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_completed: boolean;
  reminder_enabled: boolean;
}

export type ActivityType =
  | 'irrigation'
  | 'fertilizer'
  | 'pesticide'
  | 'weeding'
  | 'harvesting'
  | 'planting'
  | 'pruning'
  | 'other';

export interface WeatherInfo {
  location: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  forecast: DailyForecast[];
  updated_at: string;
}

export interface DailyForecast {
  date: string;
  temp_max: number;
  temp_min: number;
  description: string;
  icon: string;
  precipitation_probability: number;
  humidity: number;
}

export interface MarketPrice {
  id: string;
  commodity_name: string;
  variety: string;
  market_name: string;
  district: string;
  state: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  unit: string;
  date: string;
  price_change: number; // Percentage change from previous day
  trend: 'up' | 'down' | 'stable';
}

export interface NotificationSummary {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  created_at: string;
  action_url: string | null;
}

export type NotificationType =
  | 'crop_update'
  | 'weather_alert'
  | 'market_price'
  | 'fpo_announcement'
  | 'government_scheme'
  | 'payment'
  | 'reminder'
  | 'system';

// ============================================================================
// FARMER REGISTRATION
// ============================================================================

export interface FarmerRegistrationRequest {
  // User fields
  phone_number: string;
  password: string;
  password_confirm: string;
  full_name: string;
  email?: string;
  preferred_language?: string;
  
  // Profile fields
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'O';
  address_line1?: string;
  address_line2?: string;
  village?: string;
  block?: string;
  district: string;
  state: string;
  pincode: string;
  
  // Bank details (optional)
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  account_holder_name?: string;
  education_level?: string;
  
  // Farmer fields
  total_land_area: number;
  irrigated_land?: number;
  rain_fed_land?: number;
  farmer_category?: FarmerCategory;
  caste_category?: CasteCategory;
  
  // Government schemes (optional)
  has_kisan_credit_card?: boolean;
  kcc_number?: string;
  has_pmfby_insurance?: boolean;
  pmfby_policy_number?: string;
  has_pm_kisan?: boolean;
}

export interface FarmerRegistrationResponse {
  message: string;
  farmer: FarmerWithDetails;
  tokens: {
    access: string;
    refresh: string;
  };
}

// ============================================================================
// FARMER UPDATE
// ============================================================================

export interface UpdateFarmerRequest {
  // Land details
  total_land_area?: number;
  irrigated_land?: number;
  rain_fed_land?: number;
  
  // Categorization
  farmer_category?: FarmerCategory;
  caste_category?: CasteCategory;
  
  // Government schemes
  has_kisan_credit_card?: boolean;
  kcc_number?: string;
  kcc_limit?: number;
  kcc_expiry_date?: string;
  
  has_pmfby_insurance?: boolean;
  pmfby_policy_number?: string;
  pmfby_sum_insured?: number;
  
  has_pm_kisan?: boolean;
  pm_kisan_status?: string;
  
  // Farm details
  primary_soil_type?: string;
  secondary_soil_type?: string;
  irrigation_method?: string;
  water_source?: string;
  
  // Farming info
  farming_experience_years?: number;
  primary_crops?: string[];
  farming_type?: 'organic' | 'conventional' | 'mixed';
  
  // Financial
  annual_income?: number;
}

// ============================================================================
// FARMER FILTERS & SEARCH
// ============================================================================

export interface FarmerFilters {
  state?: string;
  district?: string;
  village?: string;
  farmer_category?: FarmerCategory;
  caste_category?: CasteCategory;
  is_fpo_member?: boolean;
  is_verified?: boolean;
  has_kcc?: boolean;
  has_pmfby?: boolean;
  min_land_area?: number;
  max_land_area?: number;
  search?: string;
}

export interface FarmerListItem {
  id: string;
  farmer_id: string;
  full_name: string;
  phone_number: string;
  village: string;
  district: string;
  state: string;
  total_land_area: number;
  farmer_category: FarmerCategory;
  is_fpo_member: boolean;
  is_verified: boolean;
  profile_picture: string | null;
  created_at: string;
}

// ============================================================================
// FARMER VERIFICATION
// ============================================================================

export interface FarmerVerificationRequest {
  farmer_id: string;
  verification_status: boolean;
  verification_notes?: string;
  documents_verified: string[];
}

export interface FarmerVerificationResponse {
  message: string;
  farmer: FarmerWithDetails;
  verification_date: string;
  verified_by: string;
}

// ============================================================================
// FARMER STATISTICS
// ============================================================================

export interface FarmerStatsRequest {
  start_date?: string;
  end_date?: string;
  crop_id?: string;
  comparison?: 'previous_period' | 'last_year' | 'none';
}

export interface FarmerPerformanceMetrics {
  productivity_score: number;
  efficiency_score: number;
  financial_health_score: number;
  sustainability_score: number;
  overall_score: number;
  
  metrics: {
    yield_per_acre: number;
    cost_per_unit: number;
    profit_margin: number;
    land_utilization: number;
    crop_diversity: number;
    water_efficiency: number;
  };
  
  comparison: {
    district_average: number;
    state_average: number;
    national_average: number;
    percentile: number;
  };
  
  recommendations: string[];
}

// ============================================================================
// FARMER DOCUMENTS
// ============================================================================

export interface FarmerDocument {
  id: string;
  farmer_id: string;
  document_type: FarmerDocumentType;
  document_number: string;
  document_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  is_verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_note: string | null;
  uploaded_at: string;
  verified_at: string | null;
  expiry_date: string | null;
}

export type FarmerDocumentType =
  | 'aadhar'
  | 'pan'
  | 'land_ownership'
  | 'land_lease'
  | 'bank_passbook'
  | 'kcc_card'
  | 'pmfby_policy'
  | 'ration_card'
  | 'farmer_id'
  | '7_12_extract'
  | '8a_document'
  | 'fmb_sketch'
  | 'other';

