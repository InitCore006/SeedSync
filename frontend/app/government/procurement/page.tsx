'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { Package, TrendingUp, Filter, DollarSign, BarChart3 } from 'lucide-react';
import { CROPS } from '@/lib/constants';

interface ProcurementSummary {
  total_lots: number;
  total_volume_quintals: number;
  avg_price: number;
  total_value: number;
}

interface CropBreakdown {
  crop_type: string;
  total_volume: number;
  avg_price: number;
  lot_count: number;
}

interface DailyTrend {
  date: string;
  volume: number;
  count: number;
}

interface StatusDistribution {
  status: string;
  count: number;
}

function ProcurementAnalyticsContent() {
  const [summary, setSummary] = useState<ProcurementSummary>({
    total_lots: 0,
    total_volume_quintals: 0,
    avg_price: 0,
    total_value: 0
  });
  const [cropBreakdown, setCropBreakdown] = useState<CropBreakdown[]>([]);
  const [dailyTrends, setDailyTrends] = useState<DailyTrend[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedDays, setSelectedDays] = useState('30');

  React.useEffect(() => {
    fetchAnalytics();
  }, [selectedCrop, selectedDays]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCrop) params.append('crop_type', selectedCrop);
      params.append('days', selectedDays);

      const response = await fetch(`/api/government/procurement-analytics/?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.data.summary);
        setCropBreakdown(data.data.crop_breakdown);
        setDailyTrends(data.data.daily_trends);
        setStatusDistribution(data.data.status_distribution);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      open: { color: 'bg-blue-100 text-blue-800', label: 'Open' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
      closed: { color: 'bg-green-100 text-green-800', label: 'Closed' },
      sold: { color: 'bg-purple-100 text-purple-800', label: 'Sold' }
    };
    const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Procurement Analytics</h1>
        <p className="text-gray-600 mt-1">Track procurement trends and market dynamics</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Lots</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(summary.total_lots)}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(summary.total_volume_quintals)} Q
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.avg_price)}/Q
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.total_value)}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Crop Type</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Crops</option>
                {CROPS.map((crop) => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={selectedDays}
                onChange={(e) => setSelectedDays(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>

            <div className="flex items-end col-span-2">
              <button
                onClick={() => {
                  setSelectedCrop('');
                  setSelectedDays('30');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crop Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Crop-wise Procurement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crop Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Volume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lot Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cropBreakdown.map((crop, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {crop.crop_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(crop.total_volume)} Quintals
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {crop.lot_count} lots
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(crop.avg_price)}/Q
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {cropBreakdown.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No procurement data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Procurement Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dailyTrends.slice(0, 10).map((trend, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{trend.date}</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatNumber(trend.volume)} Q
                    </p>
                    <p className="text-xs text-gray-500">{trend.count} lots</p>
                  </div>
                </div>
              ))}
            </div>
            {dailyTrends.length === 0 && (
              <div className="text-center py-8">
                <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No trend data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusDistribution.map((status, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(status.status)}
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {formatNumber(status.count)}
                  </span>
                </div>
              ))}
            </div>
            {statusDistribution.length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No status data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProcurementAnalyticsPage() {
  return (
    <ProtectedRoute allowedRoles={['government']}>
      <DashboardLayout>
        <ProcurementAnalyticsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
