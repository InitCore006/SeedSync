import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '@hooks/useAuth'
import { Button } from '@components/common/Button'

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-display font-bold text-navy-900">
              SeedSync
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-neutral-700 hover:text-navy-900 font-medium transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-neutral-700 hover:text-navy-900 font-medium transition-colors">
              About
            </Link>
            <Link to="/features" className="text-neutral-700 hover:text-navy-900 font-medium transition-colors">
              Features
            </Link>
            <Link to="/contact" className="text-neutral-700 hover:text-navy-900 font-medium transition-colors">
              Contact
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="primary" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-navy-800 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.first_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-navy-900">
                      {user?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-neutral-500">{user?.role_display}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-neutral-400" />
                </button>

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-strong border border-neutral-200 py-2">
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Link>
                    <hr className="my-2 border-neutral-200" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-600 hover:text-navy-900"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200">
          <nav className="px-4 py-4 space-y-3">
            <Link
              to="/"
              className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/features"
              className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/contact"
              className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            
            {!isAuthenticated ? (
              <div className="pt-4 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    navigate('/login')
                    setMobileMenuOpen(false)
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    navigate('/register')
                    setMobileMenuOpen(false)
                  }}
                >
                  Register
                </Button>
              </div>
            ) : (
              <div className="pt-4 border-t border-neutral-200 space-y-2">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-navy-900">{user?.full_name}</p>
                  <p className="text-xs text-neutral-500">{user?.role_display}</p>
                </div>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}