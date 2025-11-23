import { UserRole, ApprovalStatus } from './common.types';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  approval_status: ApprovalStatus;
  is_active: boolean;
  phone_verified: boolean;
  email_verified: boolean;
  date_joined: string;
}

export interface OTPVerificationRequest {
  phone_number: string;
}

export interface OTPVerificationResponse {
  detail: string;
  phone_number: string;
  otp: string; // Remove in production
  expires_in: number;
}

export interface VerifyOTPRequest {
  phone_number: string;
  otp: string;
}

export interface VerifyOTPResponse {
  detail: string;
  verified: boolean;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  email: string;
  otp: string;
  new_password: string;
}