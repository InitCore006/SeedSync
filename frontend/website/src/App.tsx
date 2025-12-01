import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

// Layout
import MainLayout from './components/layouts/MainLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

// Store
import { useAuthStore } from './store/authStore'

// Pages
import LandingPage from '@pages/public/LandingPage'
import {LoginPage} from '@pages/public/LoginPage'
import RegisterPage from '@pages/public/RegisterPage'
import { FPORegistrationPage } from './pages/public/FPORegistrationPage'
import { RetailerRegistrationPage } from './pages/public/RetailerRegistrationPage'
import { ProcessorRegistrationPage } from './pages/public/ProcessorRegistrationPage'

// Dashboards (uncomment when ready)
// import FarmerDashboard from '@pages/farmer/Dashboard'
// import FPOAdminDashboard from '@pages/fpo-admin/Dashboard'
// import ProcessorDashboard from '@pages/processor/Dashboard'
// import RetailerDashboard from '@pages/retailer/Dashboard'
// import AdminDashboard from '@pages/admin/Dashboard'

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
})

// Auth Initializer Component
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loadUser } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      loadUser()
    }
  }, [isAuthenticated, loadUser])

  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
            {/* ========== PUBLIC ROUTES (WITH MainLayout) ========== */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <LandingPage />
                </MainLayout>
              }
            />
            
            <Route
              path="/register"
              element={
                <MainLayout>
                  <RegisterPage />
                </MainLayout>
              }
            />
            
            <Route
              path="/register/fpo"
              element={
                <MainLayout>
                  <FPORegistrationPage />
                </MainLayout>
              }
            />
            
            <Route
              path="/register/retailer"
              element={
                <MainLayout>
                  <RetailerRegistrationPage />
                </MainLayout>
              }
            />
            
            <Route
              path="/register/processor"
              element={
                <MainLayout>
                  <ProcessorRegistrationPage />
                </MainLayout>
              }
            />

            {/* ========== AUTH ROUTES (WITHOUT MainLayout) ========== */}
            <Route path="/login" element={<LoginPage />} />

            {/* ========== PROTECTED ROUTES ========== */}
            
            {/* Farmer Dashboard */}
            {/* <Route
              path="/farmer/*"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            /> */}

            {/* FPO Admin Dashboard */}
            {/* <Route
              path="/fpo-admin/*"
              element={
                <ProtectedRoute allowedRoles={['fpo_admin']}>
                  <FPOAdminDashboard />
                </ProtectedRoute>
              }
            /> */}

            {/* Processor Dashboard */}
            {/* <Route
              path="/processor/*"
              element={
                <ProtectedRoute allowedRoles={['processor']}>
                  <ProcessorDashboard />
                </ProtectedRoute>
              }
            /> */}

            {/* Retailer Dashboard */}
            {/* <Route
              path="/retailer/*"
              element={
                <ProtectedRoute allowedRoles={['retailer']}>
                  <RetailerDashboard />
                </ProtectedRoute>
              }
            /> */}

            {/* Admin Dashboard */}
            {/* <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            /> */}

            {/* Generic Dashboard Route - Redirects based on role */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleBasedRedirect />
                </ProtectedRoute>
              }
            />

            {/* Unauthorized Page */}
            <Route
              path="/unauthorized"
              element={
                <MainLayout>
                  <UnauthorizedPage />
                </MainLayout>
              }
            />

            {/* Fallback - WITH MainLayout */}
            <Route
              path="*"
              element={
                <MainLayout>
                  <Navigate to="/" replace />
                </MainLayout>
              }
            />
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'text-sm',
              success: {
                style: {
                  background: '#10b981',
                  color: '#fff',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
              },
            }}
          />
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// Role-based redirect component
const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Redirect based on user role
  switch (user.role) {
    case 'farmer':
      return <Navigate to="/farmer/dashboard" replace />
    case 'fpo_admin':
      return <Navigate to="/fpo-admin/dashboard" replace />
    case 'processor':
      return <Navigate to="/processor/dashboard" replace />
    case 'retailer':
      return <Navigate to="/retailer/dashboard" replace />
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />
    default:
      return <Navigate to="/" replace />
  }
}

// Unauthorized page component
const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
            <a
              href="/dashboard"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App