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
import { formatNumber, formatDate, getStatusColor } from '@/lib/utils';
import { Plus, Factory, Search, Play, Pause, CheckCircle, XCircle } from 'lucide-react';
import { CROPS } from '@/lib/constants';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}

function CreateBatchModal({ isOpen, onClose, onCreate }: CreateBatchModalProps) {
  const [formData, setFormData] = useState({
    lot_id: '',
    input_crop: '',
    input_quantity_kg: '',
    output_product: '',
    processing_method: '',
    expected_output_kg: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onCreate(formData);
    setIsLoading(false);
    onClose();
    setFormData({
      lot_id: '',
      input_crop: '',
      input_quantity_kg: '',
      output_product: '',
      processing_method: '',
      expected_output_kg: '',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Processing Batch" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Input Crop"
            required
            value={formData.input_crop}
            onChange={(e) => setFormData({ ...formData, input_crop: e.target.value })}
            options={CROPS.map(crop => ({ value: crop.value, label: crop.label }))}
          />
          
          <Input
            label="Input Quantity (kg)"
            type="number"
            placeholder="Enter quantity"
            required
            value={formData.input_quantity_kg}
            onChange={(e) => setFormData({ ...formData, input_quantity_kg: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Output Product"
            placeholder="e.g., Mustard Oil, Groundnut Oil"
            required
            value={formData.output_product}
            onChange={(e) => setFormData({ ...formData, output_product: e.target.value })}
          />
          
          <Input
            label="Expected Output (kg)"
            type="number"
            placeholder="Expected output quantity"
            required
            value={formData.expected_output_kg}
            onChange={(e) => setFormData({ ...formData, expected_output_kg: e.target.value })}
          />
        </div>

        <Select
          label="Processing Method"
          required
          value={formData.processing_method}
          onChange={(e) => setFormData({ ...formData, processing_method: e.target.value })}
          options={[
            { value: 'cold_press', label: 'Cold Press' },
            { value: 'expeller', label: 'Expeller Press' },
            { value: 'solvent_extraction', label: 'Solvent Extraction' },
            { value: 'traditional', label: 'Traditional Method' },
          ]}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
            Create Batch
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ProcessorBatchesContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading] = useState(false);

  // Mock data - replace with actual API hook
  const mockBatches = [
    {
      id: '1',
      batch_number: 'BTH-2024-001',
      input_crop: 'Mustard',
      input_quantity_kg: 1000,
      output_product: 'Mustard Oil',
      output_quantity_kg: 380,
      expected_output_kg: 400,
      processing_method: 'Cold Press',
      status: 'in_progress',
      started_at: new Date().toISOString(),
      quality_grade: 'A',
      yield_percentage: 38.0,
    },
    {
      id: '2',
      batch_number: 'BTH-2024-002',
      input_crop: 'Groundnut',
      input_quantity_kg: 1500,
      output_product: 'Groundnut Oil',
      output_quantity_kg: 675,
      expected_output_kg: 675,
      processing_method: 'Expeller Press',
      status: 'completed',
      started_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      quality_grade: 'A+',
      yield_percentage: 45.0,
    },
    {
      id: '3',
      batch_number: 'BTH-2024-003',
      input_crop: 'Sunflower',
      input_quantity_kg: 800,
      output_product: 'Sunflower Oil',
      output_quantity_kg: 0,
      expected_output_kg: 320,
      processing_method: 'Solvent Extraction',
      status: 'pending',
      quality_grade: null,
      yield_percentage: 0,
    },
  ];

  const batches = mockBatches;

  const handleCreateBatch = (data: any) => {
    console.log('Creating batch:', data);
  };

  const filteredBatches = batches.filter((batch: any) =>
    (statusFilter === 'all' || batch.status === statusFilter) &&
    (batch.input_crop?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     batch.batch_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     batch.output_product?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) return <Loading fullScreen />;

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
            <p className="text-3xl font-bold text-gray-900 mt-1">{batches.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">In Progress</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {batches.filter(b => b.status === 'in_progress').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {batches.filter(b => b.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Avg Yield</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {(batches.reduce((sum, b) => sum + b.yield_percentage, 0) / batches.length).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Total Output</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatNumber(batches.reduce((sum, b) => sum + b.output_quantity_kg, 0))} kg
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
                    <p className="font-semibold">{formatNumber(batch.input_quantity_kg)} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Output</p>
                    <p className="font-semibold">{formatNumber(batch.output_quantity_kg)} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Expected</p>
                    <p className="font-semibold">{formatNumber(batch.expected_output_kg)} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Yield</p>
                    <p className={`font-semibold ${batch.yield_percentage >= 40 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {batch.yield_percentage.toFixed(1)}%
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
                      <span>Processing Progress</span>
                      <span>{((batch.output_quantity_kg / batch.expected_output_kg) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(batch.output_quantity_kg / batch.expected_output_kg) * 100}%` }}
                      />
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
