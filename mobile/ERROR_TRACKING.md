# API Request/Response Tracking & Error Logging

## Overview
The mobile app now includes comprehensive logging for all API requests, responses, and errors. This helps track what's happening with backend communication.

## What's Logged

### 1. API Configuration (On App Start)
```
========== API CONFIGURATION ==========
🌐 Base URL: https://your-api-url.com/api
⏱️  Request Timeout: 30 seconds
📱 App Version: 1.0.0
======================================
```

### 2. Every API Request
```
========== API REQUEST ==========
🚀 URL: https://your-api-url.com/api/users/login/
📍 Method: POST
📦 Headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer token..."
}
🔍 Query Params: { ... }  (if any)
📄 Request Body: { ... }  (if any)
=================================
```

### 3. Successful Responses
```
========== API RESPONSE ==========
✅ Status: 200 OK
🚀 URL: https://your-api-url.com/api/users/login/
📍 Method: POST
📦 Response Headers: { ... }
📄 Response Data: { ... }
==================================
```

### 4. Error Responses
```
========== API ERROR ==========
❌ Error: Request failed with status code 400
🚀 URL: https://your-api-url.com/api/users/login/
📍 Method: POST
🔴 Status: 400 Bad Request
📦 Response Headers: { ... }
📄 Error Response: {
  "phone_number": ["This field is required."]
}
📄 Request Body: { ... }
===============================
```

### 5. Token Refresh
```
🔄 Attempting token refresh...
✅ Token refreshed successfully
```
OR
```
❌ Token refresh failed: Invalid token
🔐 Redirecting to login...
```

### 6. Detailed Error Parsing
```
========== PARSING ERROR ==========
📍 Error Type: Server Response Error
🔴 Status Code: 400
📄 Error Data: {
  "phone_number": ["Enter a valid phone number."]
}
```

```
========== DETAILED ERROR LOG ==========
📍 Context: Login Screen - Send OTP
🔴 HTTP Status: 400
🚀 URL: /users/send-login-otp/
📍 Method: POST
📦 Request Headers: { ... }
📄 Request Body: {"phone_number":"123"}
📄 Response Data: {"error":"Invalid phone"}
========================================
```

## How to Use

### In Any Screen/Component

```typescript
import { getErrorMessage, getErrorTitle, logDetailedError } from '@/utils/errorHandler';

// In your try-catch block:
try {
  const response = await someAPI.someMethod(data);
  console.log('✅ Success:', response.data);
} catch (error: any) {
  // Log detailed error information
  logDetailedError(error, 'Screen Name - Action Description');
  
  // Get user-friendly error message
  const errorTitle = getErrorTitle(error);
  const errorMessage = getErrorMessage(error);
  
  // Show to user
  Alert.alert(errorTitle, errorMessage);
}
```

### Error Helper Functions

1. **`getErrorMessage(error)`** - Extracts human-readable message
2. **`getErrorTitle(error)`** - Gets appropriate error title
3. **`logDetailedError(error, context)`** - Logs full error details
4. **`parseApiError(error)`** - Returns structured error object
5. **`isNetworkError(error)`** - Checks if it's a network issue
6. **`isAuthError(error)`** - Checks if it's auth-related (401/403)
7. **`isValidationError(error)`** - Checks if it's validation (400)

## Error Types Detected

### Network Errors
- No internet connection
- Server not reachable
- Request timeout

### Authentication Errors (401/403)
- Invalid token
- Expired token
- No permission

### Validation Errors (400)
- Invalid input
- Missing required fields
- Format errors

### Server Errors (500+)
- Internal server error
- Service unavailable

## Viewing Logs

### Development Mode
All logs appear in:
- **Metro Bundler terminal** (where you run `npx expo start`)
- **Expo DevTools** (press `j` to open debugger)
- **React Native Debugger** (if installed)

### Filter Logs
Look for these prefixes:
- `🚀` - URL/Endpoint
- `📍` - Method (GET, POST, etc.)
- `📦` - Headers
- `📄` - Data/Body
- `✅` - Success
- `❌` - Error
- `🔄` - In progress
- `🔐` - Auth-related

## Example Log Flow

When you try to login:

```
📱 Attempting to send OTP to: 9876543210
🔄 Calling sendLoginOTP API...

========== API REQUEST ==========
🚀 URL: https://api.example.com/api/users/send-login-otp/
📍 Method: POST
📦 Headers: { "Content-Type": "application/json" }
📄 Request Body: {
  "phone_number": "9876543210"
}
=================================

========== API RESPONSE ==========
✅ Status: 200 OK
🚀 URL: https://api.example.com/api/users/send-login-otp/
📍 Method: POST
📄 Response Data: {
  "message": "OTP sent successfully"
}
==================================

✅ OTP sent successfully
📄 Response: { "message": "OTP sent successfully" }
```

## Tips

1. **Always include context** when logging errors:
   ```typescript
   logDetailedError(error, 'Login Screen - Send OTP');
   ```

2. **Add custom logs** for debugging:
   ```typescript
   console.log('📱 User input:', phoneNumber);
   console.log('🔄 Processing...');
   console.log('✅ Done!');
   ```

3. **Check both** request and response to debug issues

4. **Look for patterns** in failed requests (headers, body format, etc.)

## Common Issues & Solutions

### Issue: "Network error. Please check your connection."
**Check:**
- Is the backend server running?
- Is the API_URL correct in `constants/config.ts`?
- Check the request logs to see the full URL

### Issue: "Invalid request. Please check your input."
**Check:**
- Request Body in logs
- Response Data showing validation errors
- Field names and formats

### Issue: "Authentication failed."
**Check:**
- Token in request headers
- Token refresh logs
- Whether user needs to login again

## Files Modified

1. **`services/api.ts`** - Added request/response interceptors
2. **`utils/errorHandler.ts`** - Error parsing and logging utilities
3. **`constants/config.ts`** - Added API configuration logging
4. **`app/(auth)/login.tsx`** - Example implementation

## Next Steps

Apply the same error handling pattern to other screens:
- Registration
- OTP Verification
- Lot Creation
- Bidding
- All API calls

## Production Considerations

For production, you may want to:
1. Disable verbose logging
2. Send errors to a logging service (Sentry, LogRocket, etc.)
3. Keep only critical error logs
4. Add error tracking analytics
