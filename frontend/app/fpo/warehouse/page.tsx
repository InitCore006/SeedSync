'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Package, Search, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { formatNumber, formatDate } from '@/lib/utils';

// Mock data - replace with API call
const mockInventory = [
  { id: 1, crop: 'Soybean', quantity: 5000, unit: 'kg', location: 'Warehouse A', grade: 'A+', status: 'optimal', lastUpdated: '2025-12-05', minStock: 1000 },
  { id: 2, crop: 'Mustard', quantity: 800, unit: 'kg', location: 'Warehouse B', grade: 'A', status: 'low', lastUpdated: '2025-12-04', minStock: 1000 },
  { id: 3, crop: 'Groundnut', quantity: 12000, unit: 'kg', location: 'Warehouse A', grade: 'A+', status: 'optimal', lastUpdated: '2025-12-05', minStock: 2000 },
  { id: 4, crop: 'Sunflower', quantity: 3500, unit: 'kg', location: 'Warehouse C', grade: 'B', status: 'optimal', lastUpdated: '2025-12-03', minStock: 1500 },
];

function WarehouseContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const filteredInventory = mockInventory.filter(item =>
    (selectedLocation === 'all' || item.location === selectedLocation) &&
    item.crop.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalQuantity = mockInventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = mockInventory.filter(item => item.status === 'low').length;
  const locations = ['all', ...new Set(mockInventory.map(item => item.location))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Warehouse Management</h1>
        <p className="text-gray-600 mt-1">Track and manage your inventory across storage locations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{mockInventory.length}</p>
              </div>
              <Package className="w-12 h-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stock</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(totalQuantity)} kg</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{lowStockItems}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Locations</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{locations.length - 1}</p>
              </div>
              <Package className="w-12 h-12 text-blue-500 opacity-20" />
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
                placeholder="Search by crop name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>
                  {loc === 'all' ? 'All Locations' : loc}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInventory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">{item.crop}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-gray-900 font-semibold">{formatNumber(item.quantity)} {item.unit}</span>
                          {item.status === 'low' && (
                            <TrendingDown className="w-4 h-4 text-orange-500 ml-2" />
                          )}
                        </div>
                        <span className="text-xs text-gray-500">Min: {formatNumber(item.minStock)} {item.unit}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="status" status="active">Grade {item.grade}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.status === 'low' ? (
                          <Badge variant="status" status="pending">Low Stock</Badge>
                        ) : (
                          <Badge variant="status" status="active">Optimal</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.lastUpdated, 'P')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button variant="outline" size="sm">View Details</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function WarehousePage() {
  return (
    <ProtectedRoute allowedRoles={['fpo']}>
      <DashboardLayout>
        <WarehouseContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
