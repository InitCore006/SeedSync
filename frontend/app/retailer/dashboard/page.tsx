'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { ShoppingCart, Package, TrendingUp, Users, IndianRupee, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock hook for retailer dashboard (replace with actual API hook when backend is ready)
function useRetailerDashboard() {
  // TODO: Replace with actual API call when endpoint is ready
  const mockData = {
    total_orders: 145,
    pending_orders: 12,
    completed_orders: 128,
    cancelled_orders: 5,
    total_revenue: 2850000,
    avg_order_value: 19655,
    active_suppliers: 8,
    inventory_items: 45,
    low_stock_items: 7,
    recent_orders: [
      {
        id: '1',
        order_number: 'ORD-2024-001',
        supplier_name: 'Rajasthan Oil Mills',
        product_name: 'Mustard Oil',
        quantity: 500,
        unit: 'L',
        total_amount: 45000,
        status: 'delivered',
        order_date: new Date().toISOString(),
      },
      {
        id: '2',
        order_number: 'ORD-2024-002',
        supplier_name: 'Gujarat Groundnut Processors',
        product_name: 'Groundnut Oil',
        quantity: 300,
        unit: 'L',
        total_amount: 33000,
        status: 'in_transit',
        order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        order_number: 'ORD-2024-003',
        supplier_name: 'Maharashtra Soybean Co.',
        product_name: 'Soybean Oil',
        quantity: 400,
        unit: 'L',
        total_amount: 38000,
        status: 'pending',
        order_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    low_stock_alerts: [
      { id: '1', product_name: 'Mustard Oil', current_stock: 50, min_stock: 100, unit: 'L' },
      { id: '2', product_name: 'Groundnut Oil', current_stock: 30, min_stock: 80, unit: 'L' },
      { id: '3', product_name: 'Sunflower Oil', current_stock: 25, min_stock: 60, unit: 'L' },
    ],
    top_products: [
      { product_name: 'Mustard Oil', quantity_sold: 2500, revenue: 225000 },
      { product_name: 'Groundnut Oil', quantity_sold: 1800, revenue: 198000 },
      { product_name: 'Soybean Oil', quantity_sold: 1500, revenue: 142500 },
      { product_name: 'Sunflower Oil', quantity_sold: 1200, revenue: 132000 },
    ],
    monthly_sales: [
      { month: 'Jul', revenue: 320000 },
      { month: 'Aug', revenue: 380000 },
      { month: 'Sep', revenue: 420000 },
      { month: 'Oct', revenue: 450000 },
      { month: 'Nov', revenue: 520000 },
      { month: 'Dec', revenue: 580000 },
    ],
  };

  return {
    dashboard: mockData,
    isLoading: false,
    isError: false,
  };
}

function RetailerDashboardContent() {
  const router = useRouter();
  const { dashboard: stats, isLoading, isError } = useRetailerDashboard();

  if (isLoading) return <Loading fullScreen />;
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load dashboard data
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Retailer Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your orders, inventory, and sales</p>
      </div>

      {/* Low Stock Alert */}
      {stats?.low_stock_alerts && stats.low_stock_alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900">Low Stock Alert</p>
              <p className="text-sm text-yellow-700 mt-1">
                {stats.low_stock_alerts.length} products are running low on stock. Consider reordering.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-yellow-600 text-yellow-600 hover:bg-yellow-100"
                onClick={() => router.push('/retailer/inventory')}
              >
                View Inventory
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats?.total_orders || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="text-green-600">
                {stats?.completed_orders || 0} completed
              </span>
              <span className="text-yellow-600">
                {stats?.pending_orders || 0} pending
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats?.total_revenue || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Avg: {formatCurrency(stats?.avg_order_value || 0)}/order
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats?.active_suppliers || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-purple-600"
              onClick={() => router.push('/retailer/suppliers')}
            >
              View Suppliers →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats?.inventory_items || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-red-600 font-medium">
              {stats?.low_stock_items || 0} low stock
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recent_orders && stats.recent_orders.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_orders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{order.order_number}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.supplier_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {order.product_name} • {order.quantity} {order.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.order_date, 'PP')}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <Badge variant="status" status={order.status}>
                        {order.status === 'in_transit' ? 'In Transit' : order.status}
                      </Badge>
                      <p className="text-sm font-semibold text-gray-900 mt-2">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push('/retailer/orders')}
                >
                  View All Orders
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="font-medium">No orders yet</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push('/marketplace')}
                >
                  Browse Marketplace
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.top_products && stats.top_products.map((product: any, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{product.product_name}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{formatNumber(product.quantity_sold)} L sold</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(product.revenue / stats.top_products[0].revenue) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {stats?.low_stock_alerts && stats.low_stock_alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.low_stock_alerts.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-600">
                        Current: {item.current_stock} {item.unit} • Min: {item.min_stock} {item.unit}
                      </p>
                    </div>
                  </div>
                  <Button variant="primary" size="sm">
                    Reorder
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Sales Trend */}
      {stats?.monthly_sales && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-2">
              {stats.monthly_sales.map((month: any, index: number) => {
                const maxRevenue = Math.max(...stats.monthly_sales.map((m: any) => m.revenue));
                const height = (month.revenue / maxRevenue) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary-dark"
                      style={{
                        height: `${height}%`,
                        minHeight: '20px',
                      }}
                    />
                    <p className="text-xs text-gray-600 mt-2">{month.month}</p>
                    <p className="text-xs font-semibold text-gray-900">
                      ₹{(month.revenue / 100000).toFixed(1)}L
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-2 mt-6">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                +15.2% growth this month
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function RetailerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['retailer']}>
      <DashboardLayout>
        <RetailerDashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
