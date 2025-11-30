export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/users/login/',
    LOGOUT: '/users/logout/',
    REFRESH: '/users/token/refresh/',
    
    // Phone Verification (uses cache, no OTP model)
    SEND_OTP: '/users/send-otp/',
    VERIFY_REGISTRATION_OTP: '/users/verify-registration-otp/',
    
    // Password
    CHANGE_PASSWORD: '/users/change-password/',
    PASSWORD_RESET_REQUEST: '/users/password-reset/',
    PASSWORD_RESET_CONFIRM: '/users/password-reset/confirm/',
  },

  // User Profile
  USER: {
    PROFILE: '/users/profile/',
    UPDATE_PROFILE: '/users/profile/update/',
  },

  // Farmer Registration (Single endpoint)
  FARMER: {
    REGISTER: '/farmers/register/',
    PROFILE: '/farmers/profile/',
    UPDATE_PROFILE: '/farmers/profile/update/',
  },
} as const;