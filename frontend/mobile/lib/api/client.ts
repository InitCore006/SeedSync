import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { APP_CONFIG } from '@lib/constants/config';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: APP_CONFIG.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Token management
const getAccessToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(APP_CONFIG.storageKeys.authToken);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(APP_CONFIG.storageKeys.refreshToken);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

const setTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(APP_CONFIG.storageKeys.authToken, accessToken);
    await SecureStore.setItemAsync(APP_CONFIG.storageKeys.refreshToken, refreshToken);
  } catch (error) {
    console.error('Error setting tokens:', error);
  }
};

const clearTokens = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(APP_CONFIG.storageKeys.authToken);
    await SecureStore.deleteItemAsync(APP_CONFIG.storageKeys.refreshToken);
    await AsyncStorage.removeItem(APP_CONFIG.storageKeys.userData);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (__DEV__) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
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
    // Log response in development
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

    // Log error in development
    if (__DEV__) {
      console.error('❌ API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request
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
        // No refresh token, logout user
        await clearTokens();
        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Call refresh token endpoint
        const response = await axios.post(
          `${APP_CONFIG.apiBaseUrl}/auth/refresh/`,
          { refresh: refreshToken }
        );

        const { access, refresh } = response.data;

        // Save new tokens
        await setTokens(access, refresh || refreshToken);

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        // Process queued requests
        processQueue(null, access);
        isRefreshing = false;

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        await clearTokens();
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient, getAccessToken, getRefreshToken, setTokens, clearTokens };