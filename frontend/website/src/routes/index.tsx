import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'

// Layouts
import { Header } from '@components/layout/Header'
import { Footer } from '@components/layout/Footer'
import { DashboardLayout } from '@components/layout/DashboardLayout'

// Public Pages
import { Home } from '@pages/public/Home'
import { About } from '@pages/public/About'
import { Features } from '@pages/public/Features'
import { Contact } from '@pages/public/Contact'

// Auth Pages
import { Login } from '@pages/auth/Login'
import { Registration } from '@pages/auth/Registration'
import { RegistrationSuccess } from '@pages/auth/RegistrationSuccess'
import { ForgotPassword } from '@pages/auth/ForgotPassword'
import { ResetPassword } from '@pages/auth/ResetPassword'

// Dashboard Pages
import { Dashboard } from '@pages/dashboard/Dashboard'
import { Profile } from '@pages/dashboard/Profile'
import { Members } from '@pages/dashboard/Members'
import { Warehouses } from '@pages/dashboard/Warehouses'
import { Vehicles } from '@pages/dashboard/Vehicles'
import { Inventory } from '@pages/dashboard/Inventory'
import { Orders } from '@pages/dashboard/Orders'

// Error Pages
import { NotFound } from '@pages/errors/NotFound'

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />
      <Route
        path="/about"
        element={
          <PublicLayout>
            <About />
          </PublicLayout>
        }
      />
      <Route
        path="/features"
        element={
          <PublicLayout>
            <Features />
          </PublicLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <PublicLayout>
            <Contact />
          </PublicLayout>
        }
      />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Registration />
          </PublicRoute>
        }
      />
      <Route
        path="/register/:type"
        element={
          <PublicRoute>
            <Registration />
          </PublicRoute>
        }
      />
      <Route path="/registration-success" element={<RegistrationSuccess />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="members" element={<Members />} />
        <Route path="warehouses" element={<Warehouses />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="orders" element={<Orders />} />
      </Route>

      {/* Error Routes */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}