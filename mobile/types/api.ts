// User and Auth Types
export interface User {
  id: number;
  phone_number: string;
  first_name: string;
  last_name: string;
  role: 'farmer' | 'fpo_field_officer' | 'warehouse_operator' | 'logistics_driver';
  created_at: string;
}

export interface UserProfile extends User {
  email?: string;
  address?: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  phone_number: string;
  otp: string;
}

export interface RegisterData {
  phone_number: string;
  first_name: string;
  last_name: string;
  role: string;
}

// Lot Types
export interface ProcurementLot {
  id: number;
  lot_number: string;
  farmer: number;
  crop_type: string;
  quantity_quintals: number;
  quality_grade: string;
  expected_price_per_quintal: number;
  harvest_date: string;
  moisture_content?: number;
  oil_content?: number;
  storage_location: string;
  status: 'available' | 'bidding' | 'sold' | 'delivered';
  created_at: string;
  updated_at: string;
  images?: Array<{
    id: number;
    image: string;
    uploaded_at: string;
  }>;
}

// Bid Types
export interface Bid {
  id: number;
  lot: number;
  bidder: number;
  offered_price_per_quintal: number;
  status: 'pending' | 'accepted' | 'rejected';
  payment_terms?: string;
  created_at: string;
  updated_at: string;
}

export interface MyBidsResponse {
  received: Bid[];
  sent: Bid[];
}

// API Response Types
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
