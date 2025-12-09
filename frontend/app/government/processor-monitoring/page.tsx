'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { formatNumber } from '@/lib/utils';
import { Factory, MapPin, Package, TrendingUp, Filter, CheckCircle } from 'lucide-react';
import { INDIAN_STATES } from '@/lib/constants';

interface Processor {
  id: string;
  company_name: string;
  license_number: string;
  district: string;
  state: string;
  processing_capacity_mt_per_day: number;
  total_batches: number;
  completed_batches: number;
  completion_rate: number;
  total_input_quintals: number;
  total_output_quintals: number;
  processing_efficiency: number;
  total_bids: number;
  won_bids: number;
  bid_success_rate: number;
  is_verified: boolean;
  latitude: number | null;
  longitude: number | null;
}

function ProcessorMonitoringContent() {
  const [processors, setProcessors] = useState<Processor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('');
  const [stats, setStats] = useState({
    total_count: 0,
    total_processing_capacity: 0,
    avg_efficiency: 0
  });

  React.useEffect(() => {
    fetchProcessors();
  }, [selectedState]);

  const fetchProcessors = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedState) params.append('state', selectedState);

      const response = await fetch(`/api/government/processor-monitoring/?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setProcessors(data.data.processors);
        setStats({
          total_count: data.data.total_count,
          total_processing_capacity: data.data.total_processing_capacity,
          avg_efficiency: data.data.avg_efficiency
        });
      }
    } catch (error) {
      console.error('Failed to fetch processors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (efficiency >= 75) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    if (efficiency >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>;
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Processor Monitoring</h1>
        <p className="text-gray-600 mt-1">Track processing facilities and their performance metrics</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Processors</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_count}</p>
              </div>
              <Factory className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats.total_processing_capacity)} MT/day
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
                <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.avg_efficiency.toFixed(1)}%
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="flex items-end col-span-2">
              <button
                onClick={() => setSelectedState('')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filter
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processor List */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batches
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Efficiency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bid Success
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processors.map((processor) => (
                  <tr key={processor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center">
                          <Factory className="w-5 h-5 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {processor.company_name}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Lic: {processor.license_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        {processor.district}, {processor.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {processor.processing_capacity_mt_per_day.toFixed(2)} MT/day
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {processor.completed_batches}/{processor.total_batches}
                      </div>
                      <div className="text-xs text-gray-500">
                        {processor.completion_rate.toFixed(1)}% complete
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-gray-900">
                          {processor.processing_efficiency.toFixed(1)}%
                        </span>
                        {getEfficiencyBadge(processor.processing_efficiency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {processor.won_bids}/{processor.total_bids}
                      </div>
                      <div className="text-xs text-gray-500">
                        {processor.bid_success_rate.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {processor.is_verified ? (
                        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Pending
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {processors.length === 0 && (
            <div className="text-center py-12">
              <Factory className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No processors found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProcessorMonitoringPage() {
  return (
    <ProtectedRoute allowedRoles={['government']}>
      <DashboardLayout>
        <ProcessorMonitoringContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
