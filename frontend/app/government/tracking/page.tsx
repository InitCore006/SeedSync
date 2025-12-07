'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Loading from '@/components/ui/Loading';
import { Search, Clock, TrendingUp, MapPin, Package, Users, Building, Eye, Filter, Download, ChevronRight } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';
import API from '@/lib/api';

function GovernmentTrackingContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedLot, setSelectedLot] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data, isLoading, error } = useSWR(
    '/marketplace/lots',
    () => API.marketplace.getLots()
  );

  const allLots = data?.data?.results || [];

  const filteredLots = allLots.filter((lot: any) => {
    const matchesSearch = 
      lot.lot_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.crop_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.farmer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.fpo_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lot.status === statusFilter;
    const matchesType = typeFilter === 'all' || lot.listing_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewDetails = async (lot: any) => {
    try {
      const response = await API.lots.getLot(lot.id);
      setSelectedLot(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      toast.error('Failed to load lot details');
    }
  };

  const exportData = () => {
    toast.success('Export feature coming soon!');
  };

  // Calculate statistics
  const stats = {
    total: allLots.length,
    individual: allLots.filter((l: any) => l.listing_type === 'individual').length,
    fpoAggregated: allLots.filter((l: any) => l.listing_type === 'fpo_aggregated').length,
    totalValue: allLots.reduce((sum: number, l: any) => 
      sum + (l.expected_price_per_quintal * l.quantity_quintals), 0
    ),
    totalQuantity: allLots.reduce((sum: number, l: any) => sum + l.quantity_quintals, 0),
  };

  if (isLoading) return <Loading fullScreen />;
  if (error) {
    console.error('Government Tracking Error:', error);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supply Chain Monitoring</h1>
          <p className="text-gray-600 mt-1">Track and monitor all transactions across the platform</p>
        </div>
        <Button variant="outline" onClick={exportData}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Lots</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Package className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Individual</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.individual}</p>
              </div>
              <Users className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">FPO Aggregated</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.fpoAggregated}</p>
              </div>
              <Building className="w-10 h-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Quantity</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats.totalQuantity)} qtl</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by lot number, crop type, farmer, or FPO..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'available', label: 'Available' },
                { value: 'bidding', label: 'Bidding' },
                { value: 'sold', label: 'Sold' },
                { value: 'delivered', label: 'Delivered' },
              ]}
              className="w-full md:w-48"
            />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'individual', label: 'Individual' },
                { value: 'fpo_aggregated', label: 'FPO Aggregated' },
              ]}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>Showing {filteredLots.length} of {allLots.length} lots</p>
        {(statusFilter !== 'all' || typeFilter !== 'all' || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter('all');
              setTypeFilter('all');
              setSearchQuery('');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Lots Table */}
      <div className="space-y-4">
        {filteredLots.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lots found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No lots available in the system'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredLots.map((lot: any) => (
            <Card key={lot.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {lot.listing_type === 'fpo_aggregated' ? (
                          <Building className="w-5 h-5" />
                        ) : (
                          <Users className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-gray-900">{lot.lot_number}</h3>
                          <Badge variant="status" status={lot.status}>{lot.status}</Badge>
                          {lot.listing_type === 'fpo_aggregated' && (
                            <Badge className="bg-purple-100 text-purple-800">FPO Bulk</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{lot.crop_type} - Grade {lot.quality_grade}</p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Seller</p>
                        <p className="font-medium text-sm text-gray-900">
                          {lot.farmer_name || lot.fpo_name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Quantity</p>
                        <p className="font-medium text-sm">{formatNumber(lot.quantity_quintals)} qtl</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Price/qtl</p>
                        <p className="font-medium text-sm text-green-600">
                          {formatCurrency(lot.expected_price_per_quintal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total Value</p>
                        <p className="font-medium text-sm">
                          {formatCurrency(lot.quantity_quintals * lot.expected_price_per_quintal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Bids</p>
                        <p className="font-medium text-sm">{lot.bid_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Listed</p>
                        <p className="font-medium text-sm">{formatDate(lot.created_at, 'PP')}</p>
                      </div>
                    </div>

                    {/* Warehouse Info */}
                    {lot.warehouse_name && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-purple-600">
                        <MapPin className="w-4 h-4" />
                        <span>{lot.warehouse_name}</span>
                        {lot.warehouse_district && <span>• {lot.warehouse_district}</span>}
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
                    View
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
          title="Lot Monitoring Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedLot.lot_number}</h3>
                <p className="text-gray-600">{selectedLot.crop_type}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="status" status={selectedLot.status} className="text-lg px-4 py-2">
                  {selectedLot.status}
                </Badge>
                {selectedLot.listing_type === 'fpo_aggregated' && (
                  <Badge className="bg-purple-100 text-purple-800">FPO Bulk</Badge>
                )}
              </div>
            </div>

            {/* Transaction Timeline */}
            {selectedLot.status_history && selectedLot.status_history.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Transaction Timeline
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
                        {history.changed_by && (
                          <p className="text-xs text-gray-500 mt-1">
                            By: {history.changed_by.full_name || history.changed_by.phone_number}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stakeholder Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Stakeholder Details</h4>
              <div className="grid grid-cols-2 gap-4">
                {selectedLot.farmer ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Farmer</p>
                      <p className="font-medium">{selectedLot.farmer.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">
                        {selectedLot.farmer.village}, {selectedLot.farmer.district}
                      </p>
                    </div>
                  </>
                ) : selectedLot.fpo ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">FPO</p>
                      <p className="font-medium">{selectedLot.fpo.organization_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Registration</p>
                      <p className="font-medium">{selectedLot.fpo.registration_number}</p>
                    </div>
                  </>
                ) : null}
                {selectedLot.fpo && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Managing FPO</p>
                    <p className="font-medium">{selectedLot.fpo.organization_name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Lot Metrics */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Lot Metrics</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">Total Quantity</p>
                  <p className="text-2xl font-bold text-blue-900">{formatNumber(selectedLot.quantity_quintals)}</p>
                  <p className="text-xs text-blue-600">quintals</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Price/Quintal</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(selectedLot.expected_price_per_quintal)}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600">Total Value</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(selectedLot.quantity_quintals * selectedLot.expected_price_per_quintal)}
                  </p>
                </div>
              </div>
            </div>

            {/* Compliance & Quality */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">Quality Grade</p>
                <p className="font-bold text-xl text-green-900">Grade {selectedLot.quality_grade}</p>
              </div>
              {selectedLot.organic_certified && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-700">Certification</p>
                  <p className="font-bold text-xl text-yellow-900">Organic Certified ✓</p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function GovernmentTrackingPage() {
  return (
    <ProtectedRoute allowedRoles={['government']}>
      <DashboardLayout>
        <GovernmentTrackingContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
