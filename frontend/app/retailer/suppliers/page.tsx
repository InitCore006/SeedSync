'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Building2, Search, Phone, Mail, MapPin, Star, Plus, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

// Mock data - replace with API call
const mockSuppliers = [
  {
    id: 1,
    name: 'ABC Processors Ltd',
    type: 'Processor',
    contactPerson: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'contact@abcprocessors.com',
    address: 'Industrial Area, Bhopal, MP',
    products: ['Soybean Oil', 'Groundnut Oil', 'Mustard Oil'],
    rating: 4.8,
    totalOrders: 45,
    totalValue: 2850000,
    status: 'active',
    since: '2023-01-15',
  },
  {
    id: 2,
    name: 'XYZ Oil Mills',
    type: 'Processor',
    contactPerson: 'Priya Sharma',
    phone: '+91 98765 43211',
    email: 'info@xyzoilmills.com',
    address: 'GIDC Estate, Rajkot, Gujarat',
    products: ['Mustard Oil', 'Groundnut Oil', 'Sesame Oil'],
    rating: 4.6,
    totalOrders: 38,
    totalValue: 2340000,
    status: 'active',
    since: '2023-03-20',
  },
  {
    id: 3,
    name: 'PQR Industries',
    type: 'Processor',
    contactPerson: 'Amit Patel',
    phone: '+91 98765 43212',
    email: 'sales@pqrindustries.com',
    address: 'Phase 2, Pune, Maharashtra',
    products: ['Sunflower Oil', 'Soybean Oil'],
    rating: 4.5,
    totalOrders: 32,
    totalValue: 1920000,
    status: 'active',
    since: '2023-06-10',
  },
  {
    id: 4,
    name: 'LMN Processors',
    type: 'Processor',
    contactPerson: 'Sneha Reddy',
    phone: '+91 98765 43213',
    email: 'contact@lmnprocessors.com',
    address: 'Industrial Park, Hyderabad, Telangana',
    products: ['Sesame Oil', 'Groundnut Oil'],
    rating: 4.7,
    totalOrders: 28,
    totalValue: 1680000,
    status: 'active',
    since: '2023-08-05',
  },
  {
    id: 5,
    name: 'DEF Agro Solutions',
    type: 'Processor',
    contactPerson: 'Vikram Singh',
    phone: '+91 98765 43214',
    email: 'info@defagro.com',
    address: 'Sector 8, Indore, MP',
    products: ['Soybean Oil'],
    rating: 4.3,
    totalOrders: 15,
    totalValue: 850000,
    status: 'inactive',
    since: '2024-02-12',
  },
];

function SuppliersContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSuppliers = mockSuppliers.filter(supplier =>
    (statusFilter === 'all' || supplier.status === statusFilter) &&
    (supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
     supplier.products.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const totalSuppliers = mockSuppliers.length;
  const activeSuppliers = mockSuppliers.filter(s => s.status === 'active').length;
  const avgRating = mockSuppliers.reduce((sum, s) => sum + s.rating, 0) / mockSuppliers.length;
  const totalOrders = mockSuppliers.reduce((sum, s) => sum + s.totalOrders, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-600 mt-1">Manage relationships with your product suppliers</p>
        </div>
        <Button variant="primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Supplier
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalSuppliers}</p>
              </div>
              <Building2 className="w-12 h-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{activeSuppliers}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{avgRating.toFixed(1)}</p>
              </div>
              <Star className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{totalOrders}</p>
              </div>
              <Building2 className="w-12 h-12 text-blue-500 opacity-20" />
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
                placeholder="Search by name, contact, or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('inactive')}
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      {filteredSuppliers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{supplier.name}</h3>
                      <p className="text-sm text-gray-600">{supplier.type}</p>
                    </div>
                  </div>
                  <Badge variant="status" status={supplier.status}>
                    {supplier.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{supplier.contactPerson}</span>
                    <span className="mx-1">•</span>
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{supplier.address}</span>
                  </div>
                </div>

                {/* Products */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">PRODUCTS SUPPLIED</p>
                  <div className="flex flex-wrap gap-2">
                    {supplier.products.map((product, idx) => (
                      <Badge key={idx} variant="status">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                      <span className="text-sm font-bold text-gray-900">{supplier.rating}</span>
                    </div>
                    <p className="text-xs text-gray-600">Rating</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{supplier.totalOrders}</p>
                    <p className="text-xs text-gray-600">Orders</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">{formatCurrency(supplier.totalValue)}</p>
                    <p className="text-xs text-gray-600">Total Value</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" className="flex-1">
                    Place Order
                  </Button>
                  <Button variant="outline" size="sm">
                    Contact
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
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding suppliers to your network'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function RetailerSuppliersPage() {
  return (
    <ProtectedRoute allowedRoles={['retailer']}>
      <DashboardLayout>
        <SuppliersContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
