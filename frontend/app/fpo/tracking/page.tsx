'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Loading from '@/components/ui/Loading';
import { Search, Clock, CheckCircle, TrendingUp, MapPin, Package, Warehouse, Users, QrCode, ChevronRight, Eye } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';
import API from '@/lib/api';

function TrackingContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLot, setSelectedLot] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data, isLoading, error } = useSWR(
    '/fpos/procurement?view=all',
    () => API.fpo.getProcurement({ view: 'all' })
  );

  const lots = data?.data?.results || [];

  const filteredLots = lots.filter((lot: any) =>
    lot.lot_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lot.crop_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lot.farmer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = async (lot: any) => {
    try {
      const response = await API.lots.getLot(lot.id);
      console.log('Lot details response:', response);
      
      // Handle both response.data and response.data.data structures
      const lotData = (response.data as any)?.data || response.data;
      console.log('Parsed lot data:', lotData);
      
      setSelectedLot(lotData);
      setIsDetailModalOpen(true);
    } catch (error: any) {
      console.error('Error loading lot details:', error);
      toast.error(error?.response?.data?.message || 'Failed to load lot details');
    }
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      'available': <Package className="w-4 h-4" />,
      'bidding': <TrendingUp className="w-4 h-4" />,
      'sold': <CheckCircle className="w-4 h-4" />,
      'delivered': <CheckCircle className="w-4 h-4" />,
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  if (isLoading) return <Loading fullScreen />;
  if (error) {
    console.error('FPO Tracking Error:', error);
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Failed to load tracking data</h3>
          <p className="text-sm">{error?.message || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lot Tracking & History</h1>
        <p className="text-gray-600 mt-1">Track the journey of all lots from procurement to delivery</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Lots</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{lots.length}</p>
              </div>
              <Package className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {lots.filter((l: any) => l.status === 'available').length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {lots.filter((l: any) => ['sold', 'bidding'].includes(l.status)).length}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {lots.filter((l: any) => l.status === 'delivered').length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by lot number, crop type, or farmer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lots List */}
      <div className="space-y-4">
        {filteredLots.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lots found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search query' : 'No lots available for tracking'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredLots.map((lot: any) => (
            <Card key={lot.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {getStatusIcon(lot.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{lot.lot_number}</h3>
                        <p className="text-sm text-gray-600">{lot.crop_type}</p>
                      </div>
                      <Badge variant="status" status={lot.status}>{lot.status}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600">Farmer/Seller</p>
                        <p className="font-medium text-gray-900">{lot.farmer_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p className="font-medium text-gray-900">{formatNumber(lot.quantity_quintals)} qtl</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Quality Grade</p>
                        <p className="font-medium text-gray-900">Grade {lot.quality_grade}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="font-medium text-green-600">{formatCurrency(lot.expected_price_per_quintal)}/qtl</p>
                      </div>
                    </div>

                    {lot.warehouse_name && (
                      <div className="mt-4 flex items-center gap-2 text-sm">
                        <Warehouse className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-600">Stored at:</span>
                        <span className="font-medium text-purple-600">{lot.warehouse_name}</span>
                      </div>
                    )}

                    {lot.listing_type === 'fpo_aggregated' && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-blue-600" />
                        <Badge className="bg-blue-100 text-blue-800">FPO Aggregated Lot</Badge>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(lot)}
                    className="ml-4"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Journey
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Lot Detail Modal */}
      {selectedLot && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Lot Journey & Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedLot.lot_number}</h3>
                <p className="text-gray-600">{selectedLot.crop_type}</p>
              </div>
              <Badge variant="status" status={selectedLot.status} className="text-lg px-4 py-2">
                {selectedLot.status}
              </Badge>
            </div>

            {/* QR Code / Blockchain */}
            {selectedLot.qr_code_url && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <QrCode className="w-6 h-6 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">Blockchain Verified</p>
                    <p className="text-sm text-blue-700">This lot is tracked on blockchain for complete transparency</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View QR
                  </Button>
                </div>
              </div>
            )}

            {/* Status Timeline */}
            {selectedLot.status_history && selectedLot.status_history.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Status Timeline
                </h4>
                <div className="space-y-3">
                  {selectedLot.status_history.map((history: any, index: number) => (
                    <div key={history.id} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                        {index < selectedLot.status_history.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-300 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {history.old_status ? `${history.old_status} → ` : ''}{history.new_status}
                          </p>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(history.created_at, 'PPpp')}
                        </p>
                        {history.remarks && (
                          <p className="text-sm text-gray-700 mt-1 italic">{history.remarks}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lot Details */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Lot Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-medium">{formatNumber(selectedLot.quantity_quintals)} quintals</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Quantity</p>
                  <p className="font-medium">{formatNumber(selectedLot.available_quantity_quintals)} quintals</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quality Grade</p>
                  <p className="font-medium">Grade {selectedLot.quality_grade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expected Price</p>
                  <p className="font-medium text-green-600">{formatCurrency(selectedLot.expected_price_per_quintal)}/qtl</p>
                </div>
                {selectedLot.harvest_date && (
                  <div>
                    <p className="text-sm text-gray-600">Harvest Date</p>
                    <p className="font-medium">{formatDate(selectedLot.harvest_date, 'PP')}</p>
                  </div>
                )}
                {selectedLot.listed_date && (
                  <div>
                    <p className="text-sm text-gray-600">Listed Date</p>
                    <p className="font-medium">{formatDate(selectedLot.listed_date, 'PP')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Warehouse Info */}
            {selectedLot.warehouse_name && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Warehouse className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-900">Storage Location</p>
                    <p className="text-purple-700 mt-1">{selectedLot.warehouse_name}</p>
                    {selectedLot.warehouse_district && (
                      <p className="text-sm text-purple-600 mt-1">
                        {selectedLot.warehouse_district}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            {(selectedLot.location_latitude && selectedLot.location_longitude) && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">Location</p>
                    <p className="text-sm text-green-700 mt-1">
                      {selectedLot.location_latitude}, {selectedLot.location_longitude}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Map
                  </Button>
                </div>
              </div>
            )}

            {/* Description */}
            {selectedLot.description && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedLot.description}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function FPOTrackingPage() {
  return (
    <ProtectedRoute allowedRoles={['fpo']}>
      <DashboardLayout>
        <TrackingContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
