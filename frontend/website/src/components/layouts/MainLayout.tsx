import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Sprout, FileText } from 'lucide-react'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  const isHomePage = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation Bar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-lg' : 'bg-white border-b-2 border-gray-200'
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-gray-200">
                <img
                  src="/images/logo.png"
                  alt="SeedSync Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900 block">SeedSync</span>
                <span className="text-xs text-gray-600">Oilseed Value Chain Platform</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <Link
                to="/"
                className={`text-gray-700 hover:text-primary-500 transition-colors font-semibold ${
                  location.pathname === '/' ? 'text-primary-500' : ''
                }`}
              >
                Home
              </Link>
              
                <>
                  <a
                    href="#features"
                    className="text-gray-700 hover:text-primary-500 transition-colors font-semibold"
                  >
                    Features
                  </a>
                  <a
                    href="#technology"
                    className="text-gray-700 hover:text-primary-500 transition-colors font-semibold"
                  >
                    Technology
                  </a>
                  <a
                    href="#stakeholders"
                    className="text-gray-700 hover:text-primary-500 transition-colors font-semibold"
                  >
                    Stakeholders
                  </a>
                  <a
                    href="#impact"
                    className="text-gray-700 hover:text-primary-500 transition-colors font-semibold"
                  >
                    Impact
                  </a>
                </>
              
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                to="/login"
                className="px-6 py-2.5 text-primary-500 hover:text-primary-700 transition-colors font-bold"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-700 shadow-md hover:shadow-lg transition-all duration-300 font-bold"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-primary-500 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t-2 border-gray-200">
              <div className="flex flex-col gap-4 pt-4">
                <Link
                  to="/"
                  className={`text-gray-700 hover:text-primary-500 transition-colors font-semibold ${
                    location.pathname === '/' ? 'text-primary-500' : ''
                  }`}
                >
                  Home
                </Link>
                {isHomePage && (
                  <>
                    <a
                      href="#features"
                      className="text-gray-700 hover:text-primary-500 transition-colors font-semibold"
                    >
                      Features
                    </a>
                    <a
                      href="#technology"
                      className="text-gray-700 hover:text-primary-500 transition-colors font-semibold"
                    >
                      Technology
                    </a>
                    <a
                      href="#stakeholders"
                      className="text-gray-700 hover:text-primary-500 transition-colors font-semibold"
                    >
                      Stakeholders
                    </a>
                    <a
                      href="#impact"
                      className="text-gray-700 hover:text-primary-500 transition-colors font-semibold"
                    >
                      Impact
                    </a>
                  </>
                )}
                <div className="flex flex-col gap-3 pt-4 border-t-2 border-gray-200">
                  <Link
                    to="/login"
                    className="px-4 py-2.5 text-center text-primary-500 border-2 border-primary-500 rounded-lg hover:bg-primary-50 font-bold transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2.5 text-center bg-primary-500 text-white rounded-lg hover:bg-primary-700 font-bold transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-20">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Sprout className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">SeedSync</div>
                  <div className="text-sm text-gray-400">Oilseed Value Chain Platform</div>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
                AI-enabled digital ecosystem connecting farmers, FPOs, processors, and markets with
                blockchain traceability for India's oilseed self-reliance.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-400 font-medium">Platform Online</span>
                </div>
                <div className="h-4 w-px bg-gray-700"></div>
                <span className="text-sm text-gray-400 font-medium">99.9% Uptime</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Platform</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-white transition-colors font-medium"
                  >
                    Home
                  </Link>
                </li>
                {isHomePage && (
                  <>
                    <li>
                      <a
                        href="#features"
                        className="text-gray-400 hover:text-white transition-colors font-medium"
                      >
                        Features
                      </a>
                    </li>
                    <li>
                      <a
                        href="#technology"
                        className="text-gray-400 hover:text-white transition-colors font-medium"
                      >
                        Technology
                      </a>
                    </li>
                    <li>
                      <a
                        href="#stakeholders"
                        className="text-gray-400 hover:text-white transition-colors font-medium"
                      >
                        Stakeholders
                      </a>
                    </li>
                    <li>
                      <a
                        href="#impact"
                        className="text-gray-400 hover:text-white transition-colors font-medium"
                      >
                        Impact
                      </a>
                    </li>
                  </>
                )}
                <li>
                  <Link
                    to="/register"
                    className="text-gray-400 hover:text-white transition-colors font-medium"
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors font-medium">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors font-medium">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors font-medium">
                    Support Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors font-medium">
                    Training Videos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors font-medium">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t-2 border-gray-800">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} SeedSync. All rights reserved.
              </p>

              {/* Developer Credit */}
              <div className="text-center">
                <p className="text-gray-600 text-xs mb-2">Developed by</p>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-md">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-base font-bold text-primary-500">
                    InitCore Developer's Group
                  </span>
                </div>
                <p className="text-gray-600 text-xs mt-1">Smart India Hackathon 2024</p>
              </div>

              {/* Legal Links */}
              <div className="flex items-center gap-4">
                <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
                <span className="text-gray-700">•</span>
                <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout