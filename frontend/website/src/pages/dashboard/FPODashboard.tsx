import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { fpoService } from '../../services/fpo.service';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FPO } from '../../types';
import { useAuthStore } from '../../store/authStore';

export const FPODashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [fpo, setFpo] = useState<FPO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFPOProfile();
  }, []);

  const loadFPOProfile = async () => {
    setIsLoading(true);
    const response = await fpoService.getMyProfile();
    if (response.data) {
      setFpo(response.data);
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

  if (!fpo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">FPO profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{fpo.name}</h1>
            <p className="text-gray-600 mt-2">FPO Code: {fpo.fpo_code}</p>
          </div>
          <div
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              fpo.is_verified
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {fpo.is_verified ? '✅ Verified' : '⏳ Pending Verification'}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Land Area"
          value={`${fpo.total_land_area} acres`}
          icon={<span className="text-2xl">🌾</span>}
          color="green"
        />
        <StatsCard
          title="Monthly Capacity"
          value={`${fpo.monthly_capacity} qtl`}
          icon={<span className="text-2xl">📦</span>}
          color="blue"
        />
        <StatsCard
          title="Active Farmers"
          value="0"
          icon={<span className="text-2xl">👨‍🌾</span>}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/dashboard/farmers"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <span className="text-3xl">👨‍🌾</span>
            <div>
              <p className="font-semibold text-gray-900">Manage Farmers</p>
              <p className="text-sm text-gray-600">View all farmers</p>
            </div>
          </Link>

          <Link
            to="/dashboard/inventory"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <span className="text-3xl">📦</span>
            <div>
              <p className="font-semibold text-gray-900">Inventory</p>
              <p className="text-sm text-gray-600">Manage stock</p>
            </div>
          </Link>

          <Link
            to="/dashboard/orders"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <span className="text-3xl">🛒</span>
            <div>
              <p className="font-semibold text-gray-900">Orders</p>
              <p className="text-sm text-gray-600">View all orders</p>
            </div>
          </Link>
        </div>
      </div>

      {/* FPO Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">FPO Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Location</p>
            <p className="text-base text-gray-900 mt-1">
              {fpo.district}, {fpo.state}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Contact Person</p>
            <p className="text-base text-gray-900 mt-1">{fpo.contact_person}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Contact Phone</p>
            <p className="text-base text-gray-900 mt-1">{fpo.contact_phone}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Contact Email</p>
            <p className="text-base text-gray-900 mt-1">{fpo.contact_email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};