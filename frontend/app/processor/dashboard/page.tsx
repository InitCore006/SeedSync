'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useProcessorDashboard } from '@/lib/hooks/useAPI';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Package, TrendingUp, Factory, Boxes, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

function ProcessorDashboardContent() {
  const router = useRouter();
  const { dashboard, isError: error, isLoading } = useProcessorDashboard();
  
  if (isLoading) return <Loading fullScreen />;
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load dashboard data
        </div>
      </div>
    );
  }
  
  const stats = dashboard;
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Processor Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your processing operations and inventory</p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Bids</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats?.active_bids || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-blue-600"
              onClick={() => router.push('/processor/procurement')}
            >
              View Opportunities →
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing Batches</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats?.active_batches || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Factory className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-green-600"
              onClick={() => router.push('/processor/batches')}
            >
              View Batches →
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Raw Material Stock</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats?.raw_material_stock_mt || 0)} MT
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-yellow-600"
              onClick={() => router.push('/processor/inventory')}
            >
              View Inventory →
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Finished Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats?.finished_product_stock_mt || 0)} MT
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Boxes className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">Ready for sale</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Production Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Processing Batches</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recent_batches && stats.recent_batches.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_batches.map((batch: any) => (
                  <div key={batch.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Batch #{batch.batch_number}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {batch.crop_name} → {batch.product_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Input: {formatNumber(batch.input_quantity_kg)} kg
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <Badge variant="status" status={batch.status}>
                        {batch.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">
                        Output: {formatNumber(batch.output_quantity_kg || 0)} kg
                      </p>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push('/processor/batches')}
                >
                  View All Batches
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Factory className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="font-medium">No processing batches yet</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push('/processor/batches')}
                >
                  Create First Batch
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Production Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Avg Processing Time</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats?.avg_processing_days || 0} days
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Avg Yield Rate</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats?.avg_yield_rate || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats?.avg_yield_rate || 0}%` }} />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Quality Pass Rate</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats?.quality_pass_rate || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${stats?.quality_pass_rate || 0}%` }} />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Processed (FY)</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatNumber(stats?.total_processed_mt || 0)} MT
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Revenue Overview */}
      {stats?.monthly_revenue && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-2">
              {stats.monthly_revenue.map((month: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary rounded-t-lg"
                    style={{
                      height: `${(month.revenue / Math.max(...stats.monthly_revenue.map((m: any) => m.revenue))) * 100}%`,
                      minHeight: '20px',
                    }}
                  />
                  <p className="text-xs text-gray-600 mt-2">{month.month}</p>
                  <p className="text-xs font-semibold text-gray-900">
                    ₹{(month.revenue / 100000).toFixed(1)}L
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ProcessorDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['processor']}>
      <DashboardLayout>
        <ProcessorDashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
