import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { APP_CONFIG } from '@/lib/constants/config';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: APP_CONFIG.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Token management helpers
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(APP_CONFIG.storageKeys.authToken);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(APP_CONFIG.storageKeys.refreshToken);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

export const setTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(APP_CONFIG.storageKeys.authToken, accessToken);
    await SecureStore.setItemAsync(APP_CONFIG.storageKeys.refreshToken, refreshToken);
  } catch (error) {
    console.error('Error setting tokens:', error);
    throw error;
  }
};

export const clearTokens = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(APP_CONFIG.storageKeys.authToken);
    await SecureStore.deleteItemAsync(APP_CONFIG.storageKeys.refreshToken);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (__DEV__) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
        data: config.data,
        headers: config.headers,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (__DEV__) {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Enhanced error logging
    if (__DEV__) {
      console.error('❌ API Error:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code,
      });
    }

    // Network error (no response)
    if (!error.response) {
      console.error('🌐 Network Error:', {
        message: error.message,
        code: error.code,
        baseURL: APP_CONFIG.apiBaseUrl,
      });
      
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        originalError: error,
      });
    }

    // Handle 401 Unauthorized with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        await clearTokens();
        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${APP_CONFIG.apiBaseUrl}/users/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;

        await setTokens(access, refreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        processQueue(null, access);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        await clearTokens();
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Connection test helper
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('🔌 Testing connection to:', APP_CONFIG.apiBaseUrl);
    const response = await axios.get(`${APP_CONFIG.apiBaseUrl}/users/health/`, {
      timeout: 5000,
    });
    console.log('✅ Connection successful:', response.data);
    return true;
  } catch (error: any) {
    console.error('❌ Connection failed:', {
      message: error.message,
      code: error.code,
      baseURL: APP_CONFIG.apiBaseUrl,
    });
    return false;
  }
};

export { apiClient };