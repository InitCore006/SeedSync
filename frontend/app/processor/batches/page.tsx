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
        processing_method: formData.processing_method as 'cold_pressed' | 'hot_pressed' | 'expeller_pressed' | 'solvent_extraction',
        expected_completion_date: formData.expected_completion_date || undefined,
        notes: formData.notes || '',
      };

      const response = await API.processor.createBatch(payload);
      console.log('Batch creation response:', response); // Debug log
      
      // Show detailed success message
      if (response.data?.inventory_changes) {
        const inv = response.data.inventory_changes;
        toast.success(
          `Batch created! ${inv.deducted_quantity}Q deducted from ${inv.warehouse_name}. Remaining: ${formatNumber(inv.remaining_warehouse_stock)}Q`,
          { duration: 5000 }
        );
      } else {
        toast.success(
          `Batch created! ${payload.initial_quantity_quintals}Q allocated from lot.`,
          { duration: 4000 }
        );
      }
      
      // Re-fetch lots to update available quantities
      await fetchData();
      
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

interface CompleteBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: any;
  onComplete: () => void;
}

function CompleteBatchModal({ isOpen, onClose, batch, onComplete }: CompleteBatchModalProps) {
  const [formData, setFormData] = useState({
    oil_extracted_quintals: '',
    cake_produced_quintals: '',
    waste_quantity_quintals: '',
    quality_grade: 'A',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        oil_extracted_quintals: '',
        cake_produced_quintals: '',
        waste_quantity_quintals: '',
        quality_grade: 'A',
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.oil_extracted_quintals || !formData.cake_produced_quintals) {
      toast.error('Please enter both oil and cake output quantities');
      return;
    }

    setIsLoading(true);
    try {
      const response = await API.processor.completeProcessing({
        batch_id: batch.id,
        oil_extracted_quintals: parseFloat(formData.oil_extracted_quintals),
        cake_produced_quintals: parseFloat(formData.cake_produced_quintals),
        waste_quantity_quintals: parseFloat(formData.waste_quantity_quintals) || 0,
        quality_grade: formData.quality_grade,
      });
      
      // Show success with details
      if (response.data) {
        toast.success(
          `Batch completed! Created ${response.data.oil_produced_liters?.toFixed(0)} liters of oil`,
          { duration: 5000 }
        );
      } else {
        toast.success('Batch completed successfully!');
      }
      
      onComplete();
      onClose();
    } catch (error: any) {
      console.error('Failed to complete batch:', error);
      toast.error(error.response?.data?.message || 'Failed to complete batch');
    } finally {
      setIsLoading(false);
    }
  };

  const totalOutput = (parseFloat(formData.oil_extracted_quintals) || 0) + (parseFloat(formData.cake_produced_quintals) || 0) + (parseFloat(formData.waste_quantity_quintals) || 0);
  const yieldPercentage = batch?.initial_quantity_quintals ? (((parseFloat(formData.oil_extracted_quintals) || 0) / batch.initial_quantity_quintals) * 100).toFixed(1) : '0.0';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Batch Processing">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Batch Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-blue-900">Batch Details:</p>
            <div className="mt-2 space-y-1 text-blue-800">
              <p>Batch Number: <span className="font-medium">{batch?.batch_number}</span></p>
              <p>Input Quantity: <span className="font-medium">{formatNumber(batch?.initial_quantity_quintals)} Quintals</span></p>
              <p>Input Crop: <span className="font-medium">{batch?.input_crop}</span></p>
              <p>Processing Method: <span className="font-medium">{batch?.processing_method}</span></p>
            </div>
          </div>

          {/* Output Fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Oil Extracted (Quintals)"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 35.5"
              required
              value={formData.oil_extracted_quintals}
              onChange={(e) => setFormData({ ...formData, oil_extracted_quintals: e.target.value })}
              helperText="Total oil produced"
            />

            <Input
              label="Cake Produced (Quintals)"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 55.2"
              required
              value={formData.cake_produced_quintals}
              onChange={(e) => setFormData({ ...formData, cake_produced_quintals: e.target.value })}
              helperText="Total cake/meal produced"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Waste Quantity (Quintals)"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 2.5"
              value={formData.waste_quantity_quintals}
              onChange={(e) => setFormData({ ...formData, waste_quantity_quintals: e.target.value })}
              helperText="Waste/loss during processing"
            />

            <Select
              label="Quality Grade"
              value={formData.quality_grade}
              onChange={(e) => setFormData({ ...formData, quality_grade: e.target.value })}
              options={[
                { value: 'A', label: 'Grade A (Premium)' },
                { value: 'B', label: 'Grade B (Standard)' },
                { value: 'C', label: 'Grade C (Economy)' },
              ]}
            />
          </div>

          {/* Yield Calculation */}
          {(formData.oil_extracted_quintals || formData.cake_produced_quintals) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              <p className="font-semibold text-green-900">Output Summary:</p>
              <div className="mt-2 space-y-1 text-green-800">
                <p>Total Output: <span className="font-medium">{formatNumber(totalOutput)} Quintals</span></p>
                <p>Yield Percentage: <span className="font-medium">{yieldPercentage}%</span></p>
                <p className="text-xs text-green-700 mt-1">
                  Typical yield ranges: 30-45% depending on method and crop quality
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Completing...' : 'Complete Batch'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function ProcessorBatchesContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  
  const { batches, isLoading, isError, mutate } = useProcessingBatches({ status: statusFilter !== 'all' ? statusFilter : undefined });

  const handleCreateBatch = () => {
    mutate(); // Refresh batches after creation
  };

  const handleStartBatch = async (batch: any) => {
    try {
      await API.processor.startProcessing({ batch_id: batch.id });
      toast.success('Batch processing started!');
      mutate(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to start batch:', error);
      toast.error(error.response?.data?.message || 'Failed to start batch');
    }
  };

  const handlePauseBatch = async (batch: any) => {
    toast.info('Pause functionality coming soon');
    // TODO: Implement pause batch API endpoint
  };

  const handleCompleteBatchClick = (batch: any) => {
    setSelectedBatch(batch);
    setIsCompleteModalOpen(true);
  };

  const handleCompleteBatch = () => {
    mutate(); // Refresh the list
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
            <p className="text-sm font-medium text-gray-600">Total Oil Output</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatNumber(batches?.reduce((sum: number, b: any) => sum + (b.oil_extracted_liters || 0), 0) || 0)} L
            </p>
            <p className="text-xs text-gray-500 mt-1">Liters</p>
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
                    <p className="font-semibold">{formatNumber(batch.oil_extracted_liters || 0)} L</p>
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
                      <Button variant="primary" size="sm" onClick={() => handleStartBatch(batch)}>
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {batch.status === 'in_progress' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handlePauseBatch(batch)}>
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => handleCompleteBatchClick(batch)}>
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

      {/* Complete Batch Modal */}
      <CompleteBatchModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        batch={selectedBatch}
        onComplete={handleCompleteBatch}
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
