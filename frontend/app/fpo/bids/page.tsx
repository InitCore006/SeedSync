'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Gavel, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { useFPOBids } from '@/lib/hooks/useAPI';
import { API } from '@/lib/api';

function BidsContent() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const { bids, isLoading, isError, mutate } = useFPOBids({ status: statusFilter === 'all' ? undefined : statusFilter });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium">Error loading bids</p>
              <p className="text-sm mt-1">Please try again later</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredBids = bids;
  const pendingCount = bids.filter((b: any) => b.status === 'pending').length;
  const acceptedCount = bids.filter((b: any) => b.status === 'accepted').length;
  const totalBidValue = bids.reduce((sum: number, b: any) => sum + (b.bid_price * b.quantity / 100), 0);

  const handleAcceptBid = async (bidId: string) => {
    try {
      await API.fpo.acceptBid(bidId);
      toast.success('Bid accepted successfully!');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept bid');
    }
  };

  const handleRejectBid = async (bidId: string) => {
    try {
      await API.fpo.rejectBid(bidId);
      toast.success('Bid rejected');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject bid');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bid Management</h1>
        <p className="text-gray-600 mt-1">Review and manage bids on your procurement lots</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bids</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{bids.length}</p>
              </div>
              <Gavel className="w-12 h-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{pendingCount}</p>
              </div>
              <Clock className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{acceptedCount}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalBidValue)}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            {['all', 'pending', 'accepted', 'rejected'].map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bids List */}
      <div className="space-y-4">
        {filteredBids.length > 0 ? (
          filteredBids.map((bid) => (
            <Card key={bid.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{bid.crop}</h3>
                      <Badge variant="status" status={bid.status}>
                        {bid.status.toUpperCase()}
                      </Badge>
                      {bid.bid_price > bid.expected_price && (
                        <Badge variant="status" status="active">Higher Bid!</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Lot Number</p>
                        <p className="font-medium text-gray-900">{bid.lot_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Quantity</p>
                        <p className="font-medium text-gray-900">{formatNumber(bid.quantity)} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Bid Price</p>
                        <p className="font-bold text-primary">{formatCurrency(bid.bid_price)}/qtl</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Expected Price</p>
                        <p className="font-medium text-gray-600">{formatCurrency(bid.expected_price)}/qtl</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Bidder</p>
                        <p className="font-medium text-gray-900">{bid.bidder}</p>
                        <p className="text-xs text-gray-600">{bid.bidder_phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total Bid Value</p>
                        <p className="font-bold text-gray-900">{formatCurrency((bid.bid_price * bid.quantity) / 100)}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      Received {formatDate(bid.created_at, 'PP')}
                    </p>
                  </div>

                  {bid.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAcceptBid(bid.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectBid(bid.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bids found</h3>
                <p className="text-gray-600">
                  {statusFilter !== 'all' 
                    ? `No ${statusFilter} bids at the moment` 
                    : 'No bids received yet on your lots'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function BidsPage() {
  return (
    <ProtectedRoute allowedRoles={['fpo']}>
      <DashboardLayout>
        <BidsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
