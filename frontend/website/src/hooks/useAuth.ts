/* eslint-disable react-hooks/rules-of-hooks */
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export const useAuth = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, error, login, logout, clearError } = useAuthStore()

  const requireAuth = (redirectTo: string = '/login') => {
    useEffect(() => {
      if (!isAuthenticated && !isLoading) {
        navigate(redirectTo)
      }
    }, [isAuthenticated, isLoading])
  }

  const requireRole = (allowedRoles: string[]) => {
    useEffect(() => {
      if (user && !allowedRoles.includes(user.role)) {
        navigate('/unauthorized')
      }
    }, [user, allowedRoles])
  }

  const requireApproval = () => {
    useEffect(() => {
      if (user && user.approval_status !== 'APPROVED') {
        navigate('/pending-approval')
      }
    }, [user])
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
    requireAuth,
    requireRole,
    requireApproval,
  }
}