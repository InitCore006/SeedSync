'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import Modal from '@/components/ui/Modal';
import { Package, Search, Clock, CheckCircle, Truck, XCircle, AlertCircle } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import useSWR from 'swr';
import { API } from '@/lib/api';
import { toast } from 'react-hot-toast';

const statusConfig = {
  pending: { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Pending', nextAction: 'Confirm Order' },
  confirmed: { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Confirmed', nextAction: 'Start Processing' },
  processing: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Processing', nextAction: 'Ship Order' },
  in_transit: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50', label: 'In Transit', nextAction: 'Mark Delivered' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Delivered', nextAction: null },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled', nextAction: null },
};

interface OrderActionModalProps {
  order: any;
  action: string;
  onClose: () => void;
  onSuccess: () => void;
}

function OrderActionModal({ order, action, onClose, onSuccess }: OrderActionModalProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  const getNextStatus = () => {
    const statusMap: Record<string, string> = {
      'Confirm Order': 'confirmed',
      'Start Processing': 'processing',
      'Ship Order': 'in_transit',
      'Mark Delivered': 'delivered',
      'Cancel Order': 'cancelled',
    };
    return statusMap[action] || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newStatus = getNextStatus();
      const response = await API.processor.updateOrderStatus(order.id, {
        status: newStatus,
        notes: notes || undefined,
        tracking_number: trackingNumber || undefined,
        cancellation_reason: cancellationReason || undefined,
      });

      if (response.status === 'success') {
        toast.success(`Order ${action.toLowerCase()} successfully!`);
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Failed to update order');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={action}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-gray-900">{order.order_number}</h4>
          <p className="text-sm text-gray-600">Retailer: {order.retailer_name}</p>
          <p className="text-sm text-gray-600">Total: {formatCurrency(order.total_amount)}</p>
        </div>

        {action === 'Ship Order' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tracking Number (Optional)
            </label>
            <Input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              disabled={loading}
            />
          </div>
        )}

        {action === 'Cancel Order' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cancellation Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Enter reason for cancellation"
              required
              disabled={loading}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes..."
            disabled={loading}
          />
        </div>

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
            {loading ? 'Processing...' : 'Confirm'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ProcessorOrdersContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState<string>('');

  const { data: ordersResponse, error, mutate } = useSWR(
    ['/processor/orders', statusFilter],
    () => API.processor.getOrders(statusFilter !== 'all' ? { status: statusFilter } : undefined)
  );

  const isLoading = !ordersResponse && !error;

  if (isLoading) return <Loading fullScreen />;
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load orders
        </div>
      </div>
    );
  }

  const orders = Array.isArray(ordersResponse?.data) ? ordersResponse.data : [];

  const filteredOrders = orders.filter((order: any) =>
    order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.retailer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o: any) => o.status === 'pending' || o.status === 'confirmed').length;
  const processingOrders = orders.filter((o: any) => o.status === 'processing' || o.status === 'in_transit').length;
  const completedOrders = orders.filter((o: any) => o.status === 'delivered').length;
  const totalRevenue = orders.filter((o: any) => o.status === 'delivered').reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);

  const handleAction = (order: any, action: string) => {
    setSelectedOrder(order);
    setSelectedAction(action);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600 mt-1">Manage incoming orders from retailers</p>
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
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{processingOrders}</p>
              </div>
              <Truck className="w-12 h-12 text-blue-500 opacity-20" />
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
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by order number or retailer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'confirmed', 'processing', 'in_transit', 'delivered'].map(status => (
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
                      <p className="text-sm text-gray-600 mt-1">{order.retailer_name}</p>
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
                              {formatNumber(item.quantity_liters)} L × {formatCurrency(item.unit_price)}
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
                      <p className="text-xs text-gray-600">Expected Delivery</p>
                      <p className="font-medium text-gray-900">
                        {order.expected_delivery_date ? formatDate(order.expected_delivery_date, 'P') : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Payment Status</p>
                      <Badge variant="status" status={order.payment_status === 'paid' ? 'delivered' : 'pending'}>
                        {order.payment_status_display}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Amount</p>
                      <p className="font-bold text-primary">{formatCurrency(order.total_amount)}</p>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-blue-900 mb-1">DELIVERY ADDRESS</p>
                    <p className="text-sm text-blue-900">
                      {order.delivery_address}, {order.delivery_city}, {order.delivery_state} - {order.delivery_pincode}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {statusInfo.nextAction && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAction(order, statusInfo.nextAction)}
                      >
                        {statusInfo.nextAction}
                      </Button>
                    )}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(order, 'Cancel Order')}
                      >
                        Cancel Order
                      </Button>
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
                  : 'No orders have been placed yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Modal */}
      {selectedOrder && selectedAction && (
        <OrderActionModal
          order={selectedOrder}
          action={selectedAction}
          onClose={() => {
            setSelectedOrder(null);
            setSelectedAction('');
          }}
          onSuccess={() => {
            mutate();
          }}
        />
      )}
    </div>
  );
}

export default function ProcessorOrdersPage() {
  return (
    <ProtectedRoute allowedRoles={['processor']}>
      <DashboardLayout>
        <ProcessorOrdersContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
