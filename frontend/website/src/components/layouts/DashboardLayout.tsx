import React, { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-based navigation
  const getNavItems = (): NavItem[] => {
    const rolePrefix = user?.role === 'fpo_admin' ? 'fpo-admin' : user?.role;
    
    switch (user?.role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
          { name: 'Users', path: '/admin/users', icon: '👥' },
          { name: 'FPOs', path: '/admin/fpos', icon: '🏢' },
          { name: 'Retailers', path: '/admin/retailers', icon: '🏪' },
          { name: 'Processors', path: '/admin/processors', icon: '🏭' },
          { name: 'Verifications', path: '/admin/verifications', icon: '✅' },
        ];
      case 'fpo_admin':
        return [
          { name: 'Dashboard', path: '/fpo-admin/dashboard', icon: '📊' },
          { name: 'My FPO', path: '/fpo-admin/fpo', icon: '🏢' },
          { name: 'Farmers', path: '/fpo-admin/farmers', icon: '👨‍🌾' },
          { name: 'Inventory', path: '/fpo-admin/inventory', icon: '📦' },
          { name: 'Orders', path: '/fpo-admin/orders', icon: '🛒' },
        ];
      case 'retailer':
        return [
          { name: 'Dashboard', path: '/retailer/dashboard', icon: '📊' },
          { name: 'My Profile', path: '/retailer/profile', icon: '🏪' },
          { name: 'Browse FPOs', path: '/retailer/fpos', icon: '🏢' },
          { name: 'Orders', path: '/retailer/orders', icon: '🛒' },
          { name: 'Payments', path: '/retailer/payments', icon: '💳' },
        ];
      case 'processor':
        return [
          { name: 'Dashboard', path: '/processor/dashboard', icon: '📊' },
          { name: 'My Profile', path: '/processor/profile', icon: '🏭' },
          { name: 'Browse FPOs', path: '/processor/fpos', icon: '🏢' },
          { name: 'Orders', path: '/processor/orders', icon: '🛒' },
          { name: 'Production', path: '/processor/production', icon: '⚙️' },
        ];
      case 'farmer':
        return [
          { name: 'Dashboard', path: '/farmer/dashboard', icon: '📊' },
          { name: 'My Profile', path: '/farmer/profile', icon: '👨‍🌾' },
          { name: 'My FPO', path: '/farmer/fpo', icon: '🏢' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-gray-200 w-64`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl">🌾</span>
              <span className="text-xl font-bold text-green-600">SeedSync</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">
                  {user?.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role === 'fpo_admin' ? 'FPO Admin' : user?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <span className="text-xl">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${isSidebarOpen ? 'lg:ml-64' : ''} transition-all`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ☰
            </button>

            <div className="flex items-center space-x-4">
              {!user?.is_verified && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                  <span>⚠️</span>
                  <span>Account pending verification</span>
                </div>
              )}
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};