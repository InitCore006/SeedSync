'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import { Building2, Search, Phone, Mail, MapPin, ShoppingCart, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useRetailerSuppliers } from '@/lib/hooks/useRetailer';

function SuppliersContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { suppliers, isLoading, isError } = useRetailerSuppliers();

  if (isLoading) return <Loading fullScreen />;
  
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load suppliers
        </div>
      </div>
    );
  }

  const filteredSuppliers = suppliers.filter((supplier: any) =>
    supplier.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Suppliers</h1>
        <p className="text-gray-600 mt-1">Processors you have ordered from</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{suppliers.length}</p>
              </div>
              <Building2 className="w-12 h-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {suppliers.reduce((sum: number, s: any) => sum + (s.total_orders || 0), 0)}
                </p>
              </div>
              <Package className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(suppliers.reduce((sum: number, s: any) => sum + Number(s.total_spent || 0), 0))}
                </p>
              </div>
              <ShoppingCart className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {suppliers.reduce((sum: number, s: any) => sum + (s.completed_orders || 0), 0)}
                </p>
              </div>
              <Package className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by company name, contact person, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      {filteredSuppliers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSuppliers.map((supplier: any) => (
            <Card key={supplier.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{supplier.company_name}</h3>
                    {supplier.is_verified && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{supplier.contact_person} • {supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{supplier.city}, {supplier.state}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{supplier.total_orders || 0}</p>
                    <p className="text-xs text-gray-600">Orders</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{supplier.completed_orders || 0}</p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">{formatCurrency(supplier.total_spent || 0)}</p>
                    <p className="text-xs text-gray-600">Total Spent</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => router.push('/retailer/marketplace')}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Browse Products
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/retailer/orders')}
                  >
                    View Orders
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
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search' 
                  : 'Place your first order from the marketplace to see suppliers here'}
              </p>
              <Button 
                variant="primary"
                onClick={() => router.push('/retailer/marketplace')}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Browse Marketplace
              </Button>
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
