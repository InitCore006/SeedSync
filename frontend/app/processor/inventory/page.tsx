'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Package2, Search, AlertCircle, BoxesIcon } from 'lucide-react';
import { formatNumber, formatDate } from '@/lib/utils';

// Mock data - replace with API
const mockRawMaterials = [
  { id: 1, name: 'Soybean Seeds', quantity: 15000, unit: 'kg', category: 'raw', location: 'Warehouse 1', minStock: 5000, status: 'optimal', lastUpdated: '2025-12-05' },
  { id: 2, name: 'Mustard Seeds', quantity: 8000, unit: 'kg', category: 'raw', location: 'Warehouse 1', minStock: 3000, status: 'optimal', lastUpdated: '2025-12-04' },
  { id: 3, name: 'Groundnut', quantity: 2000, unit: 'kg', category: 'raw', location: 'Warehouse 2', minStock: 4000, status: 'low', lastUpdated: '2025-12-05' },
];

const mockFinishedGoods = [
  { id: 4, name: 'Soybean Oil', quantity: 5000, unit: 'liters', category: 'finished', location: 'Storage A', minStock: 2000, status: 'optimal', lastUpdated: '2025-12-05' },
  { id: 5, name: 'Mustard Oil', quantity: 3500, unit: 'liters', category: 'finished', location: 'Storage B', minStock: 2000, status: 'optimal', lastUpdated: '2025-12-04' },
  { id: 6, name: 'Groundnut Oil', quantity: 1200, unit: 'liters', category: 'finished', location: 'Storage A', minStock: 1500, status: 'low', lastUpdated: '2025-12-03' },
];

function ProcessorInventoryContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const allInventory = [...mockRawMaterials, ...mockFinishedGoods];
  
  const filteredInventory = allInventory.filter(item =>
    (categoryFilter === 'all' || item.category === categoryFilter) &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rawMaterialsCount = mockRawMaterials.length;
  const finishedGoodsCount = mockFinishedGoods.length;
  const lowStockCount = allInventory.filter(item => item.status === 'low').length;

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
                <p className="text-3xl font-bold text-blue-600 mt-1">{rawMaterialsCount}</p>
              </div>
              <Package2 className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Finished Goods</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{finishedGoodsCount}</p>
              </div>
              <Package2 className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{lowStockCount}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-500 opacity-20" />
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
              {['all', 'raw', 'finished'].map(cat => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat === 'all' ? 'All' : cat === 'raw' ? 'Raw Materials' : 'Finished Goods'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Grid */}
      {filteredInventory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{item.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{item.location}</p>
                  </div>
                  <Badge variant="status" status={item.category === 'raw' ? 'pending' : 'active'}>
                    {item.category === 'raw' ? 'Raw' : 'Finished'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Current Stock:</span>
                    <span className="font-bold text-gray-900">{formatNumber(item.quantity)} {item.unit}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Min Stock:</span>
                    <span className="text-sm text-gray-900">{formatNumber(item.minStock)} {item.unit}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    {item.status === 'low' ? (
                      <Badge variant="status" status="pending">Low Stock</Badge>
                    ) : (
                      <Badge variant="status" status="active">Optimal</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Updated:</span>
                    <span className="text-xs text-gray-500">{formatDate(item.lastUpdated, 'P')}</span>
                  </div>

                  {item.status === 'low' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                      <div className="flex items-start">
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 mr-2" />
                        <p className="text-xs text-orange-800">
                          Stock is below minimum level. Consider reordering.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="primary" size="sm" className="flex-1">
                    Update Stock
                  </Button>
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
