'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { ShoppingCart, Search, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { CROPS, QUALITY_GRADES } from '@/lib/constants';
import { toast } from 'react-hot-toast';
import { useLots } from '@/lib/hooks/useAPI';

function ProcessorProcurementContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cropFilter, setCropFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('');

  const { lots, isLoading } = useLots({ status: 'open' });

  const filteredLots = lots?.filter((lot: any) =>
    (cropFilter === 'all' || lot.crop_name === cropFilter) &&
    (gradeFilter === 'all' || lot.quality_grade === gradeFilter) &&
    (lot.crop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     lot.lot_number?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const handlePlaceBid = (lot: any) => {
    setSelectedLot(lot);
    setBidAmount(lot.expected_price_per_quintal?.toString() || '');
    setShowBidModal(true);
  };

  const handleSubmitBid = async () => {
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    // TODO: Call API to place bid
    toast.success('Bid placed successfully!');
    setShowBidModal(false);
    setSelectedLot(null);
    setBidAmount('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Procurement Marketplace</h1>
        <p className="text-gray-600 mt-1">Browse and bid on available lots from FPOs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Available Lots</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{lots?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Total Quantity</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatNumber(lots?.reduce((sum: number, l: any) => sum + (l.quantity_kg || 0), 0) || 0)} kg
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Avg Price</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(
                lots?.length > 0
                  ? lots.reduce((sum: number, l: any) => sum + (l.expected_price_per_quintal || 0), 0) / lots.length
                  : 0
              )}/qtl
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Crop Varieties</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {new Set(lots?.map((l: any) => l.crop_name)).size || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by crop name or lot number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Crops' },
                ...CROPS.map(crop => ({ value: crop.label, label: crop.label }))
              ]}
              className="w-full md:w-48"
            />
            <Select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Grades' },
                ...Object.values(QUALITY_GRADES).map(grade => ({ value: grade, label: `Grade ${grade}` }))
              ]}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lots Grid */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Loading lots...</p>
          </CardContent>
        </Card>
      ) : filteredLots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLots.map((lot: any) => (
            <Card key={lot.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{lot.crop_name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{lot.lot_number}</p>
                  </div>
                  <Badge variant="status" status="active">Available</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="pb-3 border-b border-gray-200">
                    <p className="text-xs text-gray-600">Seller</p>
                    <p className="font-medium text-gray-900">{lot.farmer?.full_name || 'FPO Member'}</p>
                    <p className="text-xs text-gray-600">{lot.farmer?.city}, {lot.farmer?.state}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold">{formatNumber(lot.quantity_kg)} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Quality Grade:</span>
                    <span className="font-semibold">Grade {lot.quality_grade}</span>
                  </div>
                  {lot.moisture_content && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Moisture:</span>
                      <span className="font-semibold">{lot.moisture_content}%</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Expected Price</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(lot.expected_price_per_quintal)}<span className="text-sm text-gray-600">/qtl</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Total: {formatCurrency((lot.quantity_kg / 100) * lot.expected_price_per_quintal)}
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full mt-4"
                  onClick={() => handlePlaceBid(lot)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Place Bid
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lots available</h3>
              <p className="text-gray-600">
                {searchQuery || cropFilter !== 'all' || gradeFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Check back later for new procurement opportunities'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bid Modal */}
      <Modal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        title="Place Bid"
      >
        {selectedLot && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg">{selectedLot.crop_name}</h3>
              <p className="text-sm text-gray-600">{selectedLot.lot_number}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Quantity:</span>
                <span className="font-medium">{formatNumber(selectedLot.quantity_kg)} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Expected Price:</span>
                <span className="font-medium">{formatCurrency(selectedLot.expected_price_per_quintal)}/qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Quality Grade:</span>
                <span className="font-medium">Grade {selectedLot.quality_grade}</span>
              </div>
            </div>

            <Input
              label="Your Bid Amount (₹/quintal)"
              type="number"
              placeholder="Enter your bid"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              required
            />

            {bidAmount && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Total Bid Value: {formatCurrency((selectedLot.quantity_kg / 100) * parseFloat(bidAmount || '0'))}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSubmitBid}
              >
                Submit Bid
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBidModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function ProcessorProcurementPage() {
  return (
    <ProtectedRoute allowedRoles={['processor']}>
      <DashboardLayout>
        <ProcessorProcurementContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
