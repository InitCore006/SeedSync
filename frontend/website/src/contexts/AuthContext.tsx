/* eslint-disable no-useless-catch */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '@lib/api'
import type { User, LoginCredentials } from '@/types/auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'seedsync_auth_token'
const REFRESH_TOKEN_KEY = 'seedsync_refresh_token'
const USER_KEY = 'seedsync_user'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY)
        const storedUser = localStorage.getItem(USER_KEY)

        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser as User)
          
          // Verify token is still valid
          try {
            const response = await authAPI.getCurrentUser()
            setUser(response.data as unknown as User)
            localStorage.setItem(USER_KEY, JSON.stringify(response.data))
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            // Token invalid, clear everything
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(REFRESH_TOKEN_KEY)
            localStorage.removeItem(USER_KEY)
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { access, refresh, user: userData } = response.data

      // Store tokens and user data
      localStorage.setItem(TOKEN_KEY, access)
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))

      setUser(userData as User)
    } catch (error) {
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    // Clear all stored data
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    
    setUser(null)
    navigate('/login')
  }, [navigate])

  const refreshToken = useCallback(async () => {
    try {
      const refresh = localStorage.getItem(REFRESH_TOKEN_KEY)
      
      if (!refresh) {
        throw new Error('No refresh token available')
      }

      const response = await authAPI.refreshToken(refresh)
      const { access } = response.data

      localStorage.setItem(TOKEN_KEY, access)
    } catch (error) {
      logout()
      throw error
    }
  }, [logout])

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null
      
      const updatedUser = { ...prevUser, ...userData }
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
      return updatedUser
    })
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshToken,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}