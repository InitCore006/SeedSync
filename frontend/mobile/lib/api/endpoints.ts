export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/users/token/',
    REFRESH: '/users/token/refresh/',
    LOGOUT: '/users/logout/',
    CHANGE_PASSWORD: '/users/change-password/',
    PASSWORD_RESET_REQUEST: '/users/password-reset/request/',
    PASSWORD_RESET_CONFIRM: '/users/password-reset/confirm/',
    SEND_OTP: '/users/send-otp/',
    VERIFY_OTP: '/users/verify-otp/',
    VERIFY_PHONE: '/users/verify-phone/',
  },

  // User Profile
  USER: {
    PROFILE: '/users/profile/',
    DASHBOARD_STATS: '/users/dashboard-stats/',
  },

  // Farmer Registration
  FARMER_REGISTRATION: {
    STEP1: '/users/farmer-registration/step1/',
    STEP2: '/users/farmer-registration/step2/',
    STEP3: '/users/farmer-registration/step3/',
    PROGRESS: '/users/farmer-registration/progress/',
    CLEAR_SESSION: '/users/farmer-registration/clear-session/',
  },

  // Farmer Profile
  FARMER: {
    MY_PROFILE: '/users/farmer-profiles/my-profile/',
    MY_DASHBOARD: '/users/farmer-profiles/my-dashboard/',
    UPDATE_PROFILE: '/users/farmer-profiles/update-profile/',
  },
} as const;