export interface User {
  id: string;
  phone_number: string;
  full_name: string;
  email?: string;
  role: 'farmer' | 'fpo' | 'processor' | 'buyer' | 'admin';
  is_active: boolean;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  preferred_language: string;
  date_joined: string;
  last_login: string | null;
}

export interface UserProfile {
  id: string;
  user: string;
  date_of_birth: string | null;
  gender: 'M' | 'F' | 'O' | null;
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
}

export interface Farmer {
  id: string;
  user: string;
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

// ============================================================================
// LOGIN
// ============================================================================

export interface LoginRequest {
  phone_number: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
  message: string;
}

// ============================================================================
// PHONE VERIFICATION (No OTP Model - Uses Cache)
// ============================================================================

export interface SendOTPRequest {
  phone_number: string;
}

export interface SendOTPResponse {
  message: string;
  otp?: string; // Only in development
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
// FARMER REGISTRATION (Single Step)
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
    refresh: string;
    access: string;
  };
}

// ============================================================================
// PASSWORD RESET
// ============================================================================

export interface PasswordResetRequest {
  phone_number: string;
}

export interface PasswordResetConfirm {
  phone_number: string;
  otp: string;
  new_password: string;
  new_password_confirm: string;
}

export interface PasswordResetResponse {
  message: string;
}

// ============================================================================
// CHANGE PASSWORD
// ============================================================================

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}