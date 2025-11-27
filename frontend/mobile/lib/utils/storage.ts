import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/types/auth.types';
import { APP_CONFIG } from '@/lib/constants/config';

// ============================================================================
// SECURE STORAGE (For sensitive data like tokens)
// ============================================================================

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
      throw error;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
    }
  },
};

// ============================================================================
// ASYNC STORAGE (For non-sensitive data)
// ============================================================================

export const appStorage = {
  async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
      throw error;
    }
  },

  async getItem(key: string): Promise<any> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('AsyncStorage clear error:', error);
    }
  },
};

// ============================================================================
// USER STORAGE HELPER
// ============================================================================

export const userStorage = {
  async saveUser(user: User): Promise<void> {
    await appStorage.setItem(APP_CONFIG.storageKeys.userData, user);
  },

  async getUser(): Promise<User | null> {
    return await appStorage.getItem(APP_CONFIG.storageKeys.userData);
  },

  async clearUser(): Promise<void> {
    await appStorage.removeItem(APP_CONFIG.storageKeys.userData);
  },
};