'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { ShoppingCart, MapPin, Package, TrendingUp, Filter, CheckCircle } from 'lucide-react';
import { INDIAN_STATES } from '@/lib/constants';

interface Retailer {
  id: string;
  business_name: string;
  gstin: string;
  district: string;
  state: string;
  total_orders: number;
  completed_orders: number;
  order_fulfillment_rate: number;
  total_purchase_value: number;
  is_verified: boolean;
  latitude: number | null;
  longitude: number | null;
}

function RetailerAnalyticsContent() {
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('');
  const [stats, setStats] = useState({
    total_count: 0,
    total_transaction_value: 0
  });

  React.useEffect(() => {
    fetchRetailers();
  }, [selectedState]);

  const fetchRetailers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedState) params.append('state', selectedState);

      const response = await fetch(`/api/government/retailer-analytics/?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setRetailers(data.data.retailers);
        setStats({
          total_count: data.data.total_count,
          total_transaction_value: data.data.total_transaction_value
        });
      }
    } catch (error) {
      console.error('Failed to fetch retailers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFulfillmentBadge = (rate: number) => {
    if (rate >= 95) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (rate >= 80) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    if (rate >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>;
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Retailer Analytics</h1>
        <p className="text-gray-600 mt-1">Monitor retailer performance and transaction trends</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Retailers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_count}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transaction Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.total_transaction_value)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
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

      {/* Retailer List */}
      <Card>
        <CardHeader>
          <CardTitle>Retailer Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fulfillment Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {retailers.map((retailer) => (
                  <tr key={retailer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center">
                          <ShoppingCart className="w-5 h-5 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {retailer.business_name}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          GSTIN: {retailer.gstin}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        {retailer.district}, {retailer.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {retailer.completed_orders}/{retailer.total_orders}
                      </div>
                      <div className="text-xs text-gray-500">
                        Completed
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-gray-900">
                          {retailer.order_fulfillment_rate.toFixed(1)}%
                        </span>
                        {getFulfillmentBadge(retailer.order_fulfillment_rate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(retailer.total_purchase_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {retailer.is_verified ? (
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

          {retailers.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No retailers found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RetailerAnalyticsPage() {
  return (
    <ProtectedRoute allowedRoles={['government']}>
      <DashboardLayout>
        <RetailerAnalyticsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
