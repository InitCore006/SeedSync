import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Store
import { useAuthStore } from './store/authStore';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import { FPORegistrationPage } from './pages/public/FPORegistrationPage';
import { RetailerRegistrationPage } from './pages/public/RetailerRegistrationPage';
import { ProcessorRegistrationPage } from './pages/public/ProcessorRegistrationPage';

// Dashboard Pages
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { FPODashboard } from './pages/dashboard/FPODashboard';
import { RetailerDashboard } from './pages/dashboard/RetailerDashboard';
import { ProcessorDashboard } from './pages/dashboard/ProcessorDashboard';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Auth Initializer Component
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    // You can add token validation or user profile loading here
    if (isAuthenticated && token) {
      // Optional: Load user profile or validate token
      console.log('User authenticated');
    }
  }, [isAuthenticated, token]);

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
                  <Route path="/" element={<MainLayout><LandingPage /></MainLayout>} />
            <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
            <Route path="/register" element={<MainLayout><RegisterPage /></MainLayout>} />
            <Route path="/register/fpo" element={<MainLayout><FPORegistrationPage /></MainLayout>} />
            <Route path="/register/retailer" element={<MainLayout><RetailerRegistrationPage /></MainLayout>} />
            <Route path="/register/processor" element={<MainLayout><ProcessorRegistrationPage /></MainLayout>} />
        <Route path="/unauthorized" element={<MainLayout><UnauthorizedPage /></MainLayout>} />


            {/* ========== AUTH ROUTES (No Layout) ========== */}
            <Route path="/login" element={<LoginPage />} />

            {/* ========== PROTECTED DASHBOARD ROUTES WITH DashboardLayout ========== */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Generic Dashboard - Role-based redirect */}
              <Route path="/dashboard" element={<RoleBasedDashboard />} />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Users Management</h1>
                      <p className="text-gray-600 mt-2">Manage all users in the system</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/fpos"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">FPOs Management</h1>
                      <p className="text-gray-600 mt-2">Manage all FPOs</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/retailers"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Retailers Management</h1>
                      <p className="text-gray-600 mt-2">Manage all retailers</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/processors"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Processors Management</h1>
                      <p className="text-gray-600 mt-2">Manage all processors</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/verifications"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Verifications</h1>
                      <p className="text-gray-600 mt-2">Review pending verifications</p>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* FPO Admin Routes */}
              <Route
                path="/fpo-admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['fpo_admin']}>
                    <FPODashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fpo-admin/fpo"
                element={
                  <ProtectedRoute allowedRoles={['fpo_admin']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">My FPO Details</h1>
                      <p className="text-gray-600 mt-2">View and edit FPO information</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fpo-admin/farmers"
                element={
                  <ProtectedRoute allowedRoles={['fpo_admin']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Farmers Management</h1>
                      <p className="text-gray-600 mt-2">Manage FPO farmers</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fpo-admin/inventory"
                element={
                  <ProtectedRoute allowedRoles={['fpo_admin']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Inventory Management</h1>
                      <p className="text-gray-600 mt-2">Manage inventory and stock</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fpo-admin/orders"
                element={
                  <ProtectedRoute allowedRoles={['fpo_admin']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Orders</h1>
                      <p className="text-gray-600 mt-2">View and manage orders</p>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Retailer Routes */}
              <Route
                path="/retailer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['retailer']}>
                    <RetailerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/retailer/profile"
                element={
                  <ProtectedRoute allowedRoles={['retailer']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">My Profile</h1>
                      <p className="text-gray-600 mt-2">View and edit profile</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/retailer/fpos"
                element={
                  <ProtectedRoute allowedRoles={['retailer']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Browse FPOs</h1>
                      <p className="text-gray-600 mt-2">Find suppliers</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/retailer/orders"
                element={
                  <ProtectedRoute allowedRoles={['retailer']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">My Orders</h1>
                      <p className="text-gray-600 mt-2">Track your orders</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/retailer/payments"
                element={
                  <ProtectedRoute allowedRoles={['retailer']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Payments</h1>
                      <p className="text-gray-600 mt-2">Payment history and details</p>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Processor Routes */}
              <Route
                path="/processor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['processor']}>
                    <ProcessorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/processor/profile"
                element={
                  <ProtectedRoute allowedRoles={['processor']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">My Profile</h1>
                      <p className="text-gray-600 mt-2">View and edit profile</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/processor/fpos"
                element={
                  <ProtectedRoute allowedRoles={['processor']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Browse FPOs</h1>
                      <p className="text-gray-600 mt-2">Find suppliers</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/processor/orders"
                element={
                  <ProtectedRoute allowedRoles={['processor']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Orders</h1>
                      <p className="text-gray-600 mt-2">Manage orders</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/processor/production"
                element={
                  <ProtectedRoute allowedRoles={['processor']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Production Tracking</h1>
                      <p className="text-gray-600 mt-2">Monitor production activities</p>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Farmer Routes (if needed in future) */}
              <Route
                path="/farmer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['farmer']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Farmer Dashboard</h1>
                      <p className="text-gray-600 mt-2">Welcome, Farmer!</p>
                    </div>
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* ========== FALLBACK ROUTES ========== */}
            <Route path="*" element={<Navigate to="/" replace />} />
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
  );
}

// Role-based dashboard component
const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'farmer':
      return <Navigate to="/farmer/dashboard" replace />;
    case 'fpo_admin':
      return <Navigate to="/fpo-admin/dashboard" replace />;
    case 'processor':
      return <Navigate to="/processor/dashboard" replace />;
    case 'retailer':
      return <Navigate to="/retailer/dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

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
  );
};

export default App;