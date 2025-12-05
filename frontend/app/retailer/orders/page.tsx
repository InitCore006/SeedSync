'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Package, Search, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';

// Mock data - replace with API call
const mockOrders = [
  {
    id: 1,
    orderNumber: 'ORD-2025-001',
    supplier: 'ABC Processors Ltd',
    items: [{ name: 'Soybean Oil', quantity: 500, unit: 'liters', price: 180 }],
    totalAmount: 90000,
    status: 'delivered',
    orderDate: '2025-12-01',
    deliveryDate: '2025-12-04',
  },
  {
    id: 2,
    orderNumber: 'ORD-2025-002',
    supplier: 'XYZ Oil Mills',
    items: [
      { name: 'Mustard Oil', quantity: 300, unit: 'liters', price: 200 },
      { name: 'Groundnut Oil', quantity: 200, unit: 'liters', price: 220 },
    ],
    totalAmount: 104000,
    status: 'in_transit',
    orderDate: '2025-12-03',
    expectedDelivery: '2025-12-06',
  },
  {
    id: 3,
    orderNumber: 'ORD-2025-003',
    supplier: 'PQR Industries',
    items: [{ name: 'Sunflower Oil', quantity: 400, unit: 'liters', price: 160 }],
    totalAmount: 64000,
    status: 'pending',
    orderDate: '2025-12-05',
    expectedDelivery: '2025-12-08',
  },
  {
    id: 4,
    orderNumber: 'ORD-2025-004',
    supplier: 'LMN Processors',
    items: [{ name: 'Sesame Oil', quantity: 150, unit: 'liters', price: 280 }],
    totalAmount: 42000,
    status: 'processing',
    orderDate: '2025-12-05',
    expectedDelivery: '2025-12-09',
  },
];

const statusConfig = {
  pending: { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Pending' },
  processing: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Processing' },
  in_transit: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50', label: 'In Transit' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' },
};

function OrdersContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = mockOrders.filter(order =>
    (statusFilter === 'all' || order.status === statusFilter) &&
    (order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
     order.supplier.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalOrders = mockOrders.length;
  const pendingOrders = mockOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const completedOrders = mockOrders.filter(o => o.status === 'delivered').length;
  const totalValue = mockOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600 mt-1">Track and manage your purchase orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalOrders}</p>
              </div>
              <Package className="w-12 h-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{pendingOrders}</p>
              </div>
              <Clock className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{completedOrders}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
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
                placeholder="Search by order number or supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'processing', 'in_transit', 'delivered'].map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const StatusIcon = statusConfig[order.status as keyof typeof statusConfig].icon;
            const statusInfo = statusConfig[order.status as keyof typeof statusConfig];

            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{order.orderNumber}</h3>
                      <p className="text-sm text-gray-600 mt-1">{order.supplier}</p>
                    </div>
                    <Badge variant="status" status={order.status}>
                      <StatusIcon className="w-4 h-4 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">ORDER ITEMS</p>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm text-gray-900">{item.name}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {item.quantity} {item.unit} × {formatCurrency(item.price)} = {formatCurrency(item.quantity * item.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Order Date</p>
                      <p className="font-medium text-gray-900">{formatDate(order.orderDate, 'P')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">
                        {order.status === 'delivered' ? 'Delivered On' : 'Expected Delivery'}
                      </p>
                      <p className="font-medium text-gray-900">
                        {formatDate(order.deliveryDate || order.expectedDelivery || '', 'P')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Items</p>
                      <p className="font-medium text-gray-900">{order.items.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Amount</p>
                      <p className="font-bold text-primary">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    {order.status === 'in_transit' && (
                      <Button variant="primary" size="sm">Track Shipment</Button>
                    )}
                    {order.status === 'delivered' && (
                      <Button variant="outline" size="sm">Download Invoice</Button>
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
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'You haven\'t placed any orders yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function RetailerOrdersPage() {
  return (
    <ProtectedRoute allowedRoles={['retailer']}>
      <DashboardLayout>
        <OrdersContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
