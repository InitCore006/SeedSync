import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { processorService } from '../../services/processor.service';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Processor } from '../../types';

export const ProcessorDashboard: React.FC = () => {
  const [processor, setProcessor] = useState<Processor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProcessorProfile();
  }, []);

  const loadProcessorProfile = async () => {
    setIsLoading(true);
    const response = await processorService.getMyProfile();
    if (response.data) {
      setProcessor(response.data);
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

  if (!processor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Processor profile not found</p>
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
              {processor.company_name}
            </h1>
            <p className="text-gray-600 mt-2">
              Processor Code: {processor.processor_code}
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              processor.is_verified
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {processor.is_verified ? '✅ Verified' : '⏳ Pending Verification'}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Monthly Capacity"
          value={`${processor.monthly_capacity} qtl`}
          icon={<span className="text-2xl">⚙️</span>}
          color="blue"
        />
        <StatsCard
          title="Monthly Requirement"
          value={`${processor.monthly_requirement} qtl`}
          icon={<span className="text-2xl">📦</span>}
          color="green"
        />
        <StatsCard
          title="Active Orders"
          value="0"
          icon={<span className="text-2xl">🛒</span>}
          color="purple"
        />
        <StatsCard
          title="Production"
          value="0 qtl"
          icon={<span className="text-2xl">🏭</span>}
          color="yellow"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <p className="font-semibold text-gray-900">Orders</p>
              <p className="text-sm text-gray-600">Manage orders</p>
            </div>
          </Link>

          <Link
            to="/dashboard/production"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all"
          >
            <span className="text-3xl">⚙️</span>
            <div>
              <p className="font-semibold text-gray-900">Production</p>
              <p className="text-sm text-gray-600">Track production</p>
            </div>
          </Link>

          <Link
            to="/dashboard/profile"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <span className="text-3xl">🏭</span>
            <div>
              <p className="font-semibold text-gray-900">Profile</p>
              <p className="text-sm text-gray-600">Edit profile</p>
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
            <p className="text-sm font-medium text-gray-600">Business Scale</p>
            <p className="text-base text-gray-900 mt-1 capitalize">
              {processor.business_scale}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Location</p>
            <p className="text-base text-gray-900 mt-1">
              {processor.city}, {processor.state}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">GSTIN</p>
            <p className="text-base text-gray-900 mt-1">{processor.gstin}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">FSSAI License</p>
            <p className="text-base text-gray-900 mt-1">
              {processor.fssai_license}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};