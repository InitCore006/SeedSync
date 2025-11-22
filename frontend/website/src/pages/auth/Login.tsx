import React from 'react'
import { Link } from 'react-router-dom'
import { LoginForm } from '@components/auth/LoginForm'
import { Card, CardContent } from '@components/common/Card'

export const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-navy-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-display font-bold text-navy-900">
              SeedSync
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-navy-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-neutral-600">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Form Card */}
        <Card>
          <CardContent className="p-8">
            <LoginForm />
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            Need help?{' '}
            <Link to="/contact" className="text-navy-600 hover:text-navy-800 font-medium">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}