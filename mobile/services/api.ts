import axios from 'axios';
import { API_URL, ENDPOINTS } from '@/constants/config';
import { storage } from '@/utils/storage';
import { router } from 'expo-router';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to safely stringify circular objects
const safeStringify = (obj: any) => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  }, 2);
};

// Request interceptor to add auth token and log requests
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details
    console.log('\n========== API REQUEST ==========');
    console.log('🚀 URL:', `${config.baseURL}${config.url}`);
    console.log('📍 Method:', config.method?.toUpperCase());
    console.log('📦 Headers:', JSON.stringify(config.headers, null, 2));
    if (config.params) {
      console.log('🔍 Query Params:', JSON.stringify(config.params, null, 2));
    }
    if (config.data) {
      console.log('📄 Request Body:', typeof config.data === 'string' ? config.data : safeStringify(config.data));
    }
    console.log('=================================\n');

    return config;
  },
  (error) => {
    console.error('\n❌ REQUEST ERROR:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and log responses
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('\n========== API RESPONSE ==========');
    console.log('✅ Status:', response.status, response.statusText);
    console.log('🚀 URL:', `${response.config.baseURL}${response.config.url}`);
    console.log('📍 Method:', response.config.method?.toUpperCase());
    console.log('📦 Response Headers:', JSON.stringify(response.headers, null, 2));
    console.log('📄 Response Data:', safeStringify(response.data));
    console.log('==================================\n');
    
    // Unwrap backend response wrapper: { data: {...} } -> {...}
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data;
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error details
    console.log('\n========== API ERROR ==========');
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('🚀 URL:', `${error.config?.baseURL}${error.config?.url}`);
      console.log('📍 Method:', error.config?.method?.toUpperCase());
      console.log('🔴 Status:', error.response.status, error.response.statusText);
      console.log('📦 Response Headers:', JSON.stringify(error.response.headers, null, 2));
      console.log('📄 Error Response:', safeStringify(error.response.data));
      console.log('📄 Request Body:', error.config?.data ? safeStringify(JSON.parse(error.config.data)) : 'None');
    } else if (error.request) {
      console.log('🚀 URL:', `${error.config?.baseURL}${error.config?.url}`);
      console.log('📍 Method:', error.config?.method?.toUpperCase());
      console.log('⚠️  No response received from server');
      console.log('📄 Request:', error.request);
    } else {
      console.log('⚠️  Error setting up request:', error.message);
    }
    console.log('===============================\n');

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        console.log('\n🔄 Attempting token refresh...');
        
        // Try to refresh token
        const response = await axios.post(
          `${API_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        await storage.setAuthToken(access);

        console.log('✅ Token refreshed successfully\n');

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError: any) {
        console.log('❌ Token refresh failed:', refreshError.message);
        console.log('🔐 Redirecting to login...\n');
        
        // Refresh failed, clear storage and redirect to login
        await storage.clearAll();
        router.replace('/(auth)/login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
