// ============================================================================
// USER & PROFILE TYPES (Aligned with Backend)
// ============================================================================

export interface User {
  id: string;
  phone_number: string;
  full_name: string;
  email?: string;
  role: 'farmer' | 'fpo' | 'processor' | 'buyer' | 'admin';
  is_active: boolean;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  is_kyc_verified: boolean;
  preferred_language: string;
  date_joined: string;
  last_login: string | null;
}

export interface UserProfile {
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
}

export interface Farmer {
  id: string;
  user: string; // User ID
  farmer_id: string;
  total_land_area: number;
  irrigated_land: number;
  rain_fed_land: number;
  farmer_category: 'marginal' | 'small' | 'semi_medium' | 'medium' | 'large';
  caste_category: 'general' | 'obc' | 'sc' | 'st';
  has_kisan_credit_card: boolean;
  kcc_number: string;
  has_pmfby_insurance: boolean;
  pmfby_policy_number: string;
  has_pm_kisan: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithProfile extends User {
  profile: UserProfile;
}

export interface FarmerWithDetails extends Farmer {
  user_details: User;
  profile_details: UserProfile;
}

// ============================================================================
// AUTH REQUEST/RESPONSE TYPES
// ============================================================================

export interface LoginRequest {
  phone_number: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
  message: string;
}

export interface RegisterRequest {
  phone_number: string;
  password: string;
  password_confirm: string;
  full_name: string;
  email?: string;
  role: 'farmer' | 'fpo' | 'processor' | 'buyer';
  preferred_language?: string;
}

export interface RegisterResponse {
  user: User;
  message: string;
}

// ============================================================================
// OTP VERIFICATION
// ============================================================================

export interface SendOTPRequest {
  phone_number: string;
}

export interface SendOTPResponse {
  message: string;
  otp?: string; // Only in development mode
}

export interface VerifyOTPRequest {
  phone_number: string;
  otp: string;
}

export interface VerifyOTPResponse {
  message: string;
  verified: boolean;
}

// ============================================================================
// FARMER REGISTRATION (Complete)
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
  farmer_category?: 'marginal' | 'small' | 'semi_medium' | 'medium' | 'large';
  caste_category?: 'general' | 'obc' | 'sc' | 'st';
  
  // Government schemes (optional)
  has_kisan_credit_card?: boolean;
  kcc_number?: string;
  has_pmfby_insurance?: boolean;
  pmfby_policy_number?: string;
  has_pm_kisan?: boolean;
}

export interface FarmerRegistrationResponse {
  message: string;
  farmer_id: string;
  user: {
    id: string;
    phone_number: string;
    full_name: string;
    role: string;
  };
  tokens: {
    access: string;
    refresh: string;
  };
}

// ============================================================================
// PASSWORD MANAGEMENT
// ============================================================================

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface ForgotPasswordRequest {
  phone_number: string;
}

export interface ResetPasswordRequest {
  phone_number: string;
  otp: string;
  new_password: string;
  new_password_confirm: string;
}

export interface PasswordResetResponse {
  message: string;
}

// ============================================================================
// USER UPDATE
// ============================================================================

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  preferred_language?: string;
}

export interface UpdateProfileRequest {
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'O';
  address_line1?: string;
  address_line2?: string;
  village?: string;
  block?: string;
  district?: string;
  state?: string;
  pincode?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  account_holder_name?: string;
  education_level?: string;
}

export interface UpdateFarmerRequest {
  total_land_area?: number;
  irrigated_land?: number;
  rain_fed_land?: number;
  farmer_category?: 'marginal' | 'small' | 'semi_medium' | 'medium' | 'large';
  caste_category?: 'general' | 'obc' | 'sc' | 'st';
  has_kisan_credit_card?: boolean;
  kcc_number?: string;
  has_pmfby_insurance?: boolean;
  pmfby_policy_number?: string;
  has_pm_kisan?: boolean;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface FarmerDashboard {
  farmer: FarmerWithDetails;
  statistics: {
    total_plots: number;
    total_area: number;
    active_crops: number;
    total_harvest: number;
    total_income: number;
  };
  recent_activities: any[];
  upcoming_tasks: any[];
}