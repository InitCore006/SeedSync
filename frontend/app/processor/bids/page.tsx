'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import { TrendingUp, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { useProcessorBids } from '@/lib/hooks/useAPI';

function BidsContent() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const { bids, isLoading, mutate } = useProcessorBids();

  const filteredBids = bids?.filter((bid: any) => 
    statusFilter === 'all' || bid.status === statusFilter
  ) || [];

  // Calculate stats
  const totalBids = bids?.length || 0;
  const pendingBids = bids?.filter((b: any) => b.status === 'pending').length || 0;
  const acceptedBids = bids?.filter((b: any) => b.status === 'accepted').length || 0;
  const totalValue = bids?.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0) || 0;

  const getStatusBadge = (status: string) => {
    return <Badge variant="status" status={status}>{status.toUpperCase()}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
        <p className="text-gray-600 mt-1">Track and manage your procurement bids</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bids</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalBids}</p>
              </div>
              <Package className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingBids}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{acceptedBids}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalValue)}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'accepted', 'rejected'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status as any)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && ` (${bids?.filter((b: any) => b.status === status).length || 0})`}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bids List */}
      {filteredBids.length === 0 ? (
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bids found</h3>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? "You haven't placed any bids yet. Go to Procurement to browse available lots."
                  : `No ${statusFilter} bids found.`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredBids.map((bid: any) => (
            <Card key={bid.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>
                      Lot #{bid.lot?.lot_number}
                      <span className="ml-3 text-sm font-normal text-gray-600">
                        {bid.lot?.crop_type}
                      </span>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Bid placed on {formatDate(bid.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(bid.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Lot Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Lot Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Seller:</span>
                        <span className="font-medium">
                          {bid.lot?.farmer ? bid.lot.farmer.full_name : bid.lot?.fpo?.organization_name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quality Grade:</span>
                        <span className="font-medium">{bid.lot?.quality_grade || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available Quantity:</span>
                        <span className="font-medium">{formatNumber(bid.lot?.quantity_quintals)} qtl</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Price:</span>
                        <span className="font-medium">{formatCurrency(bid.lot?.expected_price_per_quintal)}/qtl</span>
                      </div>
                    </div>
                  </div>

                  {/* Bid Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Your Bid</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bid Amount:</span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(bid.bid_amount_per_quintal)}/qtl
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{formatNumber(bid.quantity_quintals)} qtl</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-bold text-lg text-gray-900">
                          {formatCurrency(bid.total_amount)}
                        </span>
                      </div>
                      {bid.remarks && (
                        <div className="pt-2 border-t">
                          <span className="text-gray-600">Remarks:</span>
                          <p className="text-gray-900 mt-1">{bid.remarks}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                {bid.status === 'accepted' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Bid Accepted!</p>
                        <p className="text-sm text-green-700 mt-1">
                          Congratulations! Your bid has been accepted. Please proceed with payment and logistics coordination.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {bid.status === 'rejected' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900">Bid Rejected</p>
                        <p className="text-sm text-red-700 mt-1">
                          Your bid was not accepted. You can try placing a new bid on other available lots.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {bid.status === 'pending' && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900">Awaiting Response</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Your bid is under review by the seller. You will be notified once they respond.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProcessorBidsPage() {
  return (
    <ProtectedRoute allowedRoles={['processor']}>
      <DashboardLayout>
        <BidsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
