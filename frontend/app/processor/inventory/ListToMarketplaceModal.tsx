'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { API } from '@/lib/api';

interface ListToMarketplaceModalProps {
  finishedGood: {
    id: string;
    product_name: string;
    quantity_liters: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const PACKAGING_TYPES = [
  { value: 'bulk_tanker', label: 'Bulk Tanker' },
  { value: 'ibc_1000l', label: 'IBC 1000L' },
  { value: 'drum_200l', label: 'Drum 200L' },
  { value: 'jerry_can_20l', label: 'Jerry Can 20L' },
  { value: 'bottle_5l', label: 'Bottle 5L' },
  { value: 'bottle_1l', label: 'Bottle 1L' },
];

const PROCESSING_TYPES = [
  { value: 'cold_pressed', label: 'Cold Pressed' },
  { value: 'hot_pressed', label: 'Hot Pressed' },
  { value: 'refined', label: 'Refined' },
  { value: 'filtered', label: 'Filtered' },
  { value: 'virgin', label: 'Virgin' },
  { value: 'extra_virgin', label: 'Extra Virgin' },
];

export default function ListToMarketplaceModal({
  finishedGood,
  onClose,
  onSuccess,
}: ListToMarketplaceModalProps) {
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [packagingType, setPackagingType] = useState('');
  const [processingType, setProcessingType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pricePerLiter || parseFloat(pricePerLiter) <= 0) {
      setError('Please enter a valid price per liter');
      return;
    }

    setLoading(true);

    try {
      const response = await API.processor.listToMarketplace({
        finished_good_id: finishedGood.id,
        selling_price_per_liter: parseFloat(pricePerLiter),
        packaging_type: packagingType || undefined,
        processing_type: processingType || undefined,
        description: description || undefined,
      });

      if (response.status === 'success') {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to list to marketplace');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to list to marketplace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            List to Marketplace
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Product</p>
          <p className="font-medium text-gray-900">{finishedGood.product_name}</p>
          <p className="text-sm text-gray-600 mt-1">
            Available: {finishedGood.quantity_liters.toFixed(2)} L
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per Liter (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={pricePerLiter}
              onChange={(e) => setPricePerLiter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter price per liter"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Packaging Type
            </label>
            <select
              value={packagingType}
              onChange={(e) => setPackagingType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
            >
              <option value="">Select packaging type (optional)</option>
              {PACKAGING_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing Type
            </label>
            <select
              value={processingType}
              onChange={(e) => setProcessingType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
            >
              <option value="">Select processing type (optional)</option>
              {PROCESSING_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Additional details about the product (optional)"
              disabled={loading}
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Listing...' : 'List to Marketplace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
