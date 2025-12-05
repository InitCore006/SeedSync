'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useLots } from '@/lib/hooks/useAPI';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { Plus, Package, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { CROPS, QUALITY_GRADES } from '@/lib/constants';

interface CreateLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}

function CreateLotModal({ isOpen, onClose, onCreate }: CreateLotModalProps) {
  const [formData, setFormData] = useState({
    crop_type: '',
    quantity_kg: '',
    quality_grade: '',
    expected_price_per_quintal: '',
    moisture_content: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Call API to create lot
    await new Promise(resolve => setTimeout(resolve, 1000));
    onCreate(formData);
    setIsLoading(false);
    onClose();
    setFormData({
      crop_type: '',
      quantity_kg: '',
      quality_grade: '',
      expected_price_per_quintal: '',
      moisture_content: '',
      description: '',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Procurement Lot" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Crop Type"
            required
            value={formData.crop_type}
            onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
            options={CROPS.map(crop => ({ value: crop.value, label: crop.label }))}
          />
          
          <Input
            label="Quantity (kg)"
            type="number"
            placeholder="Enter quantity"
            required
            value={formData.quantity_kg}
            onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Quality Grade"
            required
            value={formData.quality_grade}
            onChange={(e) => setFormData({ ...formData, quality_grade: e.target.value })}
            options={Object.values(QUALITY_GRADES).map(grade => ({ value: grade, label: `Grade ${grade}` }))}
          />
          
          <Input
            label="Expected Price (₹/quintal)"
            type="number"
            placeholder="Enter expected price"
            required
            value={formData.expected_price_per_quintal}
            onChange={(e) => setFormData({ ...formData, expected_price_per_quintal: e.target.value })}
          />
        </div>

        <Input
          label="Moisture Content (%)"
          type="number"
          step="0.1"
          placeholder="Enter moisture percentage"
          value={formData.moisture_content}
          onChange={(e) => setFormData({ ...formData, moisture_content: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            rows={3}
            placeholder="Add any additional details about this lot..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
            Create Lot
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function FPOProcurementContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { lots, isLoading, isError, mutate } = useLots({ status: statusFilter === 'all' ? undefined : statusFilter });

  const handleCreateLot = (data: any) => {
    console.log('Creating lot:', data);
    mutate(); // Refresh the list
  };

  if (isLoading) return <Loading fullScreen />;
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load procurement lots
        </div>
      </div>
    );
  }

  const filteredLots = lots?.filter((lot: any) =>
    lot.crop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lot.lot_number?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Procurement Lots</h1>
          <p className="text-gray-600 mt-1">Manage your crop procurement lots</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Lot
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Total Lots</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{lots?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Active Lots</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {lots?.filter((l: any) => l.status === 'open').length || 0}
            </p>
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
            <p className="text-sm font-medium text-gray-600">Expected Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(lots?.reduce((sum: number, l: any) => {
                const quintals = (l.quantity_kg || 0) / 100;
                return sum + (quintals * (l.expected_price_per_quintal || 0));
              }, 0) || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by crop name or lot number..."
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
                { value: 'open', label: 'Open' },
                { value: 'in_bidding', label: 'In Bidding' },
                { value: 'sold', label: 'Sold' },
                { value: 'closed', label: 'Closed' },
              ]}
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lots Grid */}
      {filteredLots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLots.map((lot: any) => (
            <Card key={lot.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{lot.lot_number}</p>
                    <CardTitle className="mt-1">{lot.crop_name}</CardTitle>
                  </div>
                  <Badge variant="status" status={lot.status}>
                    {lot.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold">{formatNumber(lot.quantity_kg)} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Grade:</span>
                    <span className="font-semibold">Grade {lot.quality_grade}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Expected Price:</span>
                    <span className="font-semibold">{formatCurrency(lot.expected_price_per_quintal)}/qtl</span>
                  </div>
                  {lot.moisture_content && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Moisture:</span>
                      <span className="font-semibold">{lot.moisture_content}%</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">{formatDate(lot.created_at, 'P')}</span>
                  </div>
                  {lot.bid_count > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Bids Received:</span>
                        <span className="font-semibold text-primary">{lot.bid_count} bids</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No lots found' : 'No procurement lots yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first procurement lot to start receiving bids'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Lot
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Lot Modal */}
      <CreateLotModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateLot}
      />
    </div>
  );
}

export default function FPOProcurementPage() {
  return (
    <ProtectedRoute allowedRoles={['fpo']}>
      <DashboardLayout>
        <FPOProcurementContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
