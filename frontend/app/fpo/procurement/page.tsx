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
import { useFPOProcurement } from '@/lib/hooks/useAPI';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { Plus, Package, Search, Filter, Eye, Edit, Trash2, Wheat, Sprout, Flower2, Leaf, Users, Warehouse } from 'lucide-react';
import { CROPS, QUALITY_GRADES } from '@/lib/constants';
import API from '@/lib/api';
import useSWR from 'swr';
import toast from 'react-hot-toast';

// Helper function to get crop icon
const getCropIcon = (cropType: string) => {
  const iconProps = { className: 'w-5 h-5', strokeWidth: 2 };
  
  switch (cropType?.toLowerCase()) {
    case 'soybean':
    case 'groundnut':
      return <Sprout {...iconProps} />;
    case 'mustard':
    case 'safflower':
      return <Flower2 {...iconProps} />;
    case 'sunflower':
      return <Flower2 {...iconProps} className="w-5 h-5 text-yellow-600" />;
    case 'sesame':
    case 'linseed':
    case 'niger':
      return <Leaf {...iconProps} />;
    default:
      return <Wheat {...iconProps} />;
  }
};

interface CreateLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
  warehouses: any[];
  memberLots: any[];
  onRefresh: () => void;
}

function CreateLotModal({ isOpen, onClose, onCreate, warehouses, memberLots, onRefresh }: CreateLotModalProps) {
  const [formData, setFormData] = useState({
    crop_type: '',
    quantity_kg: '',
    quality_grade: '',
    expected_price_per_quintal: '',
    moisture_content: '',
    description: '',
  });
  const [selectedLotIds, setSelectedLotIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter member lots by selected crop type for aggregation
  const filteredMemberLots = formData.crop_type
    ? memberLots.filter(lot => 
        lot.crop_type === formData.crop_type && 
        lot.status === 'available' &&
        lot.warehouse_id // ONLY lots with warehouses can be aggregated
      )
    : [];

  // Calculate total quantity for aggregated lots
  const totalQuantity = filteredMemberLots
    .filter(lot => selectedLotIds.includes(lot.id))
    .reduce((sum, lot) => sum + (lot.quantity_quintals || 0), 0);

  const handleToggleLot = (lotId: string) => {
    setSelectedLotIds(prev =>
      prev.includes(lotId) ? prev.filter(id => id !== lotId) : [...prev, lotId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Create aggregated bulk lot
      if (selectedLotIds.length === 0) {
        setError('Please select at least one member lot to aggregate');
        setIsLoading(false);
        return;
      }

      // Validate all selected lots have warehouses
      const selectedLots = memberLots.filter(lot => selectedLotIds.includes(lot.id));
      const lotsWithoutWarehouse = selectedLots.filter(lot => !lot.warehouse_id);
      
      if (lotsWithoutWarehouse.length > 0) {
        const lotNumbers = lotsWithoutWarehouse.map(l => l.lot_number).join(', ');
        setError(`Cannot aggregate lots without warehouses: ${lotNumbers}`);
        setIsLoading(false);
        return;
      }

      const response = await API.fpo.createAggregatedLot({
        parent_lot_ids: selectedLotIds,
        crop_type: formData.crop_type,
        quality_grade: formData.quality_grade,
        expected_price_per_quintal: parseFloat(formData.expected_price_per_quintal),
        description: formData.description,
      });

      // Check if response indicates success
      if (response.data?.status === 'success' || response.status === 'success' || response.data?.data) {
        toast.success(response.data?.message || 'Aggregated lot created successfully');
        onCreate(response.data?.data || response.data);
        onRefresh();
        resetForm();
      } else {
        setError(response.data?.message || 'Failed to create aggregated lot');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      crop_type: '',
      quantity_kg: '',
      quality_grade: '',
      expected_price_per_quintal: '',
      moisture_content: '',
      description: '',
    });
    setSelectedLotIds([]);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetForm} title="Create Aggregated Bulk Lot" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Aggregation Information Banner */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-0.5">ℹ️</div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How Aggregation Works:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Select multiple farmer lots that are already stored in warehouses</li>
                <li>All selected lots must be the same crop type</li>
                <li>Stock will be <strong>deducted from source warehouses</strong></li>
                <li>A new <strong>FPO-owned bulk lot</strong> will be created and <strong>listed in marketplace</strong></li>
                <li>Original lots will be marked as "aggregated" (used for traceability)</li>
                <li>The aggregated lot is ready for sale to processors/retailers</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Basic Fields */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Crop Type"
            required
            value={formData.crop_type}
            onChange={(e) => {
              setFormData({ ...formData, crop_type: e.target.value });
              setSelectedLotIds([]); // Reset selection when crop changes
            }}
            options={[
              { value: '', label: 'Select Crop Type' },
              ...CROPS.map(crop => ({ value: crop.value, label: crop.label }))
            ]}
          />

          <Select
            label="Quality Grade"
            required
            value={formData.quality_grade}
            onChange={(e) => setFormData({ ...formData, quality_grade: e.target.value })}
            options={[
              { value: '', label: 'Select Grade' },
              { value: 'A+', label: 'Grade A+' },
              { value: 'A', label: 'Grade A' },
              { value: 'B', label: 'Grade B' },
              { value: 'C', label: 'Grade C' },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Expected Price (₹/quintal)"
            type="number"
            placeholder="Enter expected price"
            required
            value={formData.expected_price_per_quintal}
            onChange={(e) => setFormData({ ...formData, expected_price_per_quintal: e.target.value })}
          />

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Stock Management:</p>
              <p>Stock will be deducted from source warehouses and listed in marketplace</p>
            </div>
          </div>
        </div>

        {/* Member Lot Selection */}
        {formData.crop_type && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Select Member Lots to Aggregate</h3>
              <Badge className="bg-blue-100 text-blue-800">
                {selectedLotIds.length} selected • {formatNumber(totalQuantity)} Q total
              </Badge>
            </div>

            {filteredMemberLots.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-yellow-600 mt-0.5">⚠️</div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">No lots available for aggregation</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Aggregation requires lots to be stored in warehouses. 
                      Please assign warehouses to individual lots first in the "Pending Warehouse Assignment" section below.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredMemberLots.map((lot: any) => (
                  <label
                    key={lot.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedLotIds.includes(lot.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLotIds.includes(lot.id)}
                      onChange={() => handleToggleLot(lot.id)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{lot.lot_number}</span>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800">{lot.quality_grade}</Badge>
                          {lot.warehouse_name && (
                            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                              <Warehouse className="w-3 h-3" />
                              {lot.warehouse_name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{lot.farmer?.full_name || lot.farmer_name}</span>
                        <span>•</span>
                        <span>{formatNumber(lot.quantity_quintals)} Q</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            rows={3}
            placeholder="Add any additional details about this aggregated lot..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
            Create Aggregated Lot
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function FPOProcurementContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAssignWarehouseModalOpen, setIsAssignWarehouseModalOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<any>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [assigningWarehouse, setAssigningWarehouse] = useState(false);
  const [assignError, setAssignError] = useState('');
  
  const { opportunities, isLoading, isError, meta, mutate: refetchLots } = useFPOProcurement({ 
    crop_type: cropFilter || undefined, 
    quality_grade: gradeFilter || undefined 
  });
  
  // Fetch warehouses
  const { data: warehousesData } = useSWR('/fpo/warehouses', () => API.fpo.getWarehouses());
  const warehouses = warehousesData?.data || [];
  
  console.log('Warehouses API response:', warehousesData);
  console.log('Parsed warehouses:', warehouses);

  const handleCreateLot = (data: any) => {
    console.log('Lot created successfully:', data);
    refetchLots(); // Refresh the lot list
    setIsCreateModalOpen(false);
  };

  const handleViewLot = (lot: any) => {
    setSelectedLot(lot);
    setIsViewModalOpen(true);
  };
  
  const handleOpenAssignWarehouse = (lot: any) => {
    setSelectedLot(lot);
    setSelectedWarehouseId('');
    setAssignError('');
    setIsAssignWarehouseModalOpen(true);
  };
  
  const handleAssignWarehouse = async () => {
    if (!selectedLot || !selectedWarehouseId) {
      setAssignError('Please select a warehouse');
      return;
    }
    
    setAssigningWarehouse(true);
    setAssignError('');
    
    try {
      const response = await API.fpo.assignWarehouse({
        lot_id: selectedLot.id,
        warehouse_id: selectedWarehouseId
      });
      
      // Close modal and reset state
      setIsAssignWarehouseModalOpen(false);
      setSelectedLot(null);
      setSelectedWarehouseId('');
      setAssignError('');
      setAssigningWarehouse(false);
      
      // Show success message
      toast.success('Warehouse assigned successfully');
      
      // Refresh the lot list
      refetchLots();
    } catch (error: any) {
      setAssignError(error.response?.data?.message || 'Failed to assign warehouse');
      setAssigningWarehouse(false);
    }
  };
  
  // Separate lots into with/without warehouse
  // Exclude FPO aggregated lots from warehouse assignment (they're already aggregated from warehoused lots)
  const lotsWithoutWarehouse = (opportunities || []).filter((lot: any) => 
    !lot.warehouse_id && lot.listing_type !== 'fpo_aggregated'
  );
  const lotsWithWarehouse = (opportunities || []).filter((lot: any) => lot.warehouse_id);

  if (isLoading) return <Loading fullScreen />;
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load procurement opportunities
        </div>
      </div>
    );
  }

  const filteredLots = (opportunities || []).filter((lot: any) =>
    lot.crop_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lot.lot_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Member Procurement Lots</h1>
          <p className="text-gray-600 mt-1">View and manage lots from your FPO members</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Aggregated Lot
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Total Lots</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{opportunities?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Active Lots</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {opportunities?.filter((l: any) => l.status === 'available' || l.status === 'bidding').length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Total Quantity</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatNumber(opportunities?.reduce((sum: number, l: any) => sum + (l.quantity_quintals || 0), 0) || 0)} quintals
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Expected Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(opportunities?.reduce((sum: number, l: any) => {
                const quintals = (l.quantity_quintals || 0);
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
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              options={[
                { value: '', label: 'All Crops' },
                ...CROPS.map(crop => ({ value: crop.value, label: crop.label }))
              ]}
              className="w-48"
            />
            <Select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              options={[
                { value: '', label: 'All Grades' },
                ...Object.values(QUALITY_GRADES).map(grade => ({ value: grade, label: `Grade ${grade}` }))
              ]}
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lots Grid */}
      <div className="space-y-4">
        {/* Pending Storage Section */}
        {lotsWithoutWarehouse.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                {lotsWithoutWarehouse.length}
              </span>
              Pending Warehouse Assignment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lotsWithoutWarehouse
                .filter((lot: any) =>
                  lot.crop_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  lot.lot_number?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((lot: any) => (
                  <Card key={lot.id} className="hover:shadow-lg transition-shadow border-yellow-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            {getCropIcon(lot.crop_type)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">{lot.lot_number}</p>
                            <CardTitle className="mt-1">{lot.crop_type}</CardTitle>
                            {lot.farmer?.full_name && (
                              <p className="text-sm text-gray-600 mt-1">Farmer: {lot.farmer.full_name}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant="status" status="pending" className="bg-yellow-100 text-yellow-800">
                          No Warehouse
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Quantity:</span>
                          <span className="font-semibold">{formatNumber(lot.quantity_quintals)} quintals</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Grade:</span>
                          <span className="font-semibold">Grade {lot.quality_grade}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Expected Price:</span>
                          <span className="font-semibold">{formatCurrency(lot.expected_price_per_quintal)}/qtl</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Created:</span>
                          <span className="text-gray-900">{formatDate(lot.created_at, 'P')}</span>
                        </div>
                      </div>

                      <Button 
                        variant="primary" 
                        className="w-full mt-4 flex items-center justify-center gap-2"
                        onClick={() => handleOpenAssignWarehouse(lot)}
                      >
                        <Warehouse className="w-4 h-4" />
                        Assign to Warehouse
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Stored Lots Section */}
        {lotsWithWarehouse.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {lotsWithWarehouse.length}
              </span>
              Lots in Storage
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lotsWithWarehouse
                .filter((lot: any) =>
                  lot.crop_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  lot.lot_number?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((lot: any) => (
            <Card key={lot.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {getCropIcon(lot.crop_type)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{lot.lot_number}</p>
                      <CardTitle className="mt-1">{lot.crop_type}</CardTitle>
                      {lot.farmer?.full_name && (
                        <p className="text-sm text-gray-600 mt-1">Farmer: {lot.farmer.full_name}</p>
                      )}
                    </div>
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
                    <span className="font-semibold">{formatNumber(lot.quantity_quintals)} quintals</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Grade:</span>
                    <span className="font-semibold">Grade {lot.quality_grade}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Expected Price:</span>
                    <span className="font-semibold">{formatCurrency(lot.expected_price_per_quintal)}/qtl</span>
                  </div>
                  {lot.warehouse_name && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Warehouse className="w-3 h-3" />
                        Warehouse:
                      </span>
                      <span className="font-semibold text-purple-600">{lot.warehouse_name}</span>
                    </div>
                  )}
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewLot(lot)}
                  >
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
          </div>
        )}
        
        {/* Empty State */}
        {lotsWithoutWarehouse.length === 0 && lotsWithWarehouse.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No procurement opportunities available
                </h3>
                <p className="text-gray-600 mb-4">
                  No lots available for procurement at this time
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Assign Warehouse Modal */}
      <Modal
        isOpen={isAssignWarehouseModalOpen}
        onClose={() => setIsAssignWarehouseModalOpen(false)}
        title="Assign Warehouse to Lot"
        size="md"
      >
        {selectedLot && (
          <div className="space-y-4">
            {assignError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {assignError}
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium text-gray-700">Lot Details:</p>
              <div className="text-sm text-gray-600">
                <p>Lot Number: <span className="font-semibold">{selectedLot.lot_number}</span></p>
                <p>Crop: <span className="font-semibold">{selectedLot.crop_type}</span></p>
                <p>Quantity: <span className="font-semibold">{formatNumber(selectedLot.quantity_quintals)} quintals</span></p>
                <p>Farmer: <span className="font-semibold">{selectedLot.farmer?.full_name || 'N/A'}</span></p>
              </div>
            </div>
            
            <Select
              label="Select Warehouse"
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              required
              options={warehouses.map((wh: any) => ({
                value: String(wh.id),
                label: `${wh.warehouse_name} (${wh.district}) - Available: ${wh.available_capacity?.toFixed(2) || '0.00'} Q`
              }))}
            />
            
            {selectedWarehouseId && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                <p className="font-medium mb-1">This will:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Create inventory record</li>
                  <li>Create stock movement IN</li>
                  <li>Update warehouse stock by +{formatNumber(selectedLot.quantity_quintals)}Q</li>
                </ul>
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAssignWarehouseModalOpen(false)}
                className="flex-1"
                disabled={assigningWarehouse}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAssignWarehouse}
                className="flex-1"
                disabled={!selectedWarehouseId || assigningWarehouse}
              >
                {assigningWarehouse ? 'Assigning...' : 'Assign Warehouse'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Lot Modal */}
      <CreateLotModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateLot}
        warehouses={warehouses}
        memberLots={opportunities || []}
        onRefresh={() => refetchLots()}
      />

      {/* View Lot Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Lot Details"
        size="lg"
      >
        {selectedLot && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start justify-between pb-4 border-b">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  {getCropIcon(selectedLot.crop_type)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedLot.crop_type}</h3>
                  <p className="text-sm text-gray-600 mt-1">Lot #{selectedLot.lot_number}</p>
                </div>
              </div>
              <Badge variant="status" status={selectedLot.status}>
                {selectedLot.status}
              </Badge>
            </div>

            {/* Farmer Information */}
            {selectedLot.farmer && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Farmer Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-medium">{selectedLot.farmer.full_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-medium">{selectedLot.farmer.phone_number}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Lot Details */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Lot Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-medium">{formatNumber(selectedLot.quantity_quintals)} quintals</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quality Grade</p>
                  <p className="font-medium">Grade {selectedLot.quality_grade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expected Price</p>
                  <p className="font-medium">{formatCurrency(selectedLot.expected_price_per_quintal)}/quintal</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="font-medium">
                    {formatCurrency(selectedLot.quantity_quintals * selectedLot.expected_price_per_quintal)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Harvest Date</p>
                  <p className="font-medium">{formatDate(selectedLot.harvest_date, 'PP')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created Date</p>
                  <p className="font-medium">{formatDate(selectedLot.created_at, 'PP')}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedLot.description && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 text-sm">{selectedLot.description}</p>
              </div>
            )}

            {/* Blockchain Info */}
            {(selectedLot.blockchain_tx_id || selectedLot.qr_code_url) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Blockchain & Traceability</h4>
                <div className="space-y-2 text-sm">
                  {selectedLot.blockchain_tx_id && (
                    <div>
                      <p className="text-gray-600">Blockchain TX ID</p>
                      <p className="font-mono text-xs break-all">{selectedLot.blockchain_tx_id}</p>
                    </div>
                  )}
                  {selectedLot.qr_code_url && (
                    <div>
                      <p className="text-gray-600 mb-2">QR Code</p>
                      <img 
                        src={selectedLot.qr_code_url} 
                        alt="Lot QR Code" 
                        className="w-32 h-32 border rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="secondary" 
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
              <Button variant="primary">
                Place Bid
              </Button>
            </div>
          </div>
        )}
      </Modal>
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
