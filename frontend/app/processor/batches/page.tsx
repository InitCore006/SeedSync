'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { formatNumber, formatDate, getStatusColor } from '@/lib/utils';
import { Plus, Factory, Search, Play, Pause, CheckCircle, XCircle } from 'lucide-react';
import { CROPS } from '@/lib/constants';
import { useProcessingBatches } from '@/lib/hooks/useAPI';
import { API } from '@/lib/api';
import toast from 'react-hot-toast';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
}

function CreateBatchModal({ isOpen, onClose, onCreate }: CreateBatchModalProps) {
  const [formData, setFormData] = useState({
    plant: '',
    lot: '',
    initial_quantity_quintals: '',
    processing_method: 'cold_pressed',
    expected_completion_date: '',
    notes: '',
  });
  const [plants, setPlants] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [selectedLot, setSelectedLot] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch plants and lots when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      // Fetch processing plants directly
      const plantsRes = await API.processor.getPlants();
      console.log('Plants response:', plantsRes); // Debug log
      if (plantsRes.data) {
        setPlants(plantsRes.data);
      }

      // Fetch purchased lots (procurement history)
      const lotsRes = await API.processor.getProcurement({ view: 'history' });
      console.log('Lots response:', lotsRes); // Debug log
      if (lotsRes.data?.results) {
        // Filter for lots with available quantity
        const availableLots = lotsRes.data.results.filter(
          (lot: any) => lot.available_quantity_quintals > 0
        );
        setLots(availableLots);
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load plants and lots');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLotChange = (lotId: string) => {
    setFormData({ ...formData, lot: lotId });
    const lot = lots.find(l => l.id === lotId);
    setSelectedLot(lot);
    // Auto-fill initial quantity with available quantity
    if (lot) {
      setFormData(prev => ({ 
        ...prev, 
        lot: lotId,
        initial_quantity_quintals: lot.available_quantity_quintals.toString() 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.plant || !formData.lot) {
      toast.error('Please select both plant and lot');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        plant: formData.plant,
        lot: formData.lot,
        initial_quantity_quintals: parseFloat(formData.initial_quantity_quintals),
        processing_method: formData.processing_method,
        expected_completion_date: formData.expected_completion_date || undefined,
        notes: formData.notes || '',
      };

      await API.processor.createBatch(payload);
      toast.success('Processing batch created successfully! Inventory has been deducted.');
      onCreate();
      onClose();
      setFormData({
        plant: '',
        lot: '',
        initial_quantity_quintals: '',
        processing_method: 'cold_pressed',
        expected_completion_date: '',
        notes: '',
      });
      setSelectedLot(null);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to create batch';
      toast.error(errorMsg);
      console.error('Create batch error:', error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Processing Batch" size="lg">
      {isLoadingData ? (
        <div className="py-8 flex justify-center">
          <Loading />
        </div>
      ) : plants.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-600 mb-4">No processing plants found. Please add a processing plant first.</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      ) : lots.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-600 mb-4">No purchased lots available for processing. Please purchase lots first.</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Plant and Lot Selection */}
          <div className="grid grid-cols-1 gap-4">
            <Select
              label="Processing Plant"
              required
              value={formData.plant}
              onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
              options={plants.map(plant => ({ value: plant.id, label: plant.plant_name }))}
              placeholder="Select processing plant"
            />
            
            <Select
              label="Procurement Lot"
              required
              value={formData.lot}
              onChange={(e) => handleLotChange(e.target.value)}
              options={lots.map(lot => ({ 
                value: lot.id, 
                label: `${lot.lot_number} - ${lot.crop_type} (${formatNumber(lot.available_quantity_quintals)}Q available)` 
              }))}
              placeholder="Select lot to process"
            />

            {selectedLot && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <p className="font-semibold text-blue-900">Lot Details:</p>
                <div className="mt-2 space-y-1 text-blue-800">
                  <p>Crop: <span className="font-medium">{selectedLot.crop_type}</span></p>
                  <p>Available: <span className="font-medium">{formatNumber(selectedLot.available_quantity_quintals)} Quintals</span></p>
                  <p>Quality: <span className="font-medium">{selectedLot.quality_grade}</span></p>
                  {selectedLot.warehouse_name && (
                    <p>Warehouse: <span className="font-medium">{selectedLot.warehouse_name}</span></p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quantity and Method */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity to Process (Quintals)"
              type="number"
              step="0.01"
              min="0.01"
              max={selectedLot?.available_quantity_quintals}
              placeholder="Enter quantity"
              required
              value={formData.initial_quantity_quintals}
              onChange={(e) => setFormData({ ...formData, initial_quantity_quintals: e.target.value })}
              helperText={selectedLot ? `Max: ${formatNumber(selectedLot.available_quantity_quintals)}Q` : '1 Quintal = 100 kg'}
            />

            <Select
              label="Processing Method"
              required
              value={formData.processing_method}
              onChange={(e) => setFormData({ ...formData, processing_method: e.target.value })}
              options={[
                { value: 'cold_pressed', label: 'Cold Pressed' },
                { value: 'hot_pressed', label: 'Hot Pressed' },
                { value: 'expeller_pressed', label: 'Expeller Pressed' },
                { value: 'solvent_extraction', label: 'Solvent Extraction' },
              ]}
            />
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expected Completion Date (Optional)"
              type="date"
              value={formData.expected_completion_date}
              onChange={(e) => setFormData({ ...formData, expected_completion_date: e.target.value })}
            />
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={2}
              />
            </div>
          </div>

          {selectedLot?.warehouse_name && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <p className="font-semibold">⚠️ Inventory Note:</p>
              <p className="mt-1">
                {formData.initial_quantity_quintals} quintals will be deducted from warehouse <strong>{selectedLot.warehouse_name}</strong> when this batch is created.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
              Create Batch
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function ProcessorBatchesContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { batches, isLoading, isError, mutate } = useProcessingBatches({ status: statusFilter !== 'all' ? statusFilter : undefined });

  const handleCreateBatch = () => {
    mutate(); // Refresh batches after creation
  };

  const filteredBatches = (batches || []).filter((batch: any) =>
    batch.input_crop?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    batch.batch_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    batch.output_product?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <Loading fullScreen />;
  if (isError) return <div className="p-6 text-center text-red-600">Failed to load batches</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Processing Batches</h1>
          <p className="text-gray-600 mt-1">Track and manage your processing operations</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Batch
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Total Batches</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{batches?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">In Progress</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {batches?.filter((b: any) => b.status === 'in_progress').length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {batches?.filter((b: any) => b.status === 'completed').length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Avg Yield</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {batches?.length ? ((batches.reduce((sum: number, b: any) => sum + (Number(b.yield_percentage) || 0), 0) / batches.length) || 0).toFixed(1) : '0.0'}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Total Output</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatNumber(batches?.reduce((sum: number, b: any) => sum + (b.oil_extracted_quintals || 0), 0) || 0)} Q
            </p>
            <p className="text-xs text-gray-500 mt-1">Quintals</p>
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
                placeholder="Search by batch number, crop, or product..."
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
                { value: 'pending', label: 'Pending' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'failed', label: 'Failed' },
              ]}
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Batches List */}
      {filteredBatches.length > 0 ? (
        <div className="space-y-4">
          {filteredBatches.map((batch: any) => (
            <Card key={batch.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      batch.status === 'completed' ? 'bg-green-100' :
                      batch.status === 'in_progress' ? 'bg-blue-100' :
                      batch.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <Factory className={`w-6 h-6 ${
                        batch.status === 'completed' ? 'text-green-600' :
                        batch.status === 'in_progress' ? 'text-blue-600' :
                        batch.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{batch.batch_number}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {batch.input_crop} → {batch.output_product}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Method: {batch.processing_method}
                      </p>
                    </div>
                  </div>
                  <Badge variant="status" status={batch.status}>
                    {batch.status === 'in_progress' ? 'In Progress' : batch.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Input</p>
                    <p className="font-semibold">{formatNumber(batch.initial_quantity_quintals)} Q</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Oil Output</p>
                    <p className="font-semibold">{formatNumber(batch.oil_extracted_quintals || 0)} Q</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Cake Output</p>
                    <p className="font-semibold">{formatNumber(batch.cake_produced_quintals || 0)} Q</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Yield</p>
                    <p className={`font-semibold ${(Number(batch.yield_percentage) || 0) >= 40 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {(Number(batch.yield_percentage) || 0).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Quality Grade</p>
                    <p className="font-semibold">{batch.quality_grade || 'N/A'}</p>
                  </div>
                </div>

                {/* Progress Bar for In Progress batches */}
                {batch.status === 'in_progress' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Current Stage</span>
                      <span>{batch.current_stage_display || 'N/A'}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Processing: {formatNumber(batch.initial_quantity_quintals)} quintals
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {batch.status === 'completed' ? (
                      <span>Completed {formatDate(batch.completed_at, 'PP')}</span>
                    ) : batch.status === 'in_progress' ? (
                      <span>Started {formatDate(batch.started_at, 'PP')}</span>
                    ) : (
                      <span>Created {formatDate(batch.started_at, 'PP')}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {batch.status === 'pending' && (
                      <Button variant="primary" size="sm">
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {batch.status === 'in_progress' && (
                      <>
                        <Button variant="outline" size="sm">
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                        <Button variant="primary" size="sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Factory className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No batches found' : 'No processing batches yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first processing batch to get started'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Batch
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Batch Modal */}
      <CreateBatchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateBatch}
      />
    </div>
  );
}

export default function ProcessorBatchesPage() {
  return (
    <ProtectedRoute allowedRoles={['processor']}>
      <DashboardLayout>
        <ProcessorBatchesContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
