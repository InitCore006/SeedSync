export const API_URL = 'https://77d560abcfe2.ngrok-free.app/api';

export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/users/register/',
    LOGIN: '/users/login/',
    SEND_OTP: '/users/send-otp/',
    VERIFY_OTP: '/users/verify-otp/',
    PROFILE: '/users/profile/',
    REFRESH_TOKEN: '/token/refresh/',
    LOGOUT: '/users/logout/',
    CHANGE_PASSWORD: '/users/change-password/',
  },
  
  // Farmer endpoints
  FARMERS: {
    PROFILE: '/farmers/profiles/',
    MY_PROFILE: '/farmers/profiles/my_profile/',
    MY_STATS: '/farmers/profiles/my_stats/',
    STATS: '/farmers/profiles/stats/',
    FARMLANDS: '/farmers/farmlands/',
    CROP_PLANS: '/farmers/crop-plans/',
    NEARBY_FPOS: '/farmers/nearby-fpos/',
    MARKET_PRICES: '/farmers/market-prices/',
    WEATHER_ADVISORY: '/farmers/weather-advisory/',
    DISEASE_DETECTION: '/farmers/disease-detection/',
    YIELD_PREDICTION: '/farmers/yield-prediction/',
  },
  
  // Lots endpoints
  LOTS: {
    LIST: '/lots/procurement/',
    CREATE: '/lots/procurement/',
    DETAIL: (id: string) => `/lots/procurement/${id}/`,
    UPDATE: (id: string) => `/lots/procurement/${id}/`,
    DELETE: (id: string) => `/lots/procurement/${id}/`,
    MY_LOTS: '/lots/procurement/my_lots/',
    MARKETPLACE: '/lots/procurement/marketplace/',
    UPLOAD_IMAGE: (id: string) => `/lots/procurement/${id}/upload_image/`,
    MARKET_PRICES: '/lots/market-prices/',
  },
  
  // Bids endpoints
  BIDS: {
    LIST: '/bids/bids/',
    CREATE: '/bids/bids/',
    MY_BIDS: '/bids/bids/my_bids/',
    LOT_BIDS: (lotId: string) => `/bids/bids/?lot=${lotId}`,
    DETAIL: (id: number) => `/bids/bids/${id}/`,
    ACCEPT: (id: number) => `/bids/bids/${id}/accept_bid/`,
    REJECT: (id: number) => `/bids/bids/${id}/reject_bid/`,
  },
  
  // Payments endpoints
  PAYMENTS: {
    LIST: '/payments/',
    MY_PAYMENTS: '/payments/my-payments/',
    MY_WALLET: '/payments/my-wallet/',
    DETAIL: (id: number) => `/payments/${id}/`,
    CREATE: '/payments/create/',
    VERIFY: (id: number) => `/payments/${id}/verify/`,
  },
  
  // Logistics endpoints
  LOGISTICS: {
    PARTNERS: '/logistics/partners/',
    MY_PROFILE: '/logistics/partners/my_profile/',
    MY_STATS: '/logistics/partners/my_stats/',
    STATS: '/logistics/partners/stats/',
    VEHICLES: '/logistics/vehicles/',
    SHIPMENTS: '/logistics/shipments/',
    SHIPMENT_DETAIL: (id: number) => `/logistics/shipments/${id}/`,
    ACCEPT_BOOKING: (id: number) => `/logistics/shipments/${id}/accept/`,
    REJECT_BOOKING: (id: number) => `/logistics/shipments/${id}/reject/`,
    UPDATE_STATUS: (id: number) => `/logistics/shipments/${id}/update_status/`,
    UPDATE_LOCATION: (id: number) => `/logistics/shipments/${id}/update-location/`,
    TRIP_HISTORY: '/logistics/trip-history/',
    EARNINGS: '/logistics/earnings/',
    PERFORMANCE: '/logistics/performance/',
  },
  
  // AI endpoints
  AI: {
    DETECT_DISEASE: '/ai/detect-disease/',
    PREDICT_PRICE: '/ai/predict-price/',
    DISEASE_HISTORY: '/ai/disease-history/',
  },
  
  // FPO endpoints
  FPO: {
    LIST: '/fpos/',
    NEARBY: '/fpos/nearby/',
    DETAIL: (id: number) => `/fpos/${id}/`,
  },
  
  // Notifications endpoints
  NOTIFICATIONS: {
    LIST: '/notifications/',
    MARK_READ: (id: number) => `/notifications/${id}/mark-read/`,
    DELETE: (id: number) => `/notifications/${id}/`,
    MARK_ALL_READ: '/notifications/mark-all-read/',
  },
  
  // Blockchain endpoints
  BLOCKCHAIN: {
    GENERATE_QR: (lotId: number) => `/blockchain/lots/${lotId}/generate-qr/`,
    GET_TRACE: (lotId: number) => `/blockchain/trace/${lotId}/`,
    GET_CERTIFICATE: (lotId: number) => `/blockchain/certificate/${lotId}/`,
  },
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@seedsync_auth_token',
  REFRESH_TOKEN: '@seedsync_refresh_token',
  USER_DATA: '@seedsync_user_data',
};

export const APP_CONFIG = {
  REQUEST_TIMEOUT: 30000,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png'],
};
