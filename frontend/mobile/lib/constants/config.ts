export const APP_CONFIG = {
  // API Configuration
  apiBaseUrl: 'https://6dd3d902766b.ngrok-free.app/api',
  apiTimeout: 30000, // 30 seconds

  // Storage Keys
  storageKeys: {
    authToken: 'auth_token',
    refreshToken: 'refresh_token',
    userData: 'user_data',
    language: 'app_language',
    theme: 'app_theme',
  },

  // App Settings
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'hi', 'gu', 'mr'],
  
  // Validation
  passwordMinLength: 8,
  otpLength: 6,
  phoneNumberLength: 10,

  // Timeouts
  otpExpirySeconds: 300, // 5 minutes
  sessionTimeout: 3600, // 1 hour
} as const;