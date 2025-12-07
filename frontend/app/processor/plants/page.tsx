'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { formatNumber } from '@/lib/utils';
import { Plus, Factory, Edit, Trash2, MapPin } from 'lucide-react';
import { API } from '@/lib/api';
import toast from 'react-hot-toast';

interface ProcessingPlant {
  id: string;
  plant_name: string;
  address: string;
  city: string;
  state: string;
  capacity_quintals_per_day: string | number; // Can be string from API
  created_at: string;
}

interface PlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plant?: ProcessingPlant | null;
  mode: 'create' | 'edit';
}

function PlantModal({ isOpen, onClose, onSuccess, plant, mode }: PlantModalProps) {
  const [formData, setFormData] = useState({
    plant_name: '',
    address: '',
    city: '',
    state: '',
    capacity_quintals_per_day: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && plant && mode === 'edit') {
      setFormData({
        plant_name: plant.plant_name,
        address: plant.address,
        city: plant.city,
        state: plant.state,
        capacity_quintals_per_day: plant.capacity_quintals_per_day.toString(),
      });
    } else if (isOpen && mode === 'create') {
      setFormData({
        plant_name: '',
        address: '',
        city: '',
        state: '',
        capacity_quintals_per_day: '',
      });
    }
  }, [isOpen, plant, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        capacity_quintals_per_day: parseFloat(formData.capacity_quintals_per_day),
      };

      if (mode === 'create') {
        await API.processor.createPlant(payload);
        toast.success('Processing plant created successfully!');
      } else if (plant) {
        await API.processor.updatePlant(plant.id, payload);
        toast.success('Processing plant updated successfully!');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || `Failed to ${mode} plant`;
      toast.error(errorMsg);
      console.error(`${mode} plant error:`, error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const INDIAN_STATES = [
    { value: 'andhra_pradesh', label: 'Andhra Pradesh' },
    { value: 'arunachal_pradesh', label: 'Arunachal Pradesh' },
    { value: 'assam', label: 'Assam' },
    { value: 'bihar', label: 'Bihar' },
    { value: 'chhattisgarh', label: 'Chhattisgarh' },
    { value: 'goa', label: 'Goa' },
    { value: 'gujarat', label: 'Gujarat' },
    { value: 'haryana', label: 'Haryana' },
    { value: 'himachal_pradesh', label: 'Himachal Pradesh' },
    { value: 'jharkhand', label: 'Jharkhand' },
    { value: 'karnataka', label: 'Karnataka' },
    { value: 'kerala', label: 'Kerala' },
    { value: 'madhya_pradesh', label: 'Madhya Pradesh' },
    { value: 'maharashtra', label: 'Maharashtra' },
    { value: 'manipur', label: 'Manipur' },
    { value: 'meghalaya', label: 'Meghalaya' },
    { value: 'mizoram', label: 'Mizoram' },
    { value: 'nagaland', label: 'Nagaland' },
    { value: 'odisha', label: 'Odisha' },
    { value: 'punjab', label: 'Punjab' },
    { value: 'rajasthan', label: 'Rajasthan' },
    { value: 'sikkim', label: 'Sikkim' },
    { value: 'tamil_nadu', label: 'Tamil Nadu' },
    { value: 'telangana', label: 'Telangana' },
    { value: 'tripura', label: 'Tripura' },
    { value: 'uttar_pradesh', label: 'Uttar Pradesh' },
    { value: 'uttarakhand', label: 'Uttarakhand' },
    { value: 'west_bengal', label: 'West Bengal' },
    { value: 'andaman_nicobar', label: 'Andaman and Nicobar Islands' },
    { value: 'chandigarh', label: 'Chandigarh' },
    { value: 'dadra_nagar_haveli_daman_diu', label: 'Dadra and Nagar Haveli and Daman and Diu' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'jammu_kashmir', label: 'Jammu and Kashmir' },
    { value: 'ladakh', label: 'Ladakh' },
    { value: 'lakshadweep', label: 'Lakshadweep' },
    { value: 'puducherry', label: 'Puducherry' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create Processing Plant' : 'Edit Processing Plant'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Plant Name"
          required
          value={formData.plant_name}
          onChange={(e) => setFormData({ ...formData, plant_name: e.target.value })}
          placeholder="e.g., Main Processing Unit"
        />

        <Input
          label="Address"
          required
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Street address"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="City name"
          />

          <Select
            label="State"
            required
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            options={INDIAN_STATES}
            placeholder="Select state"
          />
        </div>

        <Input
          label="Processing Capacity (Quintals/Day)"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={formData.capacity_quintals_per_day}
          onChange={(e) => setFormData({ ...formData, capacity_quintals_per_day: e.target.value })}
          placeholder="Daily processing capacity"
          helperText="1 Quintal = 100 kg"
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="flex-1"
          >
            {mode === 'create' ? 'Create Plant' : 'Update Plant'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  plant: ProcessingPlant | null;
  isLoading: boolean;
}

function DeleteModal({ isOpen, onClose, onConfirm, plant, isLoading }: DeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Processing Plant" size="sm">
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to delete <strong>{plant?.plant_name}</strong>?
        </p>
        <p className="text-sm text-red-600">
          ⚠️ This action cannot be undone. You cannot delete plants with active processing batches.
        </p>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ProcessingPlantsContent() {
  const [plants, setPlants] = useState<ProcessingPlant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<ProcessingPlant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const INDIAN_STATES_MAP: { [key: string]: string } = {
    'andhra_pradesh': 'Andhra Pradesh',
    'arunachal_pradesh': 'Arunachal Pradesh',
    'assam': 'Assam',
    'bihar': 'Bihar',
    'chhattisgarh': 'Chhattisgarh',
    'goa': 'Goa',
    'gujarat': 'Gujarat',
    'haryana': 'Haryana',
    'himachal_pradesh': 'Himachal Pradesh',
    'jharkhand': 'Jharkhand',
    'karnataka': 'Karnataka',
    'kerala': 'Kerala',
    'madhya_pradesh': 'Madhya Pradesh',
    'maharashtra': 'Maharashtra',
    'manipur': 'Manipur',
    'meghalaya': 'Meghalaya',
    'mizoram': 'Mizoram',
    'nagaland': 'Nagaland',
    'odisha': 'Odisha',
    'punjab': 'Punjab',
    'rajasthan': 'Rajasthan',
    'sikkim': 'Sikkim',
    'tamil_nadu': 'Tamil Nadu',
    'telangana': 'Telangana',
    'tripura': 'Tripura',
    'uttar_pradesh': 'Uttar Pradesh',
    'uttarakhand': 'Uttarakhand',
    'west_bengal': 'West Bengal',
    'andaman_nicobar': 'Andaman and Nicobar Islands',
    'chandigarh': 'Chandigarh',
    'dadra_nagar_haveli_daman_diu': 'Dadra and Nagar Haveli and Daman and Diu',
    'delhi': 'Delhi',
    'jammu_kashmir': 'Jammu and Kashmir',
    'ladakh': 'Ladakh',
    'lakshadweep': 'Lakshadweep',
    'puducherry': 'Puducherry',
  };

  const getStateLabel = (stateValue: string) => {
    return INDIAN_STATES_MAP[stateValue.toLowerCase()] || stateValue;
  };

  const parseCapacity = (capacity: string | number): number => {
    return typeof capacity === 'string' ? parseFloat(capacity) : capacity;
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    setIsLoading(true);
    try {
      const response = await API.processor.getPlants();
      console.log('Plants response:', response); // Debug log
      if (response.data) {
        setPlants(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch plants:', error);
      toast.error('Failed to load processing plants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (plant: ProcessingPlant) => {
    setSelectedPlant(plant);
    setIsEditModalOpen(true);
  };

  const handleDelete = (plant: ProcessingPlant) => {
    setSelectedPlant(plant);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPlant) return;

    setIsDeleting(true);
    try {
      await API.processor.deletePlant(selectedPlant.id);
      toast.success('Processing plant deleted successfully!');
      setIsDeleteModalOpen(false);
      fetchPlants();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to delete plant';
      toast.error(errorMsg);
      console.error('Delete plant error:', error.response?.data);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Processing Plants</h1>
          <p className="text-gray-600 mt-1">Manage your processing facilities</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add Plant
        </Button>
      </div>

      {/* Plants Grid */}
      {plants.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Factory className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Processing Plants Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Add your first processing plant to start managing production
            </p>
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Add Plant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.map((plant) => (
            <Card key={plant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 p-2 rounded-lg">
                      <Factory className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{plant.plant_name}</CardTitle>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {plant.city}, {getStateLabel(plant.state)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-sm font-medium text-gray-900">{plant.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Processing Capacity</p>
                    <p className="text-lg font-semibold text-primary-600">
                      {formatNumber(parseCapacity(plant.capacity_quintals_per_day))} Q/day
                    </p>
                    <p className="text-xs text-gray-500">
                      ({formatNumber(parseCapacity(plant.capacity_quintals_per_day) * 100)} kg/day)
                    </p>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit className="w-4 h-4" />}
                      onClick={() => handleEdit(plant)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => handleDelete(plant)}
                      className="flex-1 text-red-600 hover:text-red-700 hover:border-red-600"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <PlantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchPlants}
        mode="create"
      />

      <PlantModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPlant(null);
        }}
        onSuccess={fetchPlants}
        plant={selectedPlant}
        mode="edit"
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPlant(null);
        }}
        onConfirm={confirmDelete}
        plant={selectedPlant}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default function ProcessingPlantsPage() {
  return (
    <ProtectedRoute allowedRoles={['processor']}>
      <DashboardLayout>
        <ProcessingPlantsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
