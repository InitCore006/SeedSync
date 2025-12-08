'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import { Package, Search, AlertTriangle, TrendingDown, Plus } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { useRetailerInventory } from '@/lib/hooks/useRetailer';

function InventoryContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { inventory, isLoading, isError } = useRetailerInventory();

  if (isLoading) return <Loading fullScreen />;
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load inventory
        </div>
      </div>
    );
  }

  const filteredInventory = inventory.filter((item: any) =>
    item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.processor_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum: number, item: any) => 
    sum + (Number(item.current_stock_liters) * Number(item.selling_price_per_liter)), 0
  );
  const lowStockItems = inventory.filter((item: any) => item.stock_status === 'low_stock' || item.stock_status === 'reorder').length;
  const outOfStockItems = inventory.filter((item: any) => item.stock_status === 'out_of_stock').length;

  const getStockStatus = (stockStatus: string) => {
    switch (stockStatus) {
      case 'out_of_stock':
        return { label: 'Out of Stock', color: 'red' };
      case 'low_stock':
      case 'reorder':
        return { label: 'Low Stock', color: 'orange' };
      case 'in_stock':
        return { label: 'In Stock', color: 'green' };
      default:
        return { label: 'Unknown', color: 'gray' };
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Monitor stock levels and manage product inventory</p>
        </div>
        <Button variant="primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalItems}</p>
              </div>
              <Package className="w-12 h-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalValue)}</p>
              </div>
              <Package className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{lowStockItems}</p>
              </div>
              <TrendingDown className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{outOfStockItems}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-500 opacity-20" />
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
                placeholder="Search by name, SKU, or supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={categoryFilter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('all')}
              >
                All Products
              </Button>
              <Button
                variant={categoryFilter === 'Oil' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('Oil')}
              >
                Oils
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {lowStockItems > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-1">Low Stock Alert</h3>
                <p className="text-sm text-orange-800">
                  {lowStockItems} {lowStockItems === 1 ? 'product is' : 'products are'} running low on stock. 
                  Consider placing reorder requests soon.
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-orange-600 text-orange-600 hover:bg-orange-100">
                View Items
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory List */}
      {filteredInventory.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredInventory.map((item: any) => {
            const stockStatus = getStockStatus(item.stock_status);
            const stockPercentage = item.stock_percentage || 0;

            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{item.product_name}</h3>
                        <Badge variant="status" status={item.stock_status}>
                          {stockStatus.label}
                        </Badge>
                        {(item.stock_status === 'low_stock' || item.stock_status === 'reorder') && (
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">SKU: {item.sku} | Supplier: {item.processor_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{formatCurrency(item.selling_price_per_liter)}</p>
                      <p className="text-xs text-gray-600">per liter</p>
                    </div>
                  </div>

                  {/* Stock Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Stock Level</span>
                      <span>
                        {formatNumber(item.current_stock_liters)} / {formatNumber(item.max_stock_level)} liters
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          stockStatus.color === 'green'
                            ? 'bg-green-600'
                            : stockStatus.color === 'orange'
                            ? 'bg-orange-600'
                            : stockStatus.color === 'red'
                            ? 'bg-red-600'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${stockPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="text-xs text-gray-600">Current Stock</p>
                      <p className="font-bold text-gray-900">
                        {formatNumber(item.current_stock_liters)} L
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Min Stock</p>
                      <p className="font-medium text-gray-900">
                        {formatNumber(item.min_stock_level)} L
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Reorder Point</p>
                      <p className="font-medium text-gray-900">{formatNumber(item.reorder_point)} L</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Last Restocked</p>
                      <p className="font-medium text-gray-900">
                        {item.last_restocked ? formatDate(item.last_restocked, 'P') : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Total Value */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Total Inventory Value</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(Number(item.current_stock_liters) * Number(item.selling_price_per_liter))}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm">Reorder</Button>
                    <Button variant="outline" size="sm">Update Stock</Button>
                    <Button variant="outline" size="sm">View History</Button>
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
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">
                {searchQuery || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding products to your inventory'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function RetailerInventoryPage() {
  return (
    <ProtectedRoute allowedRoles={['retailer']}>
      <DashboardLayout>
        <InventoryContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
