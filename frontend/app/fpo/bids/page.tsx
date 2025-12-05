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

// Mock data - replace with useBids() hook
const mockBids = [
  {
    id: 1,
    lotNumber: 'LOT-2025-001',
    crop: 'Soybean',
    quantity: 5000,
    bidPrice: 4800,
    expectedPrice: 4600,
    bidder: 'ABC Processors Ltd',
    bidderPhone: '9876543210',
    status: 'pending',
    createdAt: '2025-12-05T10:30:00',
  },
  {
    id: 2,
    lotNumber: 'LOT-2025-002',
    crop: 'Mustard',
    quantity: 2000,
    bidPrice: 5200,
    expectedPrice: 5000,
    bidder: 'XYZ Oil Mills',
    bidderPhone: '9123456789',
    status: 'pending',
    createdAt: '2025-12-05T09:15:00',
  },
  {
    id: 3,
    lotNumber: 'LOT-2025-003',
    crop: 'Groundnut',
    quantity: 10000,
    bidPrice: 5500,
    expectedPrice: 5400,
    bidder: 'PQR Industries',
    bidderPhone: '9988776655',
    status: 'accepted',
    createdAt: '2025-12-04T14:20:00',
  },
];

function BidsContent() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredBids = mockBids.filter(bid =>
    statusFilter === 'all' || bid.status === statusFilter
  );

  const pendingCount = mockBids.filter(b => b.status === 'pending').length;
  const acceptedCount = mockBids.filter(b => b.status === 'accepted').length;
  const totalBidValue = mockBids.reduce((sum, b) => sum + (b.bidPrice * b.quantity / 100), 0);

  const handleAcceptBid = async (bidId: number) => {
    toast.success('Bid accepted successfully!');
    // TODO: Call API to accept bid
  };

  const handleRejectBid = async (bidId: number) => {
    toast.success('Bid rejected');
    // TODO: Call API to reject bid
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
                <p className="text-3xl font-bold text-gray-900 mt-1">{mockBids.length}</p>
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
                      {bid.bidPrice > bid.expectedPrice && (
                        <Badge variant="status" status="active">Higher Bid!</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Lot Number</p>
                        <p className="font-medium text-gray-900">{bid.lotNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Quantity</p>
                        <p className="font-medium text-gray-900">{formatNumber(bid.quantity)} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Bid Price</p>
                        <p className="font-bold text-primary">{formatCurrency(bid.bidPrice)}/qtl</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Expected Price</p>
                        <p className="font-medium text-gray-600">{formatCurrency(bid.expectedPrice)}/qtl</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Bidder</p>
                        <p className="font-medium text-gray-900">{bid.bidder}</p>
                        <p className="text-xs text-gray-600">{bid.bidderPhone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total Bid Value</p>
                        <p className="font-bold text-gray-900">{formatCurrency((bid.bidPrice * bid.quantity) / 100)}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      Received {formatDate(bid.createdAt, 'PP')}
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
