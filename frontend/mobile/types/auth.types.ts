export interface User {

  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  role: 'FARMER' | 'FPO' | 'PROCESSOR' | 'RETAILER' | 'LOGISTICS' | 'WAREHOUSE' | 'GOVERNMENT';
  role_display: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  is_approved: boolean;
  phone_verified: boolean;
  email_verified: boolean;
  preferred_language: string;
  profile_picture: string | null;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  login_count: number;
  
  // Farmer-specific fields
  farmer_id?: string;
  profile_completed?: boolean;
  profile_completion_percentage?: number;
  location?: string;
}

export interface LoginRequest {
  phone_number?: string;  // Make optional
  username?: string;       // Make optional
  password: string;
}

export interface LoginResponse {
  access: string;         // Changed from tokens.access
  refresh: string;        // Changed from tokens.refresh
  user: User;
  farmer_profile?: {
    farmer_id: string;
    profile_completed: boolean;
    profile_completion_percentage: number;
  };
  redirect_to?: string;
}

// ============================================================================
// UNIFIED OTP SYSTEM
// ============================================================================

export interface SendOTPRequest {
  phone_number: string;
  purpose: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET' | 'PHONE_VERIFICATION';
}

export interface SendOTPResponse {
  detail: string;
  phone_number: string;
  purpose: string;
  otp?: string; // Only in development
  expires_in: number;
  message: string;
}

export interface VerifyOTPRequest {
  phone_number: string;
  otp: string;
  purpose: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET' | 'PHONE_VERIFICATION';
}

export interface VerifyOTPResponse {
  detail: string;
  verified: boolean;
  phone_number: string;
  purpose: string;
  next_step?: string;
  message?: string;
}

// Verify Phone (Registration specific)
export interface VerifyPhoneRequest {
  phone_number: string;
}

export interface VerifyPhoneResponse {
  detail: string;
  phone_number: string;
  otp?: string; // Only in development
  expires_in: number;
  message: string;
}

export interface VerifyPhoneOTPRequest {
  phone_number: string;
  otp: string;
}

export interface VerifyPhoneOTPResponse {
  detail: string;
  verified: boolean;
  phone_number: string;
  next_step: string;
  message: string;
}

// ============================================================================
// PASSWORD MANAGEMENT
// ============================================================================

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface PasswordResetRequest {
  phone_number: string;
}

export interface PasswordResetConfirm {
  phone_number: string;
  otp: string;
  new_password: string;
  new_password_confirm: string;
}

// ============================================================================
// FARMER REGISTRATION
// ============================================================================

export interface FarmerRegistrationStep1 {
  phone_number: string;
  first_name: string;
  last_name?: string;
  father_husband_name: string;
  date_of_birth?: string;
  gender: 'M' | 'F' | 'O';
  email?: string;
}

export interface FarmerRegistrationStep2 {
  village: string;
  district: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  total_land_area: number;
  primary_crops: string[];
  expected_annual_production: number;
}

export interface FarmerRegistrationStep3 {
  bank_account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
  branch_name?: string;
  account_holder_name?: string;
  upi_id?: string;
  password: string;
  password_confirm: string;
}

export interface RegistrationProgressResponse {
  phone_verified: boolean;
  step1_completed: boolean;
  step2_completed: boolean;
  current_step: number;
  step1_data: FarmerRegistrationStep1 | null;
  step2_data: FarmerRegistrationStep2 | null;
}