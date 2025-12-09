// ============================================
// USER & AUTH TYPES
// ============================================

export interface User {
  id: string;
  phone_number: string;
  email?: string;
  role: 'farmer' | 'fpo' | 'processor' | 'retailer' | 'logistics' | 'warehouse' | 'government';
  role_display: string;
  is_verified: boolean;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
  profile?: {
    full_name: string;
    profile_photo?: string;
    address?: string;
    city?: string;
    state?: string;
    fpo_membership?: {
      fpo_id: number;
      fpo_name: string;
      joined_date: string;
      status: string;
      warehouse_name?: string;
    };
  };
}

export interface UserProfile extends User {
  email?: string;
  address?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface LoginCredentials {
  phone_number: string;
  otp: string;
}

export interface RegisterData {
  phone_number: string;
  role: 'farmer' | 'fpo' | 'processor' | 'retailer' | 'logistics' | 'warehouse' | 'government';
}

export interface UserProfileCreateData {
  full_name: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

// ============================================
// BID SUGGESTION TYPES
// ============================================

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

// ============================================
// FARMER PROFILE TYPES
// ============================================

export interface FarmerProfile {
  id: number;
  user: User;
  fpo?: number;
  fpo_name?: string;
  fpo_membership?: {
    fpo_id: number;
    fpo_name: string;
    joined_date: string;
    status: string;
    warehouse_name?: string;
  };
  full_name: string;
  father_name?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  profile_photo?: string;
  total_land_acres: number;
  farming_experience_years: number;
  primary_crops: string[];
  aadhaar_number?: string;
  pan_number?: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  kyc_documents?: Record<string, string>;
  bank_account_number?: string;
  bank_account_holder_name?: string;
  ifsc_code?: string;
  bank_name?: string;
  bank_branch?: string;
  village?: string;
  tehsil?: string;
  district: string;
  state: string;
  state_display?: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  total_lots_created: number;
  total_quantity_sold_quintals: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface FarmerProfileCreateData {
  full_name: string;
  father_name?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  total_land_acres: number;
  farming_experience_years?: number;
  primary_crops?: string[];
  village?: string;
  post_office?: string;
  tehsil?: string;
  district: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  // Bank Details
  bank_account_number?: string;
  bank_account_holder_name?: string;
  ifsc_code?: string;
  bank_name?: string;
  bank_branch?: string;
  // KYC Details
  aadhaar_number?: string;
  pan_number?: string;
  // Preferences
  preferred_language?: 'en' | 'hi';
}

// ============================================
// LOT TYPES
// ============================================

export interface LotImage {
  id: number;
  image: string;
  caption?: string;
  uploaded_at: string;
}

export interface ProcurementLot {
  id: string; // UUID from backend
  lot_number: string;
  farmer: string;
  farmer_name?: string;
  fpo?: string;
  fpo_name?: string;
  managed_by_fpo?: boolean;
  listing_type?: 'individual' | 'fpo_managed' | 'fpo_aggregated';
  warehouse?: string;
  warehouse_name?: string;
  warehouse_code?: string;
  warehouse_district?: string;
  source_warehouse_ids?: string[];
  source_warehouse_names?: string[];
  crop_type: 'soybean' | 'mustard' | 'groundnut' | 'sunflower' | 'safflower' | 'sesame' | 'linseed' | 'niger';
  crop_type_display?: string;
  crop_master_code?: string;
  crop_variety?: string;
  crop_variety_code?: string;
  quantity_quintals: number;
  available_quantity_quintals?: number;
  quality_grade: 'A+' | 'A' | 'B' | 'C';
  quality_grade_display?: string;
  expected_price_per_quintal: number;
  final_price_per_quintal?: number;
  harvest_date: string;
  moisture_content?: number;
  oil_content?: number;
  description?: string;
  storage_conditions?: string;
  organic_certified: boolean;
  location_latitude?: number;
  location_longitude?: number;
  pickup_address?: string;
  status: 'available' | 'bidding' | 'sold' | 'delivered';
  status_display?: string;
  bid_count?: number;
  view_count?: number;
  qr_code_url?: string;
  blockchain_tx_id?: string;
  blockchain_hash?: string;
  images?: LotImage[];
  status_history?: any[];
  created_at: string;
  updated_at: string;
}

export interface LotCreateData {
  crop_type: string;
  crop_master_code?: string;
  crop_variety?: string;
  crop_variety_code?: string;
  harvest_date: string;
  quantity_quintals: number;
  quality_grade: string;
  expected_price_per_quintal: number;
  moisture_content?: number;
  oil_content?: number;
  description?: string;
  storage_conditions?: string;
  organic_certified?: boolean;
  pickup_address?: string;
}

// ============================================
// BID TYPES
// ============================================

export interface Bid {
  id: number;
  lot: string; // UUID
  lot_number?: string;
  lot_details?: {
    crop_type: string;
    quantity_quintals: number;
    quality_grade: string;
  };
  bidder: number;
  bidder_name?: string;
  bidder_type?: 'fpo' | 'processor' | 'retailer';
  bidder_profile_photo?: string;
  bidder_contact_info?: string;
  offered_price_per_quintal: number;
  quantity_quintals: number;
  total_amount: number;
  payment_terms: 'immediate' | '7_days' | '15_days' | '30_days';
  payment_terms_display?: string;
  expected_pickup_date?: string;
  advance_payment_percentage?: number;
  message?: string;
  farmer_response?: string;
  status: 'pending' | 'accepted' | 'rejected';
  status_display?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface BidCreateData {
  lot: string; // UUID
  offered_price_per_quintal: number;
  quantity_quintals: number;
  payment_terms?: string;
  expected_pickup_date?: string;
  advance_payment_percentage?: number;
  message?: string;
}

export interface MyBidsResponse {
  received: Bid[];
  sent: Bid[];
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface Payment {
  id: number;
  payment_id: string;
  lot: number;
  lot_number?: string;
  bid: number;
  payer: number;
  payer_name?: string;
  payee: number;
  payee_name?: string;
  gross_amount: number;
  commission_percentage: number;
  commission_amount: number;
  tax_amount: number;
  net_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  status_display?: string;
  payment_method: 'bank_transfer' | 'upi' | 'razorpay';
  payment_method_display?: string;
  gateway_transaction_id?: string;
  receipt_url?: string;
  expected_date?: string;
  completed_at?: string;
  initiated_at: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// MARKET & WEATHER TYPES
// ============================================

export interface MandiPrice {
  id: number;
  crop_type: string;
  state: string;
  district: string;
  market_name: string;
  date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  arrival_quantity_quintals: number;
}

export interface MSPRecord {
  id: number;
  crop_type: string;
  year: string;
  season: 'kharif' | 'rabi';
  msp_per_quintal: number;
  bonus_per_quintal: number;
  effective_from: string;
}

export interface WeatherData {
  date: string;
  temperature_min: number;
  temperature_max: number;
  humidity: number;
  rainfall_probability: number;
  wind_speed: number;
  weather_condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  icon: string;
}

export interface WeatherAlert {
  alert_type: 'warning' | 'severe' | 'advisory';
  title: string;
  message: string;
  issued_at: string;
  valid_until: string;
}

export interface CropAdvisory {
  crop_type: string;
  advisory_title: string;
  advisory_message: string;
  action_required: string;
  issued_date: string;
  source: string;
}

// ============================================
// AI TYPES
// ============================================

export interface DiseaseDetection {
  id: number;
  farmer: number;
  crop_type: string;
  uploaded_image: string;
  detected_disease: string;
  confidence_score: number;
  treatment_recommendation: string;
  detected_at: string;
}

export interface DiseaseDetectionResult {
  detected_disease: string;
  confidence_score: number;
  treatment_recommendation: string;
  symptoms_description: string;
  causes: string;
  treatment_steps: string[];
  recommended_pesticides: string[];
  organic_alternatives: string[];
  prevention_tips: string[];
  uploaded_image_url: string;
  detected_at: string;
}

// ============================================
// FPO TYPES
// ============================================

export interface FPOProfile {
  id: number;
  organization_name: string;
  registration_number: string;
  year_of_registration: number;
  district: string;
  state: string;
  state_display?: string;
  office_address: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  total_members: number;
  primary_crops: string[];
  contact_person_name: string;
  phone_number: string;
  email?: string;
  logo?: string;
  chairman_name?: string;
  ceo_name?: string;
  services_offered: string[];
  is_verified: boolean;
  created_at: string;
}

// ============================================
// LOGISTICS TYPES
// ============================================

export interface LogisticsPartner {
  id: number;
  user: User;
  company_name: string;
  contact_person: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  state_display?: string;
  is_verified: boolean;
  vehicles: Vehicle[];
  total_vehicles: number;
  total_shipments: number;
  created_at: string;
  updated_at: string;
}

export interface LogisticsPartnerCreateData {
  company_name: string;
  contact_person: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
}

export interface Vehicle {
  id: number;
  logistics_partner: number;
  vehicle_number: string;
  vehicle_type: string;
  vehicle_type_display?: string;
  capacity_quintals: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleCreateData {
  vehicle_number: string;
  vehicle_type: string;
  capacity_quintals: number;
}

export interface Shipment {
  id: number;
  logistics_partner: number;
  logistics_partner_name?: string;
  lot: number;
  lot_number?: string;
  lot_details?: {
    crop_type: string;
    quantity_quintals: number;
  };
  vehicle?: number;
  vehicle_number?: string;
  status: 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';
  status_display?: string;
  pickup_location: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  delivery_location: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  scheduled_pickup_date?: string;
  scheduled_delivery_date?: string;
  actual_pickup_date?: string;
  actual_delivery_date?: string;
  distance_km?: number;
  farmer_name?: string;
  farmer_phone?: string;
  receiver_name?: string;
  receiver_phone?: string;
  special_instructions?: string;
  pickup_photo?: string;
  pickup_signature?: string;
  delivery_photo?: string;
  delivery_signature?: string;
  actual_quantity_received_quintals?: number;
  quality_check_notes?: string;
  issue_reported?: string;
  created_at: string;
  updated_at: string;
}

export interface ShipmentCreateData {
  lot: number;
  pickup_location: string;
  delivery_location: string;
  scheduled_pickup_date?: string;
  scheduled_delivery_date?: string;
  special_instructions?: string;
}

export interface ShipmentUpdateStatus {
  status: string;
  actual_pickup_date?: string;
  actual_delivery_date?: string;
  pickup_photo?: string;
  pickup_signature?: string;
  delivery_photo?: string;
  delivery_signature?: string;
  actual_quantity_received_quintals?: number;
  quality_check_notes?: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  id: number;
  user: number;
  type: 'new_bid' | 'payment_completed' | 'weather_alert' | 'price_alert' | 'bid_update' | 'new_booking' | 'trip_reminder' | 'trip_cancelled' | 'payment_received';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

// ============================================
// BLOCKCHAIN TYPES
// ============================================

export interface BlockchainTransaction {
  id: number;
  lot: number;
  transaction_type: 'created' | 'procured' | 'shipped' | 'received' | 'processed';
  actor: number;
  actor_name: string;
  actor_role: string;
  location?: string;
  transaction_id: string;
  created_at: string;
}

export interface TraceabilityData {
  lot_number: string;
  qr_code_url: string;
  timeline: BlockchainTransaction[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  error: string;
  details?: any;
}

export interface ApiSuccess<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
