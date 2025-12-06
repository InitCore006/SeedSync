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
                <p className="text-sm font-medium text-gray-600">Pending Bids</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats?.bidding?.pending_bids || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(stats?.bidding?.accepted_bids || 0)} accepted
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
                  {formatNumber(stats?.processing?.total_batches || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(stats?.processing?.total_processed_quintals || 0)} qtl processed
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
                <p className="text-sm font-medium text-gray-600">Procured Lots</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats?.procurement?.total_lots || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(stats?.procurement?.total_quantity_quintals || 0)} quintals
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
              onClick={() => router.push('/processor/procurement?view=history')}
            >
              View History →
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Extraction Efficiency</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats?.processing?.extraction_efficiency_percent || 0)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(stats?.processing?.total_oil_extracted_quintals || 0)} qtl oil
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-purple-600"
              onClick={() => router.push('/processor/inventory')}
            >
              View Inventory →
            </Button>
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
                        {batch.crop_type}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Processed: {formatNumber(batch.processed_quantity)} qtl
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <Badge variant="status" status="active">
                        Completed
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">
                        Oil: {formatNumber(batch.oil_extracted || 0)} qtl
                      </p>
                      <p className="text-xs text-gray-500">
                        Cake: {formatNumber(batch.cake_produced || 0)} qtl
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
            <CardTitle>Processing Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Bid Success Rate</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats?.bidding?.success_rate || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${stats?.bidding?.success_rate || 0}%` }} 
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Extraction Efficiency</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats?.processing?.extraction_efficiency_percent || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats?.processing?.extraction_efficiency_percent || 0}%` }} 
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Processing Capacity</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatNumber(stats?.processor_info?.processing_capacity || 0)} qtl/day
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Company</span>
                  <span className="text-xs font-medium text-gray-900">
                    {stats?.processor_info?.company_name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Location</span>
                  <span className="text-xs text-gray-600">
                    {stats?.processor_info?.city}, {stats?.processor_info?.state}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Monthly Trend */}
      {stats?.trends?.monthly_procurement && stats.trends.monthly_procurement.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Procurement Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-2">
              {stats.trends.monthly_procurement.map((month: any, index: number) => {
                const maxQty = Math.max(...stats.trends.monthly_procurement.map((m: any) => m.quantity_quintals));
                const height = maxQty > 0 ? (month.quantity_quintals / maxQty) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-primary rounded-t-lg hover:bg-primary/80 transition-colors cursor-pointer"
                      style={{
                        height: `${height}%`,
                        minHeight: month.quantity_quintals > 0 ? '20px' : '0px',
                      }}
                      title={`${month.month}: ${formatNumber(month.quantity_quintals)} quintals`}
                    />
                    <p className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left">
                      {month.month.split(' ')[0]}
                    </p>
                    <p className="text-xs font-semibold text-gray-900">
                      {formatNumber(month.quantity_quintals)}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Crop-wise Stats */}
      {stats?.trends?.crop_wise_stats && stats.trends.crop_wise_stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Crop-wise Procurement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.trends.crop_wise_stats.map((crop: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{crop.crop_type}</p>
                    <p className="text-sm text-gray-600">
                      {formatNumber(crop.total_lots)} lots • {formatNumber(crop.total_quantity)} quintals
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      Avg: {formatCurrency(crop.avg_price)}/qtl
                    </p>
                  </div>
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
