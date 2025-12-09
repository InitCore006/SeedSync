import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
  endpoint?: string;
  method?: string;
}

/**
 * Format field name to be user-friendly
 */
const formatFieldName = (field: string): string => {
  // Convert snake_case to Title Case
  return field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Extract validation errors from DRF error response
 */
const extractValidationErrors = (errors: any): string => {
  if (!errors || typeof errors !== 'object') return '';
  
  const messages: string[] = [];
  
  for (const [field, value] of Object.entries(errors)) {
    if (Array.isArray(value)) {
      // Handle array of error messages
      const fieldName = formatFieldName(field);
      messages.push(`${fieldName}: ${value[0]}`);
    } else if (typeof value === 'string') {
      // Handle direct string error
      const fieldName = formatFieldName(field);
      messages.push(`${fieldName}: ${value}`);
    } else if (typeof value === 'object') {
      // Handle nested errors (e.g., non_field_errors)
      const nestedMsg = extractValidationErrors(value);
      if (nestedMsg) messages.push(nestedMsg);
    }
  }
  
  return messages.join('. ');
};

/**
 * Extract meaningful error message from API error
 */
export const getErrorMessage = (error: any): string => {
  console.log('\n========== PARSING ERROR ==========');
  
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    console.log('📍 Error Type: Server Response Error');
    console.log('🔴 Status Code:', status);
    console.log('📄 Error Data:', JSON.stringify(data, null, 2));
    
    // Try to extract message from various possible formats
    
    // 1. Direct string response
    if (typeof data === 'string') {
      return data;
    }
    
    // 2. Standard response_error format from backend
    if (data?.status === 'error' && data?.message) {
      // If there are validation errors, append them
      if (data?.errors && typeof data.errors === 'object') {
        const validationMsg = extractValidationErrors(data.errors);
        if (validationMsg) {
          return `${data.message}\n${validationMsg}`;
        }
      }
      return data.message;
    }
    
    // 3. DRF's standard message field
    if (data?.message) {
      return data.message;
    }
    
    // 4. DRF's detail field (used in authentication errors)
    if (data?.detail) {
      if (typeof data.detail === 'string') {
        return data.detail;
      }
      // Detail might be an object with nested errors
      if (typeof data.detail === 'object') {
        const detailMsg = extractValidationErrors(data.detail);
        if (detailMsg) return detailMsg;
      }
    }
    
    // 5. Generic error field
    if (data?.error) {
      return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
    }
    
    // 6. Handle DRF validation errors (field-specific errors)
    if (data?.errors && typeof data.errors === 'object') {
      const validationMsg = extractValidationErrors(data.errors);
      if (validationMsg) return validationMsg;
    }
    
    // 7. Handle non_field_errors (common in DRF)
    if (data?.non_field_errors && Array.isArray(data.non_field_errors)) {
      return data.non_field_errors.join('. ');
    }
    
    // 8. Handle direct field errors at root level
    if (typeof data === 'object' && !data.status && !data.message) {
      const validationMsg = extractValidationErrors(data);
      if (validationMsg) return validationMsg;
    }
    
    // Fallback to status-based messages
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication failed. Please login again.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found. Please check and try again.';
      case 500:
        return 'Server error occurred. Our team has been notified. Please try again later.';
      case 502:
        return 'Service temporarily unavailable. Please try again in a moment.';
      case 503:
        return 'Service is under maintenance. Please try again later.';
      default:
        return `Request failed with status ${status}. Please try again.`;
    }
  } else if (error.request) {
    // Request made but no response
    console.log('📍 Error Type: No Response');
    console.log('⚠️  Network issue or server not reachable');
    return 'Unable to connect to server. Please check your internet connection and try again.';
  } else {
    // Error in request setup
    console.log('📍 Error Type: Request Setup Error');
    console.log('⚠️  Message:', error.message);
    return error.message || 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Format error for detailed logging
 */
export const logDetailedError = (error: any, context?: string) => {
  console.log('\n========== DETAILED ERROR LOG ==========');
  
  if (context) {
    console.log('📍 Context:', context);
  }
  
  if (error.response) {
    console.log('🔴 HTTP Status:', error.response.status);
    console.log('🚀 URL:', error.config?.url);
    console.log('📍 Method:', error.config?.method?.toUpperCase());
    console.log('📦 Request Headers:', JSON.stringify(error.config?.headers, null, 2));
    console.log('📄 Request Body:', error.config?.data);
    console.log('📄 Response Data:', JSON.stringify(error.response.data, null, 2));
    console.log('📦 Response Headers:', JSON.stringify(error.response.headers, null, 2));
  } else if (error.request) {
    console.log('⚠️  Request made but no response received');
    console.log('🚀 URL:', error.config?.url);
    console.log('📍 Method:', error.config?.method?.toUpperCase());
  } else {
    console.log('❌ Error Message:', error.message);
    console.log('📊 Error Stack:', error.stack);
  }
  
  console.log('========================================\n');
};

/**
 * Parse API error into structured format
 */
export const parseApiError = (error: any): ApiError => {
  const apiError: ApiError = {
    message: getErrorMessage(error),
  };
  
  if (error.response) {
    apiError.status = error.response.status;
    apiError.data = error.response.data;
    apiError.endpoint = error.config?.url;
    apiError.method = error.config?.method?.toUpperCase();
  }
  
  return apiError;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  return !error.response && error.request;
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: any): boolean => {
  return error.response?.status === 401 || error.response?.status === 403;
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: any): boolean => {
  return error.response?.status === 400;
};

/**
 * Get user-friendly error title based on error type
 */
export const getErrorTitle = (error: any): string => {
  if (isNetworkError(error)) {
    return 'Connection Problem';
  }
  
  if (isAuthError(error)) {
    const status = error.response?.status;
    if (status === 401) {
      return 'Login Required';
    }
    return 'Access Denied';
  }
  
  if (isValidationError(error)) {
    return 'Invalid Input';
  }
  
  if (error.response?.status === 404) {
    return 'Not Found';
  }
  
  if (error.response?.status >= 500) {
    return 'Service Unavailable';
  }
  
  // Check if backend provided a custom error type
  if (error.response?.data?.status === 'error') {
    return 'Request Failed';
  }
  
  return 'Oops!';
};

/**
 * Get user-friendly error description with actionable advice
 */
export const getErrorDescription = (error: any): string => {
  const message = getErrorMessage(error);
  
  // Add actionable advice based on error type
  if (isNetworkError(error)) {
    return `${message}\n\nTip: Make sure you have an active internet connection.`;
  }
  
  if (isAuthError(error)) {
    return `${message}\n\nPlease try logging in again.`;
  }
  
  if (isValidationError(error)) {
    return message; // Validation errors are already specific
  }
  
  if (error.response?.status >= 500) {
    return `${message}\n\nThis is a temporary issue. Please try again in a few minutes.`;
  }
  
  return message;
};
