'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import Modal from '@/components/ui/Modal';
import { Package, Search, Clock, CheckCircle, Truck, XCircle, X, Download, MapPin, Calendar } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { useRetailerOrders } from '@/lib/hooks/useRetailer';
import { API } from '@/lib/api';
import { toast } from 'react-hot-toast';

const statusConfig = {
  pending: { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Pending' },
  confirmed: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Confirmed' },
  processing: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Processing' },
  in_transit: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50', label: 'In Transit' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' },
};

interface OrderDetailModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onDownloadInvoice: (orderId: string) => void;
}

function OrderDetailModal({ order, isOpen, onClose, onDownloadInvoice }: OrderDetailModalProps) {
  if (!order) return null;

  const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Package;
  const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Details" size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{order.order_number}</h3>
            <p className="text-sm text-gray-600 mt-1">{order.processor_name}</p>
          </div>
          <Badge variant="status" status={order.status}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>

        {/* Order Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Order Date</p>
            <p className="text-sm font-medium text-gray-900 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              {formatDate(order.order_date, 'PPP')}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">
              {order.status === 'delivered' ? 'Delivered On' : 'Expected Delivery'}
            </p>
            <p className="text-sm font-medium text-gray-900 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              {formatDate(order.actual_delivery_date || order.expected_delivery_date || '', 'PPP')}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Payment Status</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {order.payment_status_display || order.payment_status}
            </span>
          </div>
          {order.tracking_number && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Tracking Number</p>
              <p className="text-sm font-medium text-gray-900">{order.tracking_number}</p>
            </div>
          )}
        </div>

        {/* Delivery Address */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-500 mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            DELIVERY ADDRESS
          </p>
          <p className="text-sm text-gray-900">
            {order.delivery_address}<br />
            {order.delivery_city}, {order.delivery_state} - {order.delivery_pincode}
          </p>
        </div>

        {/* Order Items */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">ORDER ITEMS</p>
          <div className="space-y-2">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{item.product_name}</p>
                  <p className="text-xs text-gray-600">Batch: {item.batch_number}</p>
                  <p className="text-sm text-gray-700 mt-1">
                    {formatNumber(item.quantity_liters)} L × {formatCurrency(item.unit_price)}
                  </p>
                </div>
                <p className="text-lg font-bold text-primary">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (GST)</span>
            <span className="font-medium text-gray-900">{formatCurrency(order.tax_amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium text-gray-900">{formatCurrency(order.shipping_charges)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span className="text-gray-900">Total</span>
            <span className="text-primary">{formatCurrency(order.total_amount)}</span>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-900 mb-1">NOTES</p>
            <p className="text-sm text-blue-800">{order.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          {order.status === 'delivered' && (
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => onDownloadInvoice(order.id)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          )}
          {order.status === 'in_transit' && order.tracking_number && (
            <Button variant="outline" className="flex-1">
              <Truck className="w-4 h-4 mr-2" />
              Track Shipment
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function OrdersContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { orders, isLoading, isError } = useRetailerOrders();

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      setIsDownloading(true);
      const blob = await API.retailer.downloadInvoice(orderId);
      
      // Create object URL and download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const order = orders.find((o: any) => o.id === orderId);
      link.download = `invoice_${order?.order_number || orderId}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Failed to download invoice:', error);
      toast.error('Failed to download invoice');
    } finally {
      setIsDownloading(false);
    }
  };

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
      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDownloadInvoice={handleDownloadInvoice}
      />

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
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(order)}>
                      View Details
                    </Button>
                    {order.status === 'in_transit' && order.tracking_number && (
                      <Button variant="primary" size="sm">Track Shipment</Button>
                    )}
                    {order.status === 'delivered' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadInvoice(order.id)}
                        disabled={isDownloading}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download Invoice
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
