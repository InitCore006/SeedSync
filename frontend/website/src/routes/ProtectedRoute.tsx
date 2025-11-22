import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { LoadingSpinner } from '@components/common/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}