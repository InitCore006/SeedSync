/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginCredentials, LoginResponse } from '@/types/auth'
import { authAPI } from '@lib/api'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  updateProfile: (data: Partial<User>) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const response: LoginResponse = await authAPI.login(credentials)
          
          // Save tokens to localStorage
          localStorage.setItem('access_token', response.access)
          localStorage.setItem('refresh_token', response.refresh)
          
          set({
            user: response.user,
            accessToken: response.access,
            refreshToken: response.refresh,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'Login failed. Please try again.'
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      logout: () => {
        // Clear tokens from localStorage
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        })
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null })
        
        try {
          const updatedUser = await authAPI.updateProfile(data)
          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'Failed to update profile'
          set({
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)