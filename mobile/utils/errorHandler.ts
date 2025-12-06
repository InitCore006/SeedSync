import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
  endpoint?: string;
  method?: string;
}

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
    if (typeof data === 'string') {
      return data;
    }
    
    if (data?.message) {
      return data.message;
    }
    
    if (data?.detail) {
      return data.detail;
    }
    
    if (data?.error) {
      return data.error;
    }
    
    // Handle validation errors (field-specific errors)
    if (typeof data === 'object') {
      const firstKey = Object.keys(data)[0];
      if (firstKey && Array.isArray(data[firstKey])) {
        return `${firstKey}: ${data[firstKey][0]}`;
      }
      if (firstKey && typeof data[firstKey] === 'string') {
        return `${firstKey}: ${data[firstKey]}`;
      }
    }
    
    // Fallback to status-based messages
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication failed. Please login again.';
      case 403:
        return 'Access denied. You do not have permission.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Request failed with status ${status}`;
    }
  } else if (error.request) {
    // Request made but no response
    console.log('📍 Error Type: No Response');
    console.log('⚠️  Network issue or server not reachable');
    return 'Network error. Please check your connection.';
  } else {
    // Error in request setup
    console.log('📍 Error Type: Request Setup Error');
    console.log('⚠️  Message:', error.message);
    return error.message || 'An unexpected error occurred.';
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
    return 'Connection Error';
  }
  
  if (isAuthError(error)) {
    return 'Authentication Error';
  }
  
  if (isValidationError(error)) {
    return 'Validation Error';
  }
  
  if (error.response?.status >= 500) {
    return 'Server Error';
  }
  
  return 'Error';
};
