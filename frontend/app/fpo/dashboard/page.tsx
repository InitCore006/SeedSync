'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useFPODashboard, useFPOProfile } from '@/lib/hooks/useAPI';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { Users, Package, TrendingUp, Warehouse, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

function FPODashboardContent() {
  const router = useRouter();
  const { dashboard, isError: dashError, isLoading: dashLoading } = useFPODashboard();
  const { profile } = useFPOProfile();
  
  if (dashLoading) return <Loading fullScreen />;
  if (dashError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load dashboard data
        </div>
      </div>
    );
  }
  
  const stats = dashboard;
  const fpoProfile = profile;
  
  // Extract data with correct paths from backend
  const fpoInfo = stats?.fpo_info || {};
  const procurement = stats?.procurement || {};
  const warehouse = stats?.warehouse || {};
  const trends = stats?.trends || {};
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{fpoProfile?.organization_name || 'FPO Dashboard'}</h1>
          <p className="text-gray-600 mt-1">
            {fpoProfile?.district}, {fpoProfile?.state}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="status" status={fpoProfile?.kyc_status || 'pending'}>
            {fpoProfile?.kyc_status || 'Pending'}
          </Badge>
        </div>
      </div>
      
      {/* Verification Alert */}
      {fpoProfile?.kyc_status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900">Verification Pending</p>
            <p className="text-sm text-yellow-700 mt-1">
              Your FPO profile is under review by government authorities. You'll be notified once approved.
            </p>
          </div>
        </div>
      )}
      
      {(fpoProfile?.kyc_status === 'verified' || fpoProfile?.is_verified) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-900">FPO Verified ✓</p>
            <p className="text-sm text-green-700 mt-1">
              Your FPO is verified and can now participate in procurement and marketplace activities.
            </p>
          </div>
        </div>
      )}
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {fpoInfo?.total_members || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-blue-600"
              onClick={() => router.push('/fpo/members')}
            >
              View Members →
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Lots</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {procurement?.total_lots || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-green-600"
              onClick={() => router.push('/fpo/procurement')}
            >
              View Lots →
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Procured Quantity</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(procurement?.total_quantity_quintals || 0)} quintals
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              This financial year
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Warehouse Stock</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(warehouse?.current_stock_quintals || 0)} quintals
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Warehouse className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-purple-600"
              onClick={() => router.push('/fpo/warehouse')}
            >
              View Warehouse →
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Lots */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Procurement Lots</CardTitle>
          </CardHeader>
          <CardContent>
            {trends?.crop_wise_stats && trends.crop_wise_stats.length > 0 ? (
              <div className="space-y-4">
                {trends.crop_wise_stats.slice(0, 5).map((crop: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{crop.crop_type}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {crop.total_lots} lots • {formatNumber(crop.total_quantity)} quintals
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">₹{formatNumber(crop.avg_price || 0)}</p>
                      <p className="text-xs text-gray-500">avg. per quintal</p>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push('/fpo/procurement')}
                >
                  View All Lots
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="font-medium">No procurement lots yet</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push('/fpo/procurement')}
                >
                  Create First Lot
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Pending Bids */}
        <Card>
          <CardHeader>
            <CardTitle>Bidding Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {procurement?.active_bids > 0 || procurement?.accepted_bids > 0 ? (
              <div className="space-y-4">
                {stats.pending_bids.map((bid: any) => (
                  <div key={bid.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{bid.processor_name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {bid.crop_name} • {bid.quantity_kg} kg
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Bid placed {formatDate(bid.created_at, 'PP')}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(bid.bid_price_per_quintal)}/qtl
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="primary" size="sm">
                          Accept
                        </Button>
                        <Button variant="outline" size="sm">
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="font-medium">No pending bids</p>
                <p className="text-sm mt-1">New bids will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Procurement Trend */}
      {trends?.monthly_procurement && trends.monthly_procurement.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Procurement Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-2">
              {trends.monthly_procurement.map((month: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary rounded-t-lg"
                    style={{
                      height: `${(month.quantity_quintals / Math.max(...trends.monthly_procurement.map((m: any) => m.quantity_quintals))) * 100}%`,
                      minHeight: '20px',
                    }}
                  />
                  <p className="text-xs text-gray-600 mt-2">{month.month}</p>
                  <p className="text-xs font-medium">{month.quantity_quintals}q</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function FPODashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['fpo']}>
      <DashboardLayout>
        <FPODashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
