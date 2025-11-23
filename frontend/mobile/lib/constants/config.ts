import Constants from 'expo-constants';

export const APP_CONFIG = {
  name: 'SeedSync',
  version: Constants.expoConfig?.version || '1.0.0',
  apiBaseUrl: process.env.API_BASE_URL || 'http://127.0.0.1:8000/api',
  apiTimeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
  
  // Feature Flags
  features: {
    biometric: process.env.ENABLE_BIOMETRIC === 'true',
    offlineMode: process.env.ENABLE_OFFLINE_MODE === 'true',
    gpsTracking: process.env.ENABLE_GPS_TRACKING === 'true',
  },

  // External Services
  razorpay: {
    key: process.env.RAZORPAY_KEY || '',
  },
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  },

  // App Limits
  limits: {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxImages: 5,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
  },

  // Storage Keys
  storageKeys: {
    authToken: '@seedsync:auth_token',
    refreshToken: '@seedsync:refresh_token',
    userData: '@seedsync:user_data',
    language: '@seedsync:language',
    theme: '@seedsync:theme',
  },
} as const;

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
] as const;