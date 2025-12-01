export interface User {
  id: string;
  phone_number: string;
  full_name: string;
  email?: string;
  role: 'admin' | 'farmer' | 'fpo_admin' | 'retailer' | 'processor';
  district: string;
  state: string;
  pincode: string;
  is_active: boolean;
  is_verified: boolean;
  date_joined: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  phone_number: string;
  password: string;
}

export interface RegisterData {
  phone_number: string;
  full_name: string;
  email?: string;
  password: string;
  confirm_password: string;
  role: string;
  district: string;
  state: string;
  pincode: string;
}

// FPO Types
export interface FPO {
  id: string;
  owner: string;
  name: string;
  fpo_code: string;
  district: string;
  state: string;
  pincode: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  registration_number: string;
  gstin?: string;
  total_members: number;
  total_land_area: number;
  monthly_capacity: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface FPORegistrationData {
  name: string;
  district: string;
  state: string;
  pincode: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  registration_number: string;
  gstin?: string;
  total_land_area: number;
  monthly_capacity: number;
}

// Processor Types
export interface Processor {
  id: string;
  user: string;
  company_name: string;
  processor_code: string;
  business_scale: 'small' | 'medium' | 'large';
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  fssai_license: string;
  monthly_capacity: number;
  monthly_requirement: number;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface ProcessorRegistrationData {
  company_name: string;
  business_scale: 'small' | 'medium' | 'large';
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  fssai_license: string;
  monthly_capacity: number;
  monthly_requirement: number;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
}

// Retailer Types
export interface Retailer {
  id: string;
  user: string;
  business_name: string;
  retailer_code: string;
  retailer_type: 'wholesaler' | 'retail_chain' | 'food_processor' | 'exporter';
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  fssai_license?: string;
  monthly_requirement: number;
  payment_terms: 'advance' | 'credit_15' | 'credit_30';
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface RetailerRegistrationData {
  business_name: string;
  retailer_type: 'wholesaler' | 'retail_chain' | 'food_processor' | 'exporter';
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  fssai_license?: string;
  monthly_requirement: number;
  payment_terms: 'advance' | 'credit_15' | 'credit_30';
  contact_person: string;
  contact_phone: string;
  contact_email: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}



export interface FPO {
  id: string;
  name: string;
  fpo_code: string;
  owner: string;
  district: string;
  state: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  is_verified: boolean;
  is_active: boolean;
  total_land_area: number;
  monthly_capacity: number;
}

export interface Retailer {
  id: string;
  business_name: string;
  retailer_code: string;
  user: string;
  retailer_type: string;
  city: string;
  state: string;
  gstin: string;
  is_verified: boolean;
  is_active: boolean;
  monthly_requirement: number;
}

export interface Processor {
  id: string;
  company_name: string;
  processor_code: string;
  user: string;
  business_scale: string;
  city: string;
  state: string;
  gstin: string;
  fssai_license: string;
  is_verified: boolean;
  is_active: boolean;
  monthly_capacity: number;
  monthly_requirement: number;
}

export interface DashboardStats {
  total_users?: number;
  total_fpos?: number;
  total_retailers?: number;
  total_processors?: number;
  verified_entities?: number;
  pending_verification?: number;
  total_capacity?: number;
  total_requirement?: number;
}



// Indian States
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];