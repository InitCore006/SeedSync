'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import { Package2, Search, AlertCircle, BoxesIcon, ShoppingCart } from 'lucide-react';
import { formatNumber, formatDate } from '@/lib/utils';
import useSWR from 'swr';
import { API } from '@/lib/api';
import ListToMarketplaceModal from './ListToMarketplaceModal';

function ProcessorInventoryContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: finishedGoodsResponse, error: finishedError, mutate: mutateFinished } = useSWR(
    '/processors/finished-goods/',
    () => API.processor.getFinishedGoods()
  );

  const { data: inventoryResponse, error: inventoryError } = useSWR(
    '/processors/inventory/',
    () => API.processor.getInventory()
  );

  const isLoading = (!finishedGoodsResponse && !finishedError) || (!inventoryResponse && !inventoryError);
  const isError = !!finishedError || !!inventoryError;

  if (isLoading) return <Loading fullScreen />;
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load inventory data
        </div>
      </div>
    );
  }

  // Handle nested data structure from API response
  const finishedGoods = Array.isArray(finishedGoodsResponse?.data?.data?.finished_goods) 
    ? finishedGoodsResponse.data.data.finished_goods 
    : Array.isArray(finishedGoodsResponse?.data?.finished_goods)
    ? finishedGoodsResponse.data.finished_goods
    : [];

  const rawMaterials = Array.isArray(inventoryResponse?.data?.data?.raw_materials)
    ? inventoryResponse.data.data.raw_materials
    : Array.isArray(inventoryResponse?.data?.raw_materials)
    ? inventoryResponse.data.raw_materials
    : [];

  // Map raw materials to consistent format
  const rawMaterialsFormatted = rawMaterials.map((item: any, index: number) => ({
    id: `raw-${index}`,
    category: 'raw',
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    status: item.status || 'optimal'
  }));
  
  // Combine all inventory items
  const allInventory = [...rawMaterialsFormatted, ...finishedGoods];
  
  const filteredInventory = allInventory.filter((item: any) => {
    const productName = item.category === 'raw' 
      ? item.name
      : item.oil_type ? `${item.oil_type} ${item.product_type === 'refined_oil' ? 'Oil' : 'Cake'}` : 'Product';
    const matchesSearch = productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = 
      categoryFilter === 'all' || 
      (categoryFilter === 'raw' && item.category === 'raw') ||
      (categoryFilter === 'oil' && item.product_type === 'refined_oil') ||
      (categoryFilter === 'cake' && item.product_type === 'oil_cake');
    return matchesSearch && matchesCategory;
  });

  const rawCount = rawMaterialsFormatted.length;
  const oilCount = finishedGoods.filter((item: any) => item.product_type === 'refined_oil').length;
  const cakeCount = finishedGoods.filter((item: any) => item.product_type === 'oil_cake').length;
  const inStockCount = finishedGoods.filter((item: any) => item.status === 'in_stock').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Track raw materials and finished goods</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{allInventory.length}</p>
              </div>
              <BoxesIcon className="w-12 h-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Raw Materials</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{rawCount}</p>
              </div>
              <Package2 className="w-12 h-12 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Oil Products</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{oilCount}</p>
              </div>
              <Package2 className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cake Products</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{cakeCount}</p>
              </div>
              <Package2 className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'raw', 'oil', 'cake'].map(cat => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat === 'all' ? 'All' : cat === 'raw' ? 'Raw Materials' : cat === 'oil' ? 'Oil' : 'Oil Cake'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Grid */}
      {filteredInventory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.map((item: any) => {
            // Handle raw materials
            if (item.category === 'raw') {
              return (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{item.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Raw Material</p>
                      </div>
                      <Badge variant="status" status="active">
                        {item.status === 'optimal' ? 'Available' : item.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-3 border-t border-gray-100">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <span className="font-bold text-gray-900">
                          {formatNumber(item.quantity)} {item.unit}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <div className="flex-1 text-center text-sm text-gray-500 py-2">
                        Procured Seeds
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            // Handle finished goods
            const productName = item.oil_type 
              ? `${item.oil_type} ${item.product_type === 'refined_oil' ? 'Oil' : 'Cake'}`
              : item.product_type === 'refined_oil' ? 'Oil' : 'Oil Cake';
            const isOil = item.product_type === 'refined_oil';
            const quantity = isOil ? item.quantity_liters : item.quantity_quintals;
            const unit = isOil ? 'L' : 'Q';

            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{productName}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {isOil ? 'Edible Oil' : 'Oil Cake'}
                      </p>
                    </div>
                    <Badge 
                      variant="status" 
                      status={item.status === 'in_stock' ? 'active' : item.status === 'sold' ? 'pending' : 'cancelled'}
                    >
                      {item.status === 'in_stock' ? 'In Stock' : item.status === 'sold' ? 'Listed' : 'Reserved'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <span className="font-bold text-gray-900">
                        {formatNumber(quantity)} {unit}
                      </span>
                    </div>
                    
                    {item.quality_grade && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Quality:</span>
                        <Badge variant="status" status="active">
                          Grade {item.quality_grade}
                        </Badge>
                      </div>
                    )}

                    {item.batch_number && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Batch:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {item.batch_number}
                        </span>
                      </div>
                    )}

                    {item.storage_location && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="text-sm text-gray-900">
                          {item.storage_location}
                        </span>
                      </div>
                    )}

                    {item.production_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Produced:</span>
                        <span className="text-sm text-gray-900">
                          {formatDate(item.production_date)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    {isOil && item.status === 'in_stock' && (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="flex-1 flex items-center justify-center gap-1"
                        onClick={() => setSelectedProduct({
                          id: item.id,
                          product_name: productName,
                          quantity_liters: item.quantity_liters
                        })}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        List to Marketplace
                      </Button>
                    )}
                    {item.status === 'sold' && (
                      <div className="flex-1 text-center text-sm text-gray-600 py-2">
                        Listed in Marketplace
                      </div>
                    )}
                    {!isOil && (
                      <div className="flex-1 text-center text-sm text-gray-500 py-2">
                        Oil Cake (Byproduct)
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List to Marketplace Modal */}
      {selectedProduct && (
        <ListToMarketplaceModal
          finishedGood={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={() => {
            mutateFinished();
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}

export default function ProcessorInventoryPage() {
  return (
    <ProtectedRoute allowedRoles={['processor']}>
      <DashboardLayout>
        <ProcessorInventoryContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
