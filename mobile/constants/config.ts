export const API_URL = 'http://127.0.0.1:8000/api';

export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/users/register/',
    LOGIN: '/users/login/',
    SEND_OTP: '/users/send-otp/',
    SEND_LOGIN_OTP: '/users/send-login-otp/',
    VERIFY_OTP: '/users/verify-otp/',
    PROFILE: '/users/profile/',
    REFRESH_TOKEN: '/users/token/refresh/',
  },
  
  // Lots endpoints
  LOTS: {
    LIST: '/lots/',
    CREATE: '/lots/create/',
    DETAIL: (id: number) => `/lots/${id}/`,
    UPDATE: (id: number) => `/lots/${id}/update/`,
    DELETE: (id: number) => `/lots/${id}/delete/`,
    MY_LOTS: '/lots/my-lots/',
    UPLOAD_IMAGE: (id: number) => `/lots/${id}/upload-image/`,
    MARKET_PRICES: '/lots/market-prices/',
  },
  
  // Bids endpoints
  BIDS: {
    LIST: '/bids/',
    CREATE: '/bids/create/',
    MY_BIDS: '/bids/my-bids/',
    LOT_BIDS: (lotId: number) => `/bids/lot/${lotId}/`,
    ACCEPT: (id: number) => `/bids/${id}/accept/`,
    REJECT: (id: number) => `/bids/${id}/reject/`,
  },
  
  // AI endpoints
  AI: {
    DETECT_DISEASE: '/ai/detect-disease/',
    PREDICT_PRICE: '/ai/predict-price/',
  },
  
  // Advisory endpoints
  ADVISORY: {
    WEATHER: '/advisory/weather/',
    CROP_ADVISORY: '/advisory/crop-advisory/',
  },
  
  // FPO endpoints
  FPO: {
    NEARBY: '/fpos/nearby/',
  },
  
  // Blockchain endpoints
  BLOCKCHAIN: {
    GENERATE_QR: (lotId: number) => `/blockchain/lots/${lotId}/generate-qr/`,
    GET_TRACE: (lotId: number) => `/blockchain/lots/${lotId}/trace/`,
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
