export const APP_NAME = 'SeedSync'
export const APP_VERSION = '1.0.0'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  FEATURES: '/features',
  CONTACT: '/contact',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
} as const

export const USER_ROLES = {
  FARMER: 'FARMER',
  FPO: 'FPO',
  PROCESSOR: 'PROCESSOR',
  RETAILER: 'RETAILER',
  LOGISTICS: 'LOGISTICS',
  GOVERNMENT: 'GOVERNMENT',
} as const

export const APPROVAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
} as const

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const

export const OILSEEDS = [
  'Groundnut',
  'Mustard',
  'Sunflower',
  'Soybean',
  'Sesame',
  'Safflower',
  'Niger',
  'Linseed',
  'Castor',
] as const

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf'],
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const

export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 3000,
  WARNING: 4000,
} as const