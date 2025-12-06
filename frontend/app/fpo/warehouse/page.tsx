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
import Select from '@/components/ui/Select';
import { Package, Search, AlertTriangle, TrendingUp, TrendingDown, Eye, Wheat, Plus, Edit, Trash2 } from 'lucide-react';
import { formatNumber, formatDate, formatCurrency } from '@/lib/utils';
import { useFPOWarehouses, useFPOProcurement } from '@/lib/hooks/useAPI';
import { API } from '@/lib/api';
import { INDIAN_STATES } from '@/lib/constants';

// Warehouse Create/Edit Modal
interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  warehouse?: any;
}

function WarehouseModal({ isOpen, onClose, onSuccess, warehouse }: WarehouseModalProps) {
  const isEdit = !!warehouse;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    warehouse_name: warehouse?.warehouse_name || '',
    warehouse_code: warehouse?.warehouse_code || '',
    warehouse_type: warehouse?.warehouse_type || 'warehouse',
    address: warehouse?.address || '',
    village: warehouse?.village || '',
    district: warehouse?.district || '',
    state: warehouse?.state || '',
    pincode: warehouse?.pincode || '',
    capacity_quintals: warehouse?.capacity_quintals || '',
    latitude: warehouse?.latitude || '',
    longitude: warehouse?.longitude || '',
    has_scientific_storage: warehouse?.has_scientific_storage || false,
    has_pest_control: warehouse?.has_pest_control || false,
    has_fire_safety: warehouse?.has_fire_safety || false,
    has_security: warehouse?.has_security || false,
    weighing_capacity_quintals: warehouse?.weighing_capacity_quintals || '',
    has_loading_unloading_facility: warehouse?.has_loading_unloading_facility || false,
    has_quality_testing_lab: warehouse?.has_quality_testing_lab || false,
    incharge_name: warehouse?.incharge_name || '',
    incharge_phone: warehouse?.incharge_phone || '',
    is_operational: warehouse?.is_operational ?? true,
    operational_since: warehouse?.operational_since || '',
    notes: warehouse?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        capacity_quintals: parseFloat(formData.capacity_quintals as any),
        latitude: formData.latitude ? parseFloat(formData.latitude as any) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude as any) : undefined,
        weighing_capacity_quintals: formData.weighing_capacity_quintals 
          ? parseFloat(formData.weighing_capacity_quintals as any) 
          : undefined,
      };

      if (isEdit) {
        await API.fpo.updateWarehouse(warehouse.id, submitData);
      } else {
        await API.fpo.createWarehouse(submitData as any);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save warehouse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Warehouse' : 'Create New Warehouse'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Warehouse Name"
              required
              value={formData.warehouse_name}
              onChange={(e) => setFormData({ ...formData, warehouse_name: e.target.value })}
              placeholder="e.g., Main Storage Facility"
            />
            <Input
              label="Warehouse Code"
              required
              value={formData.warehouse_code}
              onChange={(e) => setFormData({ ...formData, warehouse_code: e.target.value })}
              placeholder="e.g., WH001"
              disabled={isEdit}
            />
            <Select
              label="Warehouse Type"
              required
              value={formData.warehouse_type}
              onChange={(e) => setFormData({ ...formData, warehouse_type: e.target.value })}
              options={[
                { value: 'warehouse', label: 'Warehouse' },
                { value: 'godown', label: 'Godown' },
                { value: 'cold_storage', label: 'Cold Storage' },
                { value: 'shed', label: 'Open Shed' },
              ]}
            />
            <Input
              label="Capacity (Quintals)"
              type="number"
              required
              value={formData.capacity_quintals}
              onChange={(e) => setFormData({ ...formData, capacity_quintals: e.target.value })}
              placeholder="e.g., 10000"
              min="1"
              step="0.01"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Location</h3>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Address"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Village"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              />
              <Input
                label="District"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              />
              <Select
                label="State"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                options={[
                  { value: '', label: 'Select State' },
                  ...INDIAN_STATES.map(([code, name]) => ({ value: code, label: name }))
                ]}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Pincode"
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="6-digit pincode"
                maxLength={6}
              />
              <Input
                label="Latitude"
                type="number"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="Optional"
                step="0.000001"
              />
              <Input
                label="Longitude"
                type="number"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="Optional"
                step="0.000001"
              />
            </div>
          </div>
        </div>

        {/* Infrastructure & Facilities */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Infrastructure & Facilities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={formData.has_scientific_storage}
                onChange={(e) => setFormData({ ...formData, has_scientific_storage: e.target.checked })}
                className="rounded"
              />
              <span>Scientific Storage</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={formData.has_pest_control}
                onChange={(e) => setFormData({ ...formData, has_pest_control: e.target.checked })}
                className="rounded"
              />
              <span>Pest Control</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={formData.has_fire_safety}
                onChange={(e) => setFormData({ ...formData, has_fire_safety: e.target.checked })}
                className="rounded"
              />
              <span>Fire Safety</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={formData.has_security}
                onChange={(e) => setFormData({ ...formData, has_security: e.target.checked })}
                className="rounded"
              />
              <span>Security System</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={formData.has_loading_unloading_facility}
                onChange={(e) => setFormData({ ...formData, has_loading_unloading_facility: e.target.checked })}
                className="rounded"
              />
              <span>Loading/Unloading</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={formData.has_quality_testing_lab}
                onChange={(e) => setFormData({ ...formData, has_quality_testing_lab: e.target.checked })}
                className="rounded"
              />
              <span>Quality Testing Lab</span>
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="Weighing Capacity (Quintals)"
              type="number"
              value={formData.weighing_capacity_quintals}
              onChange={(e) => setFormData({ ...formData, weighing_capacity_quintals: e.target.value })}
              placeholder="Optional"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Management */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Incharge Name"
              value={formData.incharge_name}
              onChange={(e) => setFormData({ ...formData, incharge_name: e.target.value })}
            />
            <Input
              label="Incharge Phone"
              value={formData.incharge_phone}
              onChange={(e) => setFormData({ ...formData, incharge_phone: e.target.value })}
              placeholder="10-digit number"
            />
            <Input
              label="Operational Since"
              type="date"
              value={formData.operational_since}
              onChange={(e) => setFormData({ ...formData, operational_since: e.target.value })}
            />
            <label className="flex items-center space-x-2 text-sm pt-6">
              <input
                type="checkbox"
                checked={formData.is_operational}
                onChange={(e) => setFormData({ ...formData, is_operational: e.target.checked })}
                className="rounded"
              />
              <span>Currently Operational</span>
            </label>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Any additional information..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Warehouse' : 'Create Warehouse'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function WarehouseContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null);
  const { warehouses, isLoading, isError, mutate } = useFPOWarehouses();
  const { opportunities: allLots } = useFPOProcurement({});

  if (isLoading) return <Loading fullScreen />;
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load warehouse data
        </div>
      </div>
    );
  }

  const warehouseList = Array.isArray(warehouses) ? warehouses : [];
  const filteredWarehouses = warehouseList.filter((wh: any) =>
    wh.warehouse_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wh.district?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCapacity = warehouseList.reduce((sum: number, wh: any) => sum + (wh.capacity_quintals || 0), 0);
  const totalStock = warehouseList.reduce((sum: number, wh: any) => sum + (wh.current_stock_quintals || 0), 0);
  const avgUtilization = totalCapacity > 0 ? (totalStock / totalCapacity * 100) : 0;
  const lowCapacityWarehouses = warehouseList.filter((wh: any) => 
    wh.current_stock_quintals && wh.capacity_quintals && 
    (wh.current_stock_quintals / wh.capacity_quintals) > 0.8
  ).length;

  const handleViewInventory = (warehouse: any) => {
    setSelectedWarehouse(warehouse);
    setIsInventoryModalOpen(true);
  };

  const handleCreateWarehouse = () => {
    setEditingWarehouse(null);
    setIsWarehouseModalOpen(true);
  };

  const handleEditWarehouse = (warehouse: any) => {
    setEditingWarehouse(warehouse);
    setIsWarehouseModalOpen(true);
  };

  const handleDeleteWarehouse = async (warehouse: any) => {
    if (!confirm(`Are you sure you want to delete "${warehouse.warehouse_name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await API.fpo.deleteWarehouse(warehouse.id);
      mutate(); // Refresh warehouse list
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete warehouse');
    }
  };

  const handleWarehouseSuccess = () => {
    mutate(); // Refresh warehouse list
  };

  // Get lots for selected warehouse
  const warehouseLots = selectedWarehouse
    ? (allLots || []).filter((lot: any) => lot.warehouse_id === selectedWarehouse.id)
    : [];

  // Group lots by crop type
  const cropBreakdown = warehouseLots.reduce((acc: any, lot: any) => {
    const crop = lot.crop_type || 'Unknown';
    if (!acc[crop]) {
      acc[crop] = { count: 0, quantity: 0, lots: [] };
    }
    acc[crop].count += 1;
    acc[crop].quantity += lot.quantity_quintals || 0;
    acc[crop].lots.push(lot);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Warehouse Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your inventory across storage locations</p>
        </div>
        <Button onClick={handleCreateWarehouse}>
          <Plus className="w-4 h-4 mr-2" />
          Add Warehouse
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Warehouses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{warehouseList.length}</p>
              </div>
              <Package className="w-12 h-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(totalCapacity)} quintals</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Stock</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{formatNumber(totalStock)} quintals</p>
              </div>
              <Package className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Utilization</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{avgUtilization.toFixed(1)}%</p>
              </div>
              {avgUtilization > 80 ? (
                <AlertTriangle className="w-12 h-12 text-orange-500 opacity-20" />
              ) : (
                <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by warehouse name or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Warehouses Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Warehouses ({filteredWarehouses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredWarehouses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWarehouses.map((warehouse: any) => {
                const utilization = warehouse.capacity_quintals > 0 
                  ? (warehouse.current_stock_quintals / warehouse.capacity_quintals * 100) 
                  : 0;
                const isHighUtilization = utilization > 80;
                
                return (
                  <Card key={warehouse.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{warehouse.warehouse_name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {warehouse.district}, {warehouse.state}
                          </p>
                        </div>
                        <Badge variant="status" status={warehouse.warehouse_type === 'cold_storage' ? 'active' : 'pending'}>
                          {warehouse.warehouse_type?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Capacity Utilization</span>
                            <span className="text-sm font-bold text-gray-900">{utilization.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all ${isHighUtilization ? 'bg-orange-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <p className="text-xs text-gray-600">Current Stock</p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatNumber(warehouse.current_stock_quintals || 0)}
                            </p>
                            <p className="text-xs text-gray-500">quintals</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Total Capacity</p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatNumber(warehouse.capacity_quintals || 0)}
                            </p>
                            <p className="text-xs text-gray-500">quintals</p>
                          </div>
                        </div>

                        {warehouse.has_quality_testing_lab && (
                          <Badge variant="status" status="active" className="mt-2">
                            Quality Lab Available
                          </Badge>
                        )}

                        {isHighUtilization && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                            <div className="flex items-start">
                              <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 mr-2" />
                              <p className="text-xs text-orange-800">
                                High utilization - consider expanding capacity
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => handleViewInventory(warehouse)} className="flex items-center justify-center gap-1">
                          <Eye className="w-4 h-4" />
                          Inventory
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditWarehouse(warehouse)} className="flex items-center justify-center gap-1">
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteWarehouse(warehouse)} 
                          className="flex items-center justify-center gap-1 text-red-600 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouses found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search' : 'No warehouses have been added yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Modal */}
      {selectedWarehouse && (
        <Modal
          isOpen={isInventoryModalOpen}
          onClose={() => setIsInventoryModalOpen(false)}
          title={`Inventory - ${selectedWarehouse.warehouse_name}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Warehouse Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Current Stock</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(selectedWarehouse.current_stock_quintals || 0)} Q</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Capacity</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(selectedWarehouse.capacity_quintals || 0)} Q</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(selectedWarehouse.capacity_quintals - selectedWarehouse.current_stock_quintals)} Q
                </p>
              </div>
            </div>

            {/* Crop Breakdown */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Crop Breakdown</h3>
              {Object.keys(cropBreakdown).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(cropBreakdown).map(([crop, data]: [string, any]) => (
                    <div key={crop} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Wheat className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-gray-900">{crop}</p>
                          <p className="text-sm text-gray-600">{data.count} lot{data.count > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatNumber(data.quantity)} Q</p>
                        <p className="text-xs text-gray-500">
                          {((data.quantity / selectedWarehouse.current_stock_quintals) * 100).toFixed(1)}% of stock
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No inventory in this warehouse</p>
              )}
            </div>

            {/* Lots List */}
            {warehouseLots.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Stored Lots</h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {warehouseLots.map((lot: any) => (
                    <div key={lot.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">{lot.lot_number}</p>
                        <p className="text-sm text-gray-600">{lot.farmer?.full_name || lot.farmer_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-blue-100 text-blue-800 text-xs">{lot.quality_grade}</Badge>
                          <Badge variant="status" status={lot.status}>{lot.status}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatNumber(lot.quantity_quintals)} Q</p>
                        <p className="text-sm text-gray-600">{formatCurrency(lot.expected_price_per_quintal)}/Q</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button variant="outline" onClick={() => setIsInventoryModalOpen(false)} className="w-full">
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* Warehouse Create/Edit Modal */}
      <WarehouseModal
        isOpen={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        onSuccess={handleWarehouseSuccess}
        warehouse={editingWarehouse}
      />
    </div>
  );
}

export default function WarehousePage() {
  return (
    <ProtectedRoute allowedRoles={['fpo']}>
      <DashboardLayout>
        <WarehouseContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
