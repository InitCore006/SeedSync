'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { Users, MapPin, TrendingUp, Package, Filter, CheckCircle } from 'lucide-react';
import { INDIAN_STATES, CROPS } from '@/lib/constants';

interface Farmer {
  id: string;
  full_name: string;
  phone_number: string;
  district: string;
  state: string;
  total_land_acres: number;
  primary_crops: string[];
  kyc_status: string;
  fpo_name: string | null;
  farming_experience_years: number;
  total_lots_created: number;
  total_earnings: number;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

function FarmerRegistryContent() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedKYC, setSelectedKYC] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [stats, setStats] = useState({ 
    total_count: 0, 
    displayed_count: 0,
    total_land_acres: 0,
    verified_count: 0,
    verification_rate: 0
  });

  React.useEffect(() => {
    fetchFarmers();
  }, [selectedState, selectedDistrict, selectedKYC, selectedCrop]);

  const fetchFarmers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedState) params.append('state', selectedState);
      if (selectedDistrict) params.append('district', selectedDistrict);
      if (selectedKYC) params.append('kyc_status', selectedKYC);
      if (selectedCrop) params.append('crop_type', selectedCrop);

      const response = await fetch(`/api/government/farmer-registry/?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setFarmers(data.data.farmers);
        setStats({
          total_count: data.data.total_count,
          displayed_count: data.data.displayed_count,
          total_land_acres: data.data.total_land_acres,
          verified_count: data.data.verified_count,
          verification_rate: data.data.verification_rate
        });
      }
    } catch (error) {
      console.error('Failed to fetch farmers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getKYCBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Farmer Registry</h1>
        <p className="text-gray-600 mt-1">Comprehensive database of all registered farmers</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Farmers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats.total_count)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Land</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats.total_land_acres)} Acres
                </p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats.verified_count)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verification Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.verification_rate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All States</option>
                {INDIAN_STATES.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
              <input
                type="text"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                placeholder="Enter district"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">KYC Status</label>
              <select
                value={selectedKYC}
                onChange={(e) => setSelectedKYC(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Crop Type</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Crops</option>
                {CROPS.map(crop => (
                  <option key={crop.value} value={crop.value}>{crop.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedState('');
                  setSelectedDistrict('');
                  setSelectedKYC('');
                  setSelectedCrop('');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Farmer List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Farmer Directory ({formatNumber(stats.displayed_count)} shown)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Farmer Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Land
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crops
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FPO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KYC Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {farmers.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {farmer.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {farmer.phone_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        {farmer.district}, {farmer.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {farmer.total_land_acres.toFixed(2)} acres
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {farmer.primary_crops.slice(0, 2).map((crop, idx) => (
                          <Badge key={idx} className="bg-green-100 text-green-800 text-xs">
                            {crop}
                          </Badge>
                        ))}
                        {farmer.primary_crops.length > 2 && (
                          <Badge className="bg-gray-100 text-gray-800 text-xs">
                            +{farmer.primary_crops.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {farmer.fpo_name || <span className="text-gray-400">Not joined</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(farmer.total_earnings)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getKYCBadge(farmer.kyc_status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {farmers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No farmers found matching your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function FarmerRegistryPage() {
  return (
    <ProtectedRoute allowedRoles={['government']}>
      <DashboardLayout>
        <FarmerRegistryContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
