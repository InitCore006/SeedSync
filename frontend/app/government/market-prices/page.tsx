'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { TrendingUp, Filter, DollarSign, BarChart3, AlertCircle } from 'lucide-react';
import { CROPS, INDIAN_STATES } from '@/lib/constants';

interface PriceSummary {
  avg_price: number;
  min_price: number;
  max_price: number;
  price_range: number;
}

interface CropPrice {
  crop_type: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  msp: number | null;
  price_vs_msp: number | null;
}

interface PriceTrend {
  date: string;
  avg_price: number;
}

function MarketPricesContent() {
  const [summary, setSummary] = useState<PriceSummary>({
    avg_price: 0,
    min_price: 0,
    max_price: 0,
    price_range: 0
  });
  const [cropPrices, setCropPrices] = useState<CropPrice[]>([]);
  const [priceTrends, setPriceTrends] = useState<PriceTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDays, setSelectedDays] = useState('30');

  React.useEffect(() => {
    fetchPrices();
  }, [selectedCrop, selectedState, selectedDays]);

  const fetchPrices = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCrop) params.append('crop_type', selectedCrop);
      if (selectedState) params.append('state', selectedState);
      params.append('days', selectedDays);

      const response = await fetch(`/api/government/market-prices/?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.data.summary);
        setCropPrices(data.data.crop_prices);
        setPriceTrends(data.data.price_trends);
      }
    } catch (error) {
      console.error('Failed to fetch prices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMSPBadge = (priceVsMsp: number | null) => {
    if (priceVsMsp === null) {
      return <Badge className="bg-gray-100 text-gray-800">No MSP</Badge>;
    }
    if (priceVsMsp >= 0) {
      return <Badge className="bg-green-100 text-green-800">Above MSP</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">Below MSP</Badge>;
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Market Prices</h1>
        <p className="text-gray-600 mt-1">Monitor market prices and MSP comparison</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.avg_price)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Min Price</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.min_price)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Max Price</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.max_price)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Price Range</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.price_range)}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
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
                  setSelectedState('');
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

      {/* Crop-wise Prices */}
      <Card>
        <CardHeader>
          <CardTitle>Crop-wise Market Prices</CardTitle>
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
                    Avg Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MSP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cropPrices.map((crop, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {crop.crop_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatCurrency(crop.avg_price)}/Q
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(crop.min_price)}/Q
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(crop.max_price)}/Q
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {crop.msp ? `${formatCurrency(crop.msp)}/Q` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getMSPBadge(crop.price_vs_msp)}
                      {crop.price_vs_msp !== null && (
                        <div className="text-xs text-gray-500 mt-1">
                          {crop.price_vs_msp >= 0 ? '+' : ''}
                          {formatCurrency(crop.price_vs_msp)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {cropPrices.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No price data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Price Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {priceTrends.slice(0, 15).map((trend, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">{trend.date}</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(trend.avg_price)}/Q
                </span>
              </div>
            ))}
          </div>
          {priceTrends.length === 0 && (
            <div className="text-center py-8">
              <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No trend data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function MarketPricesPage() {
  return (
    <ProtectedRoute allowedRoles={['government']}>
      <DashboardLayout>
        <MarketPricesContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
