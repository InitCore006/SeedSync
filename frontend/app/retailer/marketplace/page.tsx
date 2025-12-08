'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import Modal from '@/components/ui/Modal';
import { Package, Search, ShoppingCart, Building2, Calendar, Droplet } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import useSWR from 'swr';
import { API } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface OrderModalProps {
  product: any;
  onClose: () => void;
  onSuccess: () => void;
}

function PlaceOrderModal({ product, onClose, onSuccess }: OrderModalProps) {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const quantityLiters = parseFloat(quantity);
    if (!quantityLiters || quantityLiters <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (quantityLiters > product.available_quantity_liters) {
      toast.error('Quantity exceeds available stock');
      return;
    }

    setLoading(true);

    try {
      const response = await API.retailer.createOrder({
        product_id: product.id,
        quantity_liters: quantityLiters,
      });

      if (response.status === 'success') {
        toast.success('Order placed successfully!');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Failed to place order');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = parseFloat(quantity || '0') * product.selling_price_per_liter;

  return (
    <Modal isOpen onClose={onClose} title="Place Order">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-gray-900">{product.product_type} - {product.processing_type}</h4>
          <p className="text-sm text-gray-600">SKU: {product.sku}</p>
          <p className="text-sm text-gray-600">
            Processor: {product.processor_name || 'N/A'}
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-600">Price per Liter:</span>
            <span className="font-bold text-green-600">{formatCurrency(product.selling_price_per_liter)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Available:</span>
            <span className="font-medium text-gray-900">{formatNumber(product.available_quantity_liters)} L</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity (Liters) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            max={product.available_quantity_liters}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity in liters"
            required
            disabled={loading}
          />
        </div>

        {quantity && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Total Amount:</span>
              <span className="text-xl font-bold text-blue-600">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function RetailerMarketplaceContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [processingTypeFilter, setProcessingTypeFilter] = useState('');
  const [qualityFilter, setQualityFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: productsResponse, error, mutate } = useSWR(
    ['/marketplace/products', processingTypeFilter, qualityFilter],
    () => {
      console.log('🔍 Fetching marketplace products from API...');
      console.log('  URL: /api/marketplace/products/');
      console.log('  Processing Type Filter:', processingTypeFilter || 'all');
      console.log('  Quality Filter:', qualityFilter || 'all');
      return API.marketplace.getProducts({
        processing_type: processingTypeFilter || undefined,
        quality_grade: qualityFilter || undefined,
      }).then(response => {
        console.log('✅ API Response received:', response);
        console.log('  Status:', response?.status);
        console.log('  Products count:', response?.data?.data?.length || response?.data?.length || 0);
        console.log('  Full data structure:', response?.data);
        return response;
      }).catch(err => {
        console.error('❌ API Error:', err);
        console.error('  Error details:', err?.response?.data);
        throw err;
      });
    }
  );

  const isLoading = !productsResponse && !error;

  if (isLoading) return <Loading fullScreen />;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load marketplace products
        </div>
      </div>
    );
  }

  const products = Array.isArray(productsResponse?.data?.data)
    ? productsResponse.data.data
    : Array.isArray(productsResponse?.data)
    ? productsResponse.data
    : [];

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = searchQuery
      ? product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.product_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.processor_name?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesSearch;
  });

  const getQualityBadge = (grade: string) => {
    const grades: Record<string, { status: any; label: string }> = {
      premium: { status: 'active', label: 'Premium' },
      standard: { status: 'pending', label: 'Standard' },
      economy: { status: 'cancelled', label: 'Economy' },
    };
    return grades[grade?.toLowerCase()] || { status: 'pending', label: grade };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Debug Info Banner */}
     
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Oil Marketplace</h1>
        <p className="text-gray-600 mt-1">Browse and purchase processed oils from processors</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{products.length}</p>
              </div>
              <Package className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Processors</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {new Set(products.map((p: any) => p.processor_id)).size}
                </p>
              </div>
              <Building2 className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stock</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatNumber(
                    products.reduce((sum: number, p: any) => sum + (p.available_quantity_liters || 0), 0)
                  )} L
                </p>
              </div>
              <Droplet className="w-12 h-12 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by SKU, product type, or processor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={processingTypeFilter}
                onChange={(e) => setProcessingTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Processing Types</option>
                <option value="cold_pressed">Cold Pressed</option>
                <option value="hot_pressed">Hot Pressed</option>
                <option value="refined">Refined</option>
                <option value="filtered">Filtered</option>
                <option value="virgin">Virgin</option>
                <option value="extra_virgin">Extra Virgin</option>
              </select>
              <select
                value={qualityFilter}
                onChange={(e) => setQualityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Qualities</option>
                <option value="premium">Premium</option>
                <option value="standard">Standard</option>
                <option value="economy">Economy</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product: any) => {
            const qualityBadge = getQualityBadge(product.quality_grade);
            return (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{product.product_type}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{product.processing_type}</p>
                      <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
                    </div>
                    <Badge variant="status" status={qualityBadge.status}>
                      {qualityBadge.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Processor:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {product.processor_name || 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Available:</span>
                      <span className="font-bold text-gray-900">
                        {formatNumber(product.available_quantity_liters)} L
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Price/Liter:</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(product.selling_price_per_liter)}
                      </span>
                    </div>

                    {product.packaging_type && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Packaging:</span>
                        <span className="text-sm text-gray-900">{product.packaging_type}</span>
                      </div>
                    )}

                    {product.manufacturing_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Manufactured:</span>
                        <span className="text-sm text-gray-900">
                          {formatDate(product.manufacturing_date)}
                        </span>
                      </div>
                    )}

                    {product.expiry_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Expires:</span>
                        <span className="text-sm text-gray-900">
                          {formatDate(product.expiry_date)}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    className="w-full mt-4 flex items-center justify-center gap-2"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Place Order
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Place Order Modal */}
      {selectedProduct && (
        <PlaceOrderModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={() => {
            mutate();
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}

export default function RetailerMarketplacePage() {
  return (
    <ProtectedRoute allowedRoles={['retailer']}>
      <DashboardLayout>
        <RetailerMarketplaceContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
