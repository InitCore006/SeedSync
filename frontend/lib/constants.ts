// Environment variables configuration
export const ENV = {
  // Backend API URL
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  
  // App configuration
  APP_NAME: 'SeedSync',
  APP_VERSION: '1.0.0',
  
  // Token storage keys
  TOKEN_KEY: 'seedsync_token',
  REFRESH_TOKEN_KEY: 'seedsync_refresh_token',
  USER_KEY: 'seedsync_user',
  
  // API timeouts
  API_TIMEOUT: 30000, // 30 seconds
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  
  // File upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  
  // SWR configuration
  SWR_DEDUPE_INTERVAL: 2000,
  SWR_REVALIDATE_ON_FOCUS: true,
  SWR_REVALIDATE_ON_RECONNECT: true,
} as const;

// User roles
export const USER_ROLES = {
  FARMER: 'farmer',
  FPO: 'fpo',
  PROCESSOR: 'processor',
  RETAILER: 'retailer',
  LOGISTICS: 'logistics',
  WAREHOUSE: 'warehouse',
  GOVERNMENT: 'government',
} as const;

// Status constants
export const STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  APPROVED: 'approved',
} as const;

// Lot status
export const LOT_STATUS = {
  AVAILABLE: 'available',
  BIDDING: 'bidding',
  SOLD: 'sold',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

// Bid status
export const BID_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
} as const;

// Payment status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

// Quality grades
export const QUALITY_GRADES = {
  A_PLUS: 'A+',
  A: 'A',
  B: 'B',
  C: 'C',
} as const;

// Crop types
export const CROPS = [
  { value: 'soybean', label: 'Soybean' },
  { value: 'mustard', label: 'Mustard' },
  { value: 'groundnut', label: 'Groundnut' },
  { value: 'sunflower', label: 'Sunflower' },
  { value: 'safflower', label: 'Safflower' },
  { value: 'sesame', label: 'Sesame' },
  { value: 'linseed', label: 'Linseed' },
  { value: 'niger', label: 'Niger' },
] as const;

// Indian states
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
] as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  
  // FPO routes
  FPO_DASHBOARD: '/fpo/dashboard',
  FPO_MEMBERS: '/fpo/members',
  FPO_PROCUREMENT: '/fpo/procurement',
  FPO_WAREHOUSE: '/fpo/warehouse',
  FPO_MARKETPLACE: '/fpo/marketplace',
  
  // Processor routes
  PROCESSOR_DASHBOARD: '/processor/dashboard',
  PROCESSOR_PROCUREMENT: '/processor/procurement',
  PROCESSOR_BATCHES: '/processor/batches',
  PROCESSOR_INVENTORY: '/processor/inventory',
  
  // Government routes
  GOVT_DASHBOARD: '/government/dashboard',
  GOVT_FPO_MONITORING: '/government/fpos',
  GOVT_APPROVALS: '/government/approvals',
  GOVT_ANALYTICS: '/government/analytics',
  
  // Common routes
  PROFILE: '/profile',
  SETTINGS: '/settings',
  BLOCKCHAIN_TRACE: '/trace',
} as const;
