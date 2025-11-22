import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@components/common/Button'
import { Home, ArrowLeft } from 'lucide-react'

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-64 h-64 bg-navy-100 rounded-full mb-8">
            <span className="text-9xl font-bold text-navy-300">404</span>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-xl text-neutral-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. The page might have been
          moved or deleted.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button
            variant="secondary"
            size="lg"
            leftIcon={<ArrowLeft className="h-5 w-5" />}
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          <Link to="/">
            <Button variant="primary" size="lg" leftIcon={<Home className="h-5 w-5" />}>
              Go to Homepage
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <p className="text-sm text-neutral-600 mb-4">You might be looking for:</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/about" className="text-sm text-navy-600 hover:text-navy-800 font-medium">
              About Us
            </Link>
            <span className="text-neutral-400">•</span>
            <Link to="/features" className="text-sm text-navy-600 hover:text-navy-800 font-medium">
              Features
            </Link>
            <span className="text-neutral-400">•</span>
            <Link to="/contact" className="text-sm text-navy-600 hover:text-navy-800 font-medium">
              Contact Support
            </Link>
            <span className="text-neutral-400">•</span>
            <Link to="/login" className="text-sm text-navy-600 hover:text-navy-800 font-medium">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}