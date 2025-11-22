import React, { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Building2,
  Truck,
  Package,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
} from 'lucide-react'
import { useAuth } from '@hooks/useAuth'
import { cn } from '@lib/utils'
import { Badge } from '@components/common/Badge'

interface NavItem {
  name: string
  path: string
  icon: React.ReactNode
  badge?: number
  roles?: string[]
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    name: 'Members',
    path: '/dashboard/members',
    icon: <Users className="h-5 w-5" />,
    roles: ['FPO'],
  },
  {
    name: 'Warehouses',
    path: '/dashboard/warehouses',
    icon: <Building2 className="h-5 w-5" />,
    roles: ['FPO', 'PROCESSOR', 'LOGISTICS'],
  },
  {
    name: 'Vehicles',
    path: '/dashboard/vehicles',
    icon: <Truck className="h-5 w-5" />,
    roles: ['FPO', 'LOGISTICS'],
  },
  {
    name: 'Inventory',
    path: '/dashboard/inventory',
    icon: <Package className="h-5 w-5" />,
    roles: ['FPO', 'PROCESSOR', 'RETAILER'],
  },
  {
    name: 'Orders',
    path: '/dashboard/orders',
    icon: <FileText className="h-5 w-5" />,
    badge: 5,
  },
]

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filteredNavigation = navigationItems.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role))
  )

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-neutral-600 hover:text-navy-900"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-navy-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="hidden lg:block text-xl font-display font-bold text-navy-900">
              SeedSync
            </span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-neutral-600 hover:text-navy-900">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-neutral-100"
              >
                <div className="w-8 h-8 bg-navy-800 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.first_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-navy-900">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-neutral-500">{user?.role_display}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-strong border border-neutral-200 py-2">
                  <Link
                    to="/dashboard/profile"
                    className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Link>
                  <Link
                    to="/help"
                    className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <HelpCircle className="h-4 w-4 mr-3" />
                    Help & Support
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
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-neutral-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Close Button */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-neutral-200">
              <span className="text-lg font-semibold text-navy-900">Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-neutral-600 hover:text-navy-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-lg transition-colors',
                      isActive
                        ? 'bg-navy-800 text-white'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.badge && (
                      <Badge variant="tangerine" size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-neutral-200">
              <div className="bg-navy-50 rounded-lg p-4">
                <p className="text-sm font-medium text-navy-900 mb-1">
                  Need Help?
                </p>
                <p className="text-xs text-neutral-600 mb-3">
                  Contact our support team
                </p>
                <Link
                  to="/help"
                  className="text-xs font-medium text-navy-600 hover:text-navy-800"
                >
                  Get Support →
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}