# Resend OTP Testing Guide

## Overview
The Resend OTP functionality has been enhanced to properly handle both registration and login scenarios with improved error handling and user feedback.

## What Was Fixed

### Before
- Used different API methods for registration vs login (`sendOTP()` vs `sendLoginOTP()`)
- Inconsistent error handling
- Timer didn't reset properly after resending
- Generic success message

### After
- Uses single `sendOTP(phone, purpose)` method with explicit purpose parameter
- Consistent error handling with user-friendly messages
- Timer resets to 60 seconds after successful resend
- Clear feedback showing which number OTP was sent to
- Detailed logging for debugging

## How It Works

### 1. **Registration Flow**
```typescript
// When user clicks "Resend OTP" during registration
await authAPI.sendOTP(phone, 'registration');
```

**Backend Behavior:**
- Creates new OTP with purpose='registration'
- Checks if user already exists and is verified → Returns error to login instead
- If user exists but not verified → Sends new OTP (allows re-registration)
- If user doesn't exist → Sends OTP (normal registration flow)

### 2. **Login Flow**
```typescript
// When user clicks "Resend OTP" during login
await authAPI.sendOTP(phone, 'login');
```

**Backend Behavior:**
- Creates new OTP with purpose='login'
- Checks if user exists → Sends new OTP
- If user doesn't exist → Returns friendly error: "Account not found. Please register first."

## Test Scenarios

### Scenario 1: Resend OTP During Login (User Exists)
1. Go to login screen
2. Enter registered phone: `9137966960`
3. Click "Send OTP"
4. Wait for OTP screen
5. Click "Resend OTP" after timer expires

**Expected Result:**
```
Alert: "OTP Sent"
Message: "A new verification code has been sent to +91 9137966960"
Timer: Resets to 60 seconds
Backend: Creates new OTP with purpose='login'
```

### Scenario 2: Resend OTP During Login (User Doesn't Exist)
1. Go to login screen
2. Enter unregistered phone: `9999999999`
3. Click "Send OTP"
4. Should fail with error

**Expected Result:**
```
Alert: "Not Found"
Message: "Account not found. Please register first to create an account.
Phone Number: No account exists with this phone number"
```

### Scenario 3: Resend OTP During Registration (First Time)
1. Go to register screen
2. Enter new phone: `9876543210`
3. Complete registration form
4. Click "Register" (sends first OTP)
5. Wait for OTP screen
6. Click "Resend OTP" after timer expires

**Expected Result:**
```
Alert: "OTP Sent"
Message: "A new verification code has been sent to +91 9876543210"
Timer: Resets to 60 seconds
Backend: Creates new OTP with purpose='registration'
```

### Scenario 4: Resend OTP During Registration (Already Registered & Verified)
1. Go to register screen
2. Enter existing verified phone: `9137966960`
3. Complete registration form
4. Click "Register"

**Expected Result:**
```
Alert: "Invalid Input"
Message: "Account already exists. Please login instead.
Phone Number: This phone number is already registered"
```

### Scenario 5: Network Error During Resend
1. Turn off internet/WiFi
2. Go to OTP screen
3. Click "Resend OTP"

**Expected Result:**
```
Alert: "Connection Problem"
Message: "Unable to connect to server. Please check your internet connection and try again.

Tip: Make sure you have an active internet connection."
```

### Scenario 6: Timer Behavior
1. Go to OTP screen
2. Observe timer counts down from 60
3. Click "Resend OTP" when timer reaches 0
4. OTP sent successfully

**Expected Result:**
- Timer resets to 60 and starts counting down again
- "Resend OTP" button becomes disabled
- Shows "Resend OTP in Xs" message

## API Request Examples

### Registration OTP Resend
```http
POST /api/users/send-otp/
Content-Type: application/json

{
  "phone_number": "9137966960",
  "purpose": "registration"
}
```

**Success Response:**
```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "data": {
    "phone_number": "+919137966960",
    "otp_expires_at": "2025-12-09T12:05:00.000Z"
  }
}
```

### Login OTP Resend
```http
POST /api/users/send-otp/
Content-Type: application/json

{
  "phone_number": "9137966960",
  "purpose": "login"
}
```

**Success Response:**
```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "data": {
    "phone_number": "+919137966960",
    "otp_expires_at": "2025-12-09T12:05:00.000Z"
  }
}
```

**Error Response (User Not Found):**
```json
{
  "status": "error",
  "message": "Account not found. Please register first to create an account.",
  "errors": {
    "phone_number": ["No account exists with this phone number"]
  }
}
```

## Console Logs to Verify

### Successful Resend
```
=== RESEND OTP ===
Phone: 9137966960
Type: login
Sending OTP for login...
Full phone number being sent: 9137966960
✅ OTP resent successfully
📄 Response: {
  "status": "success",
  "message": "OTP sent successfully",
  "data": {
    "phone_number": "+919137966960",
    "otp_expires_at": "..."
  }
}
```

### Failed Resend (User Not Found)
```
=== RESEND OTP ===
Phone: 9999999999
Type: login
Sending OTP for login...
Full phone number being sent: 9999999999
❌ Resend OTP failed
Error: Not Found
Description: Account not found. Please register first to create an account.
Phone Number: No account exists with this phone number
```

## Development Testing with Bypass OTP

During development, you can use the bypass OTP `000000` to skip actual SMS verification:

1. Click "Send OTP" (or "Resend OTP")
2. Enter `000000` as the OTP
3. System will accept it without validation

This allows testing the flow without needing actual OTPs.

## Key Improvements

1. ✅ **Single Unified Method**: Uses `sendOTP(phone, purpose)` for both flows
2. ✅ **Explicit Purpose**: Clear distinction between 'registration' and 'login' OTPs
3. ✅ **Timer Reset**: Properly resets to 60 seconds after successful resend
4. ✅ **User Feedback**: Shows phone number in success message
5. ✅ **Error Handling**: Comprehensive error messages with actionable advice
6. ✅ **Logging**: Detailed console logs for debugging
7. ✅ **Backend Validation**: Checks user existence based on purpose
8. ✅ **Prevents Duplicates**: Warns if trying to register with existing verified account

## Files Modified

- **Frontend**: `mobile/app/(auth)/verify-otp.tsx`
- **Backend**: `backend/apps/users/views.py`
- **Error Handler**: `mobile/utils/errorHandler.ts` (already enhanced)

## Related Documentation

- See `ERROR_HANDLING_GUIDE.md` for comprehensive error handling details
- See `mobile/services/authService.ts` for API service methods
