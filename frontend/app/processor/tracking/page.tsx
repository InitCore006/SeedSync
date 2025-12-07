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
import { Search, Clock, CheckCircle, TrendingUp, MapPin, Package, Truck, QrCode, ChevronRight, Eye, User, Building } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';
import API from '@/lib/api';

function ProcessorTrackingContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLot, setSelectedLot] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data, isLoading, error } = useSWR(
    '/processor/procurement?view=history',
    () => API.processor.getProcurement({ view: 'history' })
  );

  const lots = data?.data?.results || [];

  const filteredLots = lots.filter((lot: any) =>
    lot.lot_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lot.crop_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lot.farmer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = async (lot: any) => {
    try {
      const response = await API.lots.getLot(lot.id);
      setSelectedLot(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      toast.error('Failed to load lot details');
    }
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      'sold': <CheckCircle className="w-4 h-4" />,
      'in_transit': <Truck className="w-4 h-4" />,
      'delivered': <CheckCircle className="w-4 h-4" />,
      'processing': <TrendingUp className="w-4 h-4" />,
    };
    return icons[status] || <Package className="w-4 h-4" />;
  };

  if (isLoading) return <Loading fullScreen />;
  if (error) {
    console.error('Processor Tracking Error:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Procurement Tracking</h1>
        <p className="text-gray-600 mt-1">Track all your procured lots from purchase to processing</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Procured</p>
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
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {lots.filter((l: any) => l.status === 'in_transit').length}
                </p>
              </div>
              <Truck className="w-10 h-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {lots.filter((l: any) => l.status === 'delivered').length}
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
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(lots.reduce((sum: number, l: any) => 
                    sum + (l.final_price_per_quintal || l.expected_price_per_quintal) * l.quantity_quintals, 0
                  ))}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500" />
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
                {searchQuery ? 'Try adjusting your search query' : 'You haven\'t procured any lots yet'}
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

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          {lot.farmer ? <User className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                          Seller
                        </p>
                        <p className="font-medium text-gray-900">
                          {lot.farmer?.full_name || lot.fpo?.organization_name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p className="font-medium text-gray-900">{formatNumber(lot.quantity_quintals)} qtl</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Quality</p>
                        <p className="font-medium text-gray-900">Grade {lot.quality_grade}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Bid Price</p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(lot.final_price_per_quintal || lot.expected_price_per_quintal)}/qtl
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-bold text-gray-900">
                          {formatCurrency((lot.final_price_per_quintal || lot.expected_price_per_quintal) * lot.quantity_quintals)}
                        </p>
                      </div>
                    </div>

                    {lot.sold_date && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        Procured on {formatDate(lot.sold_date, 'PPp')}
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
                    Track
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
          title="Lot Tracking Details"
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

            {/* Blockchain Verification */}
            {selectedLot.blockchain_tx_id && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <QrCode className="w-6 h-6 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">Blockchain Verified</p>
                    <p className="text-sm text-blue-700">Transaction ID: {selectedLot.blockchain_tx_id.substring(0, 20)}...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Timeline */}
            {selectedLot.status_history && selectedLot.status_history.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Procurement Journey
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
                          <p className="font-medium text-gray-900 capitalize">
                            {history.new_status.replace('_', ' ')}
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

            {/* Seller Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Seller Information</h4>
              <div className="grid grid-cols-2 gap-3">
                {selectedLot.farmer ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Farmer Name</p>
                      <p className="font-medium">{selectedLot.farmer.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-medium">{selectedLot.farmer.phone_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Village</p>
                      <p className="font-medium">{selectedLot.farmer.village || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">District</p>
                      <p className="font-medium">{selectedLot.farmer.district || 'N/A'}</p>
                    </div>
                  </>
                ) : selectedLot.fpo ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">FPO Name</p>
                      <p className="font-medium">{selectedLot.fpo.organization_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <Badge className="bg-blue-100 text-blue-800">FPO Aggregated</Badge>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            {/* Lot Details */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Lot Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Quantity</p>
                  <p className="font-medium">{formatNumber(selectedLot.quantity_quintals)} quintals</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quality Grade</p>
                  <p className="font-medium">Grade {selectedLot.quality_grade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Procurement Price</p>
                  <p className="font-medium text-green-600">
                    {formatCurrency(selectedLot.final_price_per_quintal || selectedLot.expected_price_per_quintal)}/qtl
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-bold text-lg">
                    {formatCurrency((selectedLot.final_price_per_quintal || selectedLot.expected_price_per_quintal) * selectedLot.quantity_quintals)}
                  </p>
                </div>
                {selectedLot.harvest_date && (
                  <div>
                    <p className="text-sm text-gray-600">Harvest Date</p>
                    <p className="font-medium">{formatDate(selectedLot.harvest_date, 'PP')}</p>
                  </div>
                )}
                {selectedLot.sold_date && (
                  <div>
                    <p className="text-sm text-gray-600">Procurement Date</p>
                    <p className="font-medium">{formatDate(selectedLot.sold_date, 'PP')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quality Metrics */}
            {(selectedLot.moisture_content || selectedLot.oil_content) && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">Quality Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedLot.moisture_content && (
                    <div>
                      <p className="text-sm text-green-700">Moisture Content</p>
                      <p className="font-medium text-green-900">{selectedLot.moisture_content}%</p>
                    </div>
                  )}
                  {selectedLot.oil_content && (
                    <div>
                      <p className="text-sm text-green-700">Oil Content</p>
                      <p className="font-medium text-green-900">{selectedLot.oil_content}%</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {selectedLot.pickup_address && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900">Pickup Location</p>
                    <p className="text-yellow-700 mt-1">{selectedLot.pickup_address}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function ProcessorTrackingPage() {
  return (
    <ProtectedRoute allowedRoles={['processor']}>
      <DashboardLayout>
        <ProcessorTrackingContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
