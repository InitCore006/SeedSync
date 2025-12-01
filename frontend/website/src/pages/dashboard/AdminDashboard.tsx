import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { dashboardService } from '../../services/dashboard.service';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DashboardStats } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    const response = await dashboardService.getAdminStats();
    if (response.data) {
      setStats(response.data);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage and monitor the entire SeedSync platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.total_users || 0}
          icon={<span className="text-2xl">👥</span>}
          color="blue"
        />
        <StatsCard
          title="Total FPOs"
          value={stats?.total_fpos || 0}
          icon={<span className="text-2xl">🏢</span>}
          color="green"
        />
        <StatsCard
          title="Total Retailers"
          value={stats?.total_retailers || 0}
          icon={<span className="text-2xl">🏪</span>}
          color="purple"
        />
        <StatsCard
          title="Total Processors"
          value={stats?.total_processors || 0}
          icon={<span className="text-2xl">🏭</span>}
          color="yellow"
        />
      </div>

      {/* Verification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard
          title="Verified Entities"
          value={stats?.verified_entities || 0}
          icon={<span className="text-2xl">✅</span>}
          color="green"
        />
        <StatsCard
          title="Pending Verification"
          value={stats?.pending_verification || 0}
          icon={<span className="text-2xl">⏳</span>}
          color="yellow"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/dashboard/verifications"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <span className="text-3xl">✅</span>
            <div>
              <p className="font-semibold text-gray-900">Review Verifications</p>
              <p className="text-sm text-gray-600">
                {stats?.pending_verification || 0} pending
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard/users"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <span className="text-3xl">👥</span>
            <div>
              <p className="font-semibold text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-600">View all users</p>
            </div>
          </Link>

          <Link
            to="/dashboard/fpos"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <span className="text-3xl">🏢</span>
            <div>
              <p className="font-semibold text-gray-900">View FPOs</p>
              <p className="text-sm text-gray-600">All FPO listings</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">🏢</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                New FPO Registration
              </p>
              <p className="text-xs text-gray-600">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Retailer Verified
              </p>
              <p className="text-xs text-gray-600">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">🏭</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                New Processor Registration
              </p>
              <p className="text-xs text-gray-600">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};