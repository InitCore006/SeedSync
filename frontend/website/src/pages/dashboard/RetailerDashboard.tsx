import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { retailerService } from '../../services/retailer.service';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Retailer } from '../../types';

export const RetailerDashboard: React.FC = () => {
  const [retailer, setRetailer] = useState<Retailer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRetailerProfile();
  }, []);

  const loadRetailerProfile = async () => {
    setIsLoading(true);
    const response = await retailerService.getMyProfile();
    if (response.data) {
      setRetailer(response.data);
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

  if (!retailer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Retailer profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {retailer.business_name}
            </h1>
            <p className="text-gray-600 mt-2">
              Retailer Code: {retailer.retailer_code}
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              retailer.is_verified
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {retailer.is_verified ? '✅ Verified' : '⏳ Pending Verification'}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Monthly Requirement"
          value={`${retailer.monthly_requirement} qtl`}
          icon={<span className="text-2xl">📦</span>}
          color="blue"
        />
        <StatsCard
          title="Active Orders"
          value="0"
          icon={<span className="text-2xl">🛒</span>}
          color="purple"
        />
        <StatsCard
          title="Total Spent"
          value="₹0"
          icon={<span className="text-2xl">💰</span>}
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/dashboard/fpos"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <span className="text-3xl">🏢</span>
            <div>
              <p className="font-semibold text-gray-900">Browse FPOs</p>
              <p className="text-sm text-gray-600">Find suppliers</p>
            </div>
          </Link>

          <Link
            to="/dashboard/orders"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <span className="text-3xl">🛒</span>
            <div>
              <p className="font-semibold text-gray-900">My Orders</p>
              <p className="text-sm text-gray-600">View orders</p>
            </div>
          </Link>

          <Link
            to="/dashboard/payments"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <span className="text-3xl">💳</span>
            <div>
              <p className="font-semibold text-gray-900">Payments</p>
              <p className="text-sm text-gray-600">Payment history</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Business Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Business Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Business Type</p>
            <p className="text-base text-gray-900 mt-1 capitalize">
              {retailer.retailer_type}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Location</p>
            <p className="text-base text-gray-900 mt-1">
              {retailer.city}, {retailer.state}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">GSTIN</p>
            <p className="text-base text-gray-900 mt-1">{retailer.gstin}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Status</p>
            <p className="text-base text-gray-900 mt-1">
              {retailer.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};