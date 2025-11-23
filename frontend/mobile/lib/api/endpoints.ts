export const API_ENDPOINTS = {
  // ============================================================================
  // AUTHENTICATION
  // ============================================================================
  AUTH: {
    LOGIN: '/auth/login/',
    REFRESH: '/auth/refresh/',
    LOGOUT: '/users/logout/',
    CHANGE_PASSWORD: '/users/change-password/',
    PASSWORD_RESET_REQUEST: '/users/password-reset/request/',
    PASSWORD_RESET_CONFIRM: '/users/password-reset/confirm/',
    SEND_OTP: '/users/send-otp/',
    VERIFY_OTP: '/users/verify-otp/',
  },

  // ============================================================================
  // USER PROFILE
  // ============================================================================
  USER: {
    PROFILE: '/users/profile/',
    DASHBOARD_STATS: '/users/dashboard-stats/',
  },

  // ============================================================================
  // FARMER
  // ============================================================================
  FARMER: {
    // Registration
    REGISTRATION: {
      VERIFY_PHONE: '/users/farmer-registration/verify-phone/',
      VERIFY_OTP: '/users/farmer-registration/verify-otp/',
      STEP1: '/users/farmer-registration/step1/',
      STEP2: '/users/farmer-registration/step2/',
      STEP3: '/users/farmer-registration/step3/',
      PROGRESS: '/users/farmer-registration/progress/',
      CLEAR_SESSION: '/users/farmer-registration/clear-session/',
    },
    
    // Profile
    PROFILE: {
      MY_PROFILE: '/users/farmer-profiles/my-profile/',
      UPDATE_PROFILE: '/users/farmer-profiles/update-profile/',
      NEARBY_FPOS: '/users/farmer-profiles/nearby-fpos/',
    },

    // Lots (Procurement)
    LOTS: {
      LIST: '/procurement/lots/',
      MY_LOTS: '/procurement/lots/my-lots/',
      CREATE: '/procurement/lots/',
      DETAIL: (id: string) => `/procurement/lots/${id}/`,
      UPDATE: (id: string) => `/procurement/lots/${id}/`,
      DELETE: (id: string) => `/procurement/lots/${id}/`,
      UPLOAD_IMAGES: (id: string) => `/procurement/lots/${id}/upload-images/`,
      MARK_SOLD: (id: string) => `/procurement/lots/${id}/mark-sold/`,
      MARKET_PRICES: '/procurement/lots/market-prices/',
    },

    // Transactions
    TRANSACTIONS: {
      LIST: '/marketplace/transactions/my-transactions/',
      DETAIL: (id: string) => `/marketplace/transactions/${id}/`,
      FARMER_EARNINGS: '/marketplace/transactions/farmer-earnings/',
    },

    // Orders
    ORDERS: {
      FARMER_ORDERS: '/marketplace/orders/farmer-orders/',
      DETAIL: (id: string) => `/marketplace/orders/${id}/`,
      INVOICE: (id: string) => `/marketplace/orders/${id}/invoice/`,
    },

    // Traceability
    TRACEABILITY: {
      MY_RECORDS: '/traceability/records/farmer-records/',
      DETAIL: (id: string) => `/traceability/records/${id}/`,
      QR_CODE: (qrCode: string) => `/traceability/records/qr/${qrCode}/`,
    },

    // Warehouse Booking
    WAREHOUSE: {
      AVAILABLE: '/logistics/warehouses/available/',
      MY_BOOKINGS: '/logistics/warehouse-bookings/my-bookings/',
      CREATE_BOOKING: '/logistics/warehouse-bookings/',
      BOOKING_DETAIL: (id: string) => `/logistics/warehouse-bookings/${id}/`,
    },

    // Transport
    TRANSPORT: {
      REQUEST: '/logistics/transport-requests/',
      MY_REQUESTS: '/logistics/transport-requests/my-requests/',
      REQUEST_DETAIL: (id: string) => `/logistics/transport-requests/${id}/`,
    },
  },

  // ============================================================================
  // FPO
  // ============================================================================
  FPO: {
    PROFILE: {
      LIST: '/users/fpo-profiles/',
      DETAIL: (id: string) => `/users/fpo-profiles/${id}/`,
    },
  },

  // ============================================================================
  // WAREHOUSE
  // ============================================================================
  WAREHOUSE: {
    // Profile
    PROFILE: {
      MY_PROFILE: '/logistics/warehouses/my-warehouse/',
      UPDATE: '/logistics/warehouses/update-warehouse/',
    },

    // Inventory
    INVENTORY: {
      LIST: '/logistics/inventory/',
      ADD_STOCK: '/logistics/inventory/add-stock/',
      DETAIL: (id: string) => `/logistics/inventory/${id}/`,
      UPDATE: (id: string) => `/logistics/inventory/${id}/`,
      STOCK_SUMMARY: '/logistics/inventory/stock-summary/',
    },

    // Quality Check
    QUALITY: {
      LIST: '/logistics/quality-checks/',
      CREATE: '/logistics/quality-checks/',
      DETAIL: (id: string) => `/logistics/quality-checks/${id}/`,
    },

    // Dispatch
    DISPATCH: {
      PENDING: '/logistics/dispatches/pending/',
      CREATE: '/logistics/dispatches/',
      DETAIL: (id: string) => `/logistics/dispatches/${id}/`,
      COMPLETE: (id: string) => `/logistics/dispatches/${id}/complete/`,
    },

    // Bookings
    BOOKINGS: {
      LIST: '/logistics/warehouse-bookings/',
      DETAIL: (id: string) => `/logistics/warehouse-bookings/${id}/`,
      APPROVE: (id: string) => `/logistics/warehouse-bookings/${id}/approve/`,
      REJECT: (id: string) => `/logistics/warehouse-bookings/${id}/reject/`,
    },
  },

  // ============================================================================
  // LOGISTICS (Driver)
  // ============================================================================
  LOGISTICS: {
    // Profile
    PROFILE: {
      MY_PROFILE: '/logistics/vehicles/my-vehicle/',
      UPDATE: '/logistics/vehicles/update-vehicle/',
    },

    // Trips
    TRIPS: {
      AVAILABLE: '/logistics/trips/available/',
      MY_TRIPS: '/logistics/trips/my-trips/',
      ACTIVE: '/logistics/trips/active/',
      ACCEPT: (id: string) => `/logistics/trips/${id}/accept/`,
      START: (id: string) => `/logistics/trips/${id}/start/`,
      COMPLETE_PICKUP: (id: string) => `/logistics/trips/${id}/complete-pickup/`,
      COMPLETE_DELIVERY: (id: string) => `/logistics/trips/${id}/complete-delivery/`,
      DETAIL: (id: string) => `/logistics/trips/${id}/`,
    },

    // GPS Tracking
    TRACKING: {
      UPDATE_LOCATION: (tripId: string) => `/logistics/trips/${tripId}/update-location/`,
      LOCATION_HISTORY: (tripId: string) => `/logistics/trips/${tripId}/location-history/`,
    },

    // Earnings
    EARNINGS: {
      SUMMARY: '/logistics/earnings/summary/',
      HISTORY: '/logistics/earnings/history/',
    },
  },

  // ============================================================================
  // ADVISORY
  // ============================================================================
  ADVISORY: {
    MARKET_PRICES: '/advisory/market-prices/',
    WEATHER: '/advisory/weather-forecast/',
    CROP_ADVISORY: '/advisory/crop-advisory/',
    NEWS: '/advisory/news/',
    ALERTS: '/advisory/alerts/',
  },

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================
  NOTIFICATIONS: {
    LIST: '/notifications/',
    UNREAD_COUNT: '/notifications/unread-count/',
    MARK_READ: (id: string) => `/notifications/${id}/mark-read/`,
    MARK_ALL_READ: '/notifications/mark-all-read/',
    DELETE: (id: string) => `/notifications/${id}/`,
  },
} as const;