export const APP_CONFIG = {
  // API Configuration
  apiBaseUrl: 'https://94b7d7e8e961.ngrok-free.app/api',
  apiTimeout: 30000, // 30 seconds

  // Storage Keys
  storageKeys: {
    authToken: 'access_token',
    refreshToken: 'refresh_token',
    userData: 'user_data',
    language: 'app_language',
    theme: 'app_theme',
  },

  // App Settings
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'hi', 'gu', 'mr', 'te', 'ta', 'kn', 'ml', 'bn', 'pa'],
  
  // Validation
  passwordMinLength: 6,
  otpLength: 6,
  phoneNumberLength: 10,

  // Timeouts
  otpExpirySeconds: 300, // 5 minutes
  sessionTimeout: 3600, // 1 hour

  limits: {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxVideoSize: 50 * 1024 * 1024, // 50MB
    maxDocumentSize: 10 * 1024 * 1024, // 10MB
    maxImagesPerUpload: 10,
  },
} as const;