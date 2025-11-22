/* eslint-disable @typescript-eslint/no-explicit-any */
export type UserRole = 'FARMER' | 'FPO' | 'PROCESSOR' | 'RETAILER' | 'LOGISTICS' | 'GOVERNMENT'

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export interface User {
  data(data: any): unknown
  id: string
  username: string
  email: string
  phone_number: string
  first_name: string
  last_name: string
  full_name: string
  role: UserRole
  role_display: string
  approval_status: ApprovalStatus
  is_approved: boolean
  phone_verified: boolean
  email_verified: boolean
  preferred_language: string
  profile_picture: string | null
  date_joined: string
  last_login: string | null
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  data: { access: any; refresh: any; user: any }
  access: string
  refresh: string
  user: User
  redirect_to: string
}

export interface RegisterData {
  role: UserRole
  email: string
  phone_number: string
  password: string
  password_confirm: string
}

export interface OTPRequest {
  phone_number: string
  purpose: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET'
}

export interface OTPVerification {
  phone_number: string
  otp: string
}

export interface PasswordChangeRequest {
  old_password: string
  new_password: string
  new_password_confirm: string
}

export interface PasswordResetRequest {
  identifier: string // phone or email
}

export interface PasswordResetConfirm {
  identifier: string
  otp: string
  new_password: string
  new_password_confirm: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}