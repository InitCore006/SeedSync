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
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{fpoProfile?.organization_name || 'FPO Dashboard'}</h1>
          <p className="text-gray-600 mt-1">
            {fpoProfile?.city}, {fpoProfile?.state}
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
                  {formatNumber(stats?.total_members || 0)}
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
                <p className="text-sm font-medium text-gray-600">Active Lots</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats?.active_lots || 0)}
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
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats?.total_revenue || 0)}
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
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats?.warehouse_stock_mt || 0)} MT
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
            {stats?.recent_lots && stats.recent_lots.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_lots.map((lot: any) => (
                  <div key={lot.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{lot.crop_name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {lot.quantity_kg} kg • Grade {lot.quality_grade}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created {formatDate(lot.created_at, 'PP')}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <Badge variant="status" status={lot.status}>
                        {lot.status}
                      </Badge>
                      <p className="text-sm font-semibold text-gray-900 mt-2">
                        {formatCurrency(lot.expected_price_per_quintal)}/qtl
                      </p>
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
            <CardTitle>Pending Bids</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.pending_bids && stats.pending_bids.length > 0 ? (
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
      
      {/* Member Growth */}
      {stats?.member_growth && (
        <Card>
          <CardHeader>
            <CardTitle>Member Growth (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-2">
              {stats.member_growth.map((month: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary rounded-t-lg"
                    style={{
                      height: `${(month.count / Math.max(...stats.member_growth.map((m: any) => m.count))) * 100}%`,
                      minHeight: '20px',
                    }}
                  />
                  <p className="text-xs text-gray-600 mt-2">{month.month}</p>
                  <p className="text-sm font-semibold text-gray-900">{month.count}</p>
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
