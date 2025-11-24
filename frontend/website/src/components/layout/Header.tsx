import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, User, LogOut, Settings, ChevronDown, Globe } from 'lucide-react'
import { useAuth } from '@hooks/useAuth'
import { Button } from '@components/common/Button'

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'mr', name: 'मराठी' },
  { code: 'gu', name: 'ગુજરાતી' },
]

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const languageMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setLanguageMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    setProfileMenuOpen(false)
    navigate('/login')
  }

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code)
    setLanguageMenuOpen(false)
    // TODO: Implement i18n language change
  }

  const isActivePath = (path: string) => {
    return location.pathname === path
  }

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/market-prices', label: 'Market Prices' },
    { path: '/contact', label: 'Contact' },
  ]

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-navy-700 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <svg
                  className="w-7 h-7 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-tangerine-500 rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-bold text-navy-800 leading-tight">
                SeedSync
              </span>
              <span className="text-xs text-slate-500 font-medium tracking-wide">
                National Oilseed Mission
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${
                    isActivePath(link.path)
                      ? 'text-navy-700 bg-navy-50'
                      : 'text-slate-600 hover:text-navy-700 hover:bg-slate-50'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Language Selector */}
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-navy-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="uppercase">{selectedLanguage}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {/* Language Dropdown */}
              {languageMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 animate-slide-down">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`
                        w-full text-left px-4 py-2 text-sm transition-colors
                        ${
                          selectedLanguage === lang.code
                            ? 'text-navy-700 bg-navy-50 font-medium'
                            : 'text-slate-600 hover:bg-slate-50'
                        }
                      `}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Section */}
            {!isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="text-slate-600 hover:text-navy-700"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                  className="bg-navy-700 hover:bg-navy-800 text-white shadow-sm"
                >
                  Register
                </Button>
              </div>
            ) : (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                >
                  <div className="w-8 h-8 bg-navy-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.first_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-sm font-medium text-navy-800 leading-tight">
                      {user?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-slate-500">{user?.role_display}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 animate-slide-down">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-navy-800">{user?.full_name}</p>
                      <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3 text-slate-400" />
                        Dashboard
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3 text-slate-400" />
                        Settings
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-navy-700 hover:bg-slate-50 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 shadow-md">
          <nav className="px-4 py-4 space-y-1 max-h-[calc(100vh-5rem)] overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  block px-4 py-3 rounded-lg font-medium transition-colors
                  ${
                    isActivePath(link.path)
                      ? 'text-navy-700 bg-navy-50'
                      : 'text-slate-600 hover:bg-slate-50'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Language Selector */}
            <div className="pt-4 border-t border-slate-200">
              <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Language
              </p>
              <div className="space-y-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`
                      w-full text-left px-4 py-2 rounded-lg transition-colors
                      ${
                        selectedLanguage === lang.code
                          ? 'text-navy-700 bg-navy-50 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      }
                    `}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Auth Section */}
            {!isAuthenticated ? (
              <div className="pt-4 space-y-2 border-t border-slate-200">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-slate-600"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  className="w-full justify-center bg-navy-700 hover:bg-navy-800"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-200 space-y-1">
                <div className="px-4 py-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-semibold text-navy-800">{user?.full_name}</p>
                  <p className="text-xs text-slate-500 mt-1">{user?.role_display}</p>
                </div>
                <Link
                  to="/dashboard"
                  className="flex items-center px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <User className="h-5 w-5 mr-3 text-slate-400" />
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Settings className="h-5 w-5 mr-3 text-slate-400" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-3" />
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