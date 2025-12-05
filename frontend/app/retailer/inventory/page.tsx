'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Package, Search, AlertTriangle, TrendingDown, Plus } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';

// Mock data - replace with API call
const mockInventory = [
  {
    id: 1,
    name: 'Soybean Oil',
    sku: 'SOY-OIL-1L',
    category: 'Oil',
    quantity: 450,
    unit: 'liters',
    minStock: 200,
    maxStock: 1000,
    price: 180,
    supplier: 'ABC Processors Ltd',
    lastRestocked: '2025-12-01',
    expiryDate: '2026-06-01',
  },
  {
    id: 2,
    name: 'Mustard Oil',
    sku: 'MUS-OIL-1L',
    category: 'Oil',
    quantity: 120,
    unit: 'liters',
    minStock: 150,
    maxStock: 800,
    price: 200,
    supplier: 'XYZ Oil Mills',
    lastRestocked: '2025-11-28',
    expiryDate: '2026-05-28',
  },
  {
    id: 3,
    name: 'Groundnut Oil',
    sku: 'GND-OIL-1L',
    category: 'Oil',
    quantity: 680,
    unit: 'liters',
    minStock: 300,
    maxStock: 1200,
    price: 220,
    supplier: 'XYZ Oil Mills',
    lastRestocked: '2025-12-03',
    expiryDate: '2026-06-03',
  },
  {
    id: 4,
    name: 'Sunflower Oil',
    sku: 'SUN-OIL-1L',
    category: 'Oil',
    quantity: 85,
    unit: 'liters',
    minStock: 100,
    maxStock: 600,
    price: 160,
    supplier: 'PQR Industries',
    lastRestocked: '2025-11-25',
    expiryDate: '2026-05-25',
  },
  {
    id: 5,
    name: 'Sesame Oil',
    sku: 'SES-OIL-500ML',
    category: 'Oil',
    quantity: 220,
    unit: 'liters',
    minStock: 100,
    maxStock: 400,
    price: 280,
    supplier: 'LMN Processors',
    lastRestocked: '2025-12-02',
    expiryDate: '2026-06-02',
  },
];

function InventoryContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredInventory = mockInventory.filter(item =>
    (categoryFilter === 'all' || item.category === categoryFilter) &&
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.supplier.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalItems = mockInventory.length;
  const totalValue = mockInventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const lowStockItems = mockInventory.filter(item => item.quantity < item.minStock).length;
  const outOfStockItems = mockInventory.filter(item => item.quantity === 0).length;

  const getStockStatus = (quantity: number, minStock: number, maxStock: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'red' };
    if (quantity < minStock) return { label: 'Low Stock', color: 'orange' };
    if (quantity >= maxStock * 0.8) return { label: 'Well Stocked', color: 'green' };
    return { label: 'In Stock', color: 'blue' };
  };

  const getStockPercentage = (quantity: number, maxStock: number) => {
    return Math.min((quantity / maxStock) * 100, 100);
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
          {filteredInventory.map((item) => {
            const stockStatus = getStockStatus(item.quantity, item.minStock, item.maxStock);
            const stockPercentage = getStockPercentage(item.quantity, item.maxStock);

            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                        <Badge variant="status" status={stockStatus.label.toLowerCase().replace(' ', '_')}>
                          {stockStatus.label}
                        </Badge>
                        {item.quantity < item.minStock && (
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">SKU: {item.sku} | Supplier: {item.supplier}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{formatCurrency(item.price)}</p>
                      <p className="text-xs text-gray-600">per {item.unit}</p>
                    </div>
                  </div>

                  {/* Stock Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Stock Level</span>
                      <span>
                        {item.quantity} / {item.maxStock} {item.unit}
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
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Min Stock</p>
                      <p className="font-medium text-gray-900">
                        {item.minStock} {item.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Last Restocked</p>
                      <p className="font-medium text-gray-900">{formatDate(item.lastRestocked, 'P')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Expiry Date</p>
                      <p className="font-medium text-gray-900">{formatDate(item.expiryDate, 'P')}</p>
                    </div>
                  </div>

                  {/* Total Value */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Total Inventory Value</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(item.quantity * item.price)}
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
