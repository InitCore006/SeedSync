export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/users/login/',
    LOGOUT: '/users/logout/',
    SEND_OTP: '/users/send-otp/',
    VERIFY_REGISTRATION_OTP: '/users/verify-registration-otp/',
    PASSWORD_RESET_REQUEST: '/users/password-reset/',
    PASSWORD_RESET_CONFIRM: '/users/password-reset-confirm/',
    CHANGE_PASSWORD: '/users/change-password/',
  },
  USER: {
    PROFILE: '/users/profile/',
  },
  FARMER: {
    REGISTER: '/farmers/register/',
    PROFILE: '/farmers/profile/',
  },
  CROPS: {
    LIST: '/crops/crops/',
    CREATE: '/crops/crops/',
    DETAIL: (id: string) => `/crops/crops/${id}/`,
    UPDATE: (id: string) => `/crops/crops/${id}/`,
    DELETE: (id: string) => `/crops/crops/${id}/`,
    MY_CROPS: '/crops/crops/my_crops/',
    STATISTICS: '/crops/crops/statistics/',
    UPDATE_STATUS: (id: string) => `/crops/crops/${id}/update_status/`,
    TIMELINE: (id: string) => `/crops/crops/${id}/timeline/`,
    
    // Inputs
    INPUTS: '/crops/inputs/',
    INPUT_BY_CROP: '/crops/inputs/by_crop/',
    INPUT_COST_SUMMARY: '/crops/inputs/cost_summary/',
    
    // Observations
    OBSERVATIONS: '/crops/observations/',
    OBSERVATION_BY_CROP: '/crops/observations/by_crop/',
    DISEASE_ALERTS: '/crops/observations/disease_alerts/',
    
    // Harvests
    HARVESTS: '/crops/harvests/',
    HARVEST_STATISTICS: '/crops/harvests/statistics/',
    
    // Transactions
    TRANSACTIONS: '/crops/transactions/',
    MY_TRANSACTIONS: '/crops/transactions/my_transactions/',
    TRANSACTION_BY_CROP: '/crops/transactions/by_crop/',
  },
} as const;