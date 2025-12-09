# Error Handling Guide - SeedSync Mobile App

## Overview
The mobile app now has comprehensive error handling that displays backend error messages in a user-friendly, readable manner.

## Key Features

### 1. **Enhanced Error Parsing**
The error handler now properly extracts and formats error messages from multiple backend response formats:

- Standard Django REST Framework (DRF) errors
- Custom `response_error()` format from backend
- Field-specific validation errors
- Nested error objects
- Network and connection errors

### 2. **User-Friendly Error Messages**

#### Before Enhancement:
```
Alert: "Error"
Message: "Request failed with status 400"
```

#### After Enhancement:
```
Alert: "Invalid Input"
Message: "Phone Number: Invalid phone number. Enter 10 digits starting with 6-9. 
Example: 9137966960"

Tip: Make sure you have an active internet connection.
```

## Error Types and Their User-Friendly Titles

| Error Type | User-Friendly Title | Description |
|------------|-------------------|-------------|
| Network Error | "Connection Problem" | No internet or server unreachable |
| 401 Auth Error | "Login Required" | User needs to login again |
| 403 Auth Error | "Access Denied" | User doesn't have permission |
| 400 Validation | "Invalid Input" | Input validation failed |
| 404 Not Found | "Not Found" | Resource doesn't exist |
| 500+ Server | "Service Unavailable" | Server error occurred |

## Backend Error Format Support

### 1. Standard `response_error()` Format
```json
{
  "status": "error",
  "message": "Login failed",
  "errors": {
    "phone_number": ["User not found. Please register first."]
  }
}
```
**Displays as:**
```
Title: "Request Failed"
Message: "Login failed
Phone Number: User not found. Please register first."
```

### 2. Field-Specific Validation Errors
```json
{
  "phone_number": ["Invalid phone number. Enter 10 digits starting with 6-9."],
  "full_name": ["This field is required."]
}
```
**Displays as:**
```
Title: "Invalid Input"
Message: "Phone Number: Invalid phone number. Enter 10 digits starting with 6-9. 
Full Name: This field is required."
```

### 3. DRF Detail Errors
```json
{
  "detail": "User not found"
}
```
**Displays as:**
```
Title: "Not Found"
Message: "User not found"
```

### 4. Network Errors
When the server is unreachable or no internet connection:
```
Title: "Connection Problem"
Message: "Unable to connect to server. Please check your internet connection and try again.

Tip: Make sure you have an active internet connection."
```

## Implementation Examples

### Login Screen
```typescript
try {
  await authAPI.sendLoginOTP(phoneNumber);
  router.push({ pathname: '/(auth)/verify-otp', params: { phone: phoneNumber, type: 'login' }});
} catch (error: any) {
  logDetailedError(error, 'Login Screen - Send OTP');
  const errorTitle = getErrorTitle(error);
  const errorDescription = getErrorDescription(error);
  
  Alert.alert(
    errorTitle,
    errorDescription,
    [{ text: 'OK', style: 'default' }]
  );
}
```

### Verify OTP Screen
```typescript
try {
  const response = await authAPI.verifyOTP({ phone_number, otp, purpose: 'login' });
  await login(response.data.user, response.data.tokens.access, response.data.tokens.refresh);
  router.replace('/(tabs)');
} catch (error: any) {
  logDetailedError(error, 'Verify OTP - Login');
  const errorTitle = getErrorTitle(error);
  const errorDescription = getErrorDescription(error);
  
  Alert.alert(
    errorTitle,
    errorDescription,
    [{ text: 'Try Again', style: 'default' }]
  );
}
```

## Helper Functions

### `getErrorTitle(error)`
Returns a user-friendly title based on the error type.

**Examples:**
- Network error → "Connection Problem"
- 401 error → "Login Required"
- 400 error → "Invalid Input"
- 500 error → "Service Unavailable"

### `getErrorDescription(error)`
Returns a detailed, actionable error message with helpful tips.

**Examples:**
- Network: "Unable to connect... Tip: Make sure you have an active internet connection."
- Auth: "Authentication failed. Please try logging in again."
- Validation: Shows specific field errors with clear formatting

### `getErrorMessage(error)`
Extracts the core error message from various backend formats.

### `logDetailedError(error, context)`
Logs comprehensive error details to console for debugging.

## Common Error Scenarios

### 1. User Not Found During Login
**Backend Response:**
```json
{
  "status": "error",
  "message": "User not found. Please register first."
}
```
**User Sees:**
```
Title: "Not Found"
Message: "User not found. Please register first."
```

### 2. Invalid Phone Number Format
**Backend Response:**
```json
{
  "phone_number": ["Invalid phone number. Enter 10 digits starting with 6-9. Example: 9137966960"]
}
```
**User Sees:**
```
Title: "Invalid Input"
Message: "Phone Number: Invalid phone number. Enter 10 digits starting with 6-9. 
Example: 9137966960"
```

### 3. Expired OTP
**Backend Response:**
```json
{
  "status": "error",
  "message": "OTP verification failed",
  "errors": {
    "otp": ["Invalid or expired OTP"]
  }
}
```
**User Sees:**
```
Title: "Request Failed"
Message: "OTP verification failed
Otp: Invalid or expired OTP"
```

### 4. Network Connection Lost
**User Sees:**
```
Title: "Connection Problem"
Message: "Unable to connect to server. Please check your internet connection and try again.

Tip: Make sure you have an active internet connection."
```

### 5. Server Error (500)
**User Sees:**
```
Title: "Service Unavailable"
Message: "Server error occurred. Our team has been notified. Please try again later.

This is a temporary issue. Please try again in a few minutes."
```

## Testing Edge Cases

### Test Scenarios to Verify:

1. **Valid Login** - Should work smoothly
2. **Invalid Phone Number** - Should show formatted field error
3. **User Not Found** - Should show clear "not found" message
4. **Invalid OTP** - Should show OTP-specific error
5. **Expired OTP** - Should prompt to resend
6. **Network Offline** - Should show connection problem
7. **Server Down** - Should show service unavailable
8. **Multiple Field Errors** - Should list all errors clearly

## Benefits

1. ✅ **Clear Communication** - Users understand what went wrong
2. ✅ **Actionable Advice** - Tells users what to do next
3. ✅ **Consistent Experience** - Same error format throughout app
4. ✅ **Better UX** - Reduces user frustration
5. ✅ **Easier Debugging** - Detailed console logs for developers
6. ✅ **Professional** - Polished error handling makes app feel reliable

## File Locations

- **Error Handler**: `mobile/utils/errorHandler.ts`
- **Login Screen**: `mobile/app/(auth)/login.tsx`
- **Verify OTP**: `mobile/app/(auth)/verify-otp.tsx`
- **Register Farmer**: `mobile/app/(auth)/register-farmer.tsx`
- **Backend Utils**: `backend/apps/core/utils.py`
- **Backend Views**: `backend/apps/users/views.py`
