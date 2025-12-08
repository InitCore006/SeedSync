'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import { Package, Search, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { useRetailerOrders } from '@/lib/hooks/useRetailer';

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

  const { orders, isLoading, isError } = useRetailerOrders();

  if (isLoading) return <Loading fullScreen />;
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load orders
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((order: any) =>
    (statusFilter === 'all' || order.status === statusFilter) &&
    (order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
     order.processor_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o: any) => o.status === 'pending' || o.status === 'processing').length;
  const completedOrders = orders.filter((o: any) => o.status === 'delivered').length;
  const totalValue = orders.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);

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
          {filteredOrders.map((order: any) => {
            const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Package;
            const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;

            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{order.order_number}</h3>
                      <p className="text-sm text-gray-600 mt-1">{order.processor_name}</p>
                    </div>
                    <Badge variant="status" status={order.status}>
                      <StatusIcon className="w-4 h-4 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-xs font-medium text-gray-600 mb-2">ORDER ITEMS</p>
                      <div className="space-y-2">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-sm text-gray-900">{item.product_name}</span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatNumber(item.quantity_liters)} L × {formatCurrency(item.unit_price)} = {formatCurrency(item.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Order Date</p>
                      <p className="font-medium text-gray-900">{formatDate(order.order_date, 'P')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">
                        {order.status === 'delivered' ? 'Delivered On' : 'Expected Delivery'}
                      </p>
                      <p className="font-medium text-gray-900">
                        {formatDate(order.actual_delivery_date || order.expected_delivery_date || '', 'P')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Items</p>
                      <p className="font-medium text-gray-900">{order.items?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Amount</p>
                      <p className="font-bold text-primary">{formatCurrency(order.total_amount)}</p>
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
