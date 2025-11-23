import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { APP_CONFIG } from '@lib/constants/config';

// ============================================================================
// SECURE STORAGE (for tokens)
// ============================================================================

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error setting secure item ${key}:`, error);
      throw error;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error getting secure item ${key}:`, error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error removing secure item ${key}:`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(APP_CONFIG.storageKeys.authToken);
      await SecureStore.deleteItemAsync(APP_CONFIG.storageKeys.refreshToken);
    } catch (error) {
      console.error('Error clearing secure storage:', error);
    }
  },
};

// ============================================================================
// ASYNC STORAGE (for app data)
// ============================================================================

export const appStorage = {
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  async multiGet(keys: string[]): Promise<Record<string, any>> {
    try {
      const values = await AsyncStorage.multiGet(keys);
      const result: Record<string, any> = {};
      
      values.forEach(([key, value]) => {
        if (value) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return {};
    }
  },

  async multiSet(items: Array<[string, any]>): Promise<void> {
    try {
      const stringifiedItems: Array<[string, string]> = items.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(stringifiedItems);
    } catch (error) {
      console.error('Error setting multiple items:', error);
      throw error;
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },
};

// ============================================================================
// USER DATA HELPERS
// ============================================================================

export const userStorage = {
  async saveUser(user: any): Promise<void> {
    await appStorage.setItem(APP_CONFIG.storageKeys.userData, user);
  },

  async getUser(): Promise<any> {
    return await appStorage.getItem(APP_CONFIG.storageKeys.userData);
  },

  async clearUser(): Promise<void> {
    await appStorage.removeItem(APP_CONFIG.storageKeys.userData);
  },
};

// ============================================================================
// SETTINGS HELPERS
// ============================================================================

export const settingsStorage = {
  async setLanguage(language: string): Promise<void> {
    await appStorage.setItem(APP_CONFIG.storageKeys.language, language);
  },

  async getLanguage(): Promise<string> {
    return (await appStorage.getItem<string>(APP_CONFIG.storageKeys.language)) || 'en';
  },

  async setTheme(theme: 'light' | 'dark'): Promise<void> {
    await appStorage.setItem(APP_CONFIG.storageKeys.theme, theme);
  },

  async getTheme(): Promise<'light' | 'dark'> {
    return (await appStorage.getItem<'light' | 'dark'>(APP_CONFIG.storageKeys.theme)) || 'light';
  },
};