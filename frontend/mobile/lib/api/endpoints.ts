export const API_ENDPOINTS = {
  // ============================================================================
  // AUTH & USER MANAGEMENT
  // ============================================================================
  AUTH: {
    LOGIN: '/users/login/',
    LOGOUT: '/users/logout/',
    REGISTER: '/users/register/',
    SEND_OTP: '/users/send-otp/',
    VERIFY_REGISTRATION_OTP: '/users/verify-registration-otp/',
    FORGOT_PASSWORD: '/users/forgot-password/',
    RESET_PASSWORD: '/users/reset-password/',
    CHANGE_PASSWORD: '/users/change-password/',
    TOKEN_REFRESH: '/users/token/refresh/',
  },
  
  USER: {
    ME: '/users/me/',
    PROFILE: '/users/me/',
    UPDATE: '/users/me/',
    STATISTICS: '/users/statistics/',
  },

  // ============================================================================
  // FARMER MANAGEMENT
  // ============================================================================
  FARMER: {
    REGISTER: '/farmers/register/',
    ME: '/farmers/me/',
    DASHBOARD: '/farmers/dashboard/',
    UPDATE: (id: string) => `/farmers/${id}/`,
    VERIFY: (id: string) => `/farmers/${id}/verify/`,
    STATISTICS: '/farmers/statistics/',
    MAP_DATA: '/farmers/map-data/',
  },

  // ============================================================================
  // FARM PLOTS
  // ============================================================================
  PLOTS: {
    LIST: '/farmers/plots/',
    CREATE: '/farmers/plots/',
    MY_PLOTS: '/farmers/plots/my-plots/',
    DETAIL: (id: string) => `/farmers/plots/${id}/`,
    UPDATE: (id: string) => `/farmers/plots/${id}/`,
    DELETE: (id: string) => `/farmers/plots/${id}/`,
    UPDATE_LOCATION: (id: string) => `/farmers/plots/${id}/update-location/`,
  },

  // ============================================================================
  // CROP PLANNING
  // ============================================================================
  CROP_PLANNING: {
    LIST: '/farmers/crop-planning/',
    CREATE: '/farmers/crop-planning/',
    ACTIVE: '/farmers/crop-planning/active/',
    CALENDAR: '/farmers/crop-planning/calendar/',
    DETAIL: (id: string) => `/farmers/crop-planning/${id}/`,
    UPDATE: (id: string) => `/farmers/crop-planning/${id}/`,
    UPDATE_STATUS: (id: string) => `/farmers/crop-planning/${id}/update-status/`,
    RECORD_HARVEST: (id: string) => `/farmers/crop-planning/${id}/record-harvest/`,
  },

  // ============================================================================
  // FPO MEMBERSHIPS
  // ============================================================================
  FPO: {
    MEMBERSHIPS: '/farmers/fpo-memberships/',
    MY_MEMBERSHIPS: '/farmers/fpo-memberships/my-memberships/',
    DETAIL: (id: string) => `/farmers/fpo-memberships/${id}/`,
  },

  // ============================================================================
  // CROPS (Keep existing crop endpoints)
  // ============================================================================
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