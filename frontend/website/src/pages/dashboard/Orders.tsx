import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@components/common/Card'
import { Input } from '@components/common/Input'
import { Button } from '@components/common/Button'
import { Badge } from '@components/common/Badge'
import { Select } from '@components/common/Select'
import { Search, Plus, Download, Filter, Eye } from 'lucide-react'

export const Orders: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const orders = [
    {
      id: 'ORD-001',
      buyer: 'ABC Processors Pvt Ltd',
      product: 'Groundnut',
      variety: 'TMV-2',
      quantity: 500,
      unit: 'kg',
      price: 85,
      totalAmount: 42500,
      orderDate: '2024-11-15',
      deliveryDate: '2024-11-25',
      status: 'Pending',
      paymentStatus: 'Pending',
    },
    {
      id: 'ORD-002',
      buyer: 'XYZ Retailers',
      product: 'Sesame',
      variety: 'White',
      quantity: 300,
      unit: 'kg',
      price: 120,
      totalAmount: 36000,
      orderDate: '2024-11-18',
      deliveryDate: '2024-11-28',
      status: 'Confirmed',
      paymentStatus: 'Advance Paid',
    },
    {
      id: 'ORD-003',
      buyer: 'DEF Foods Ltd',
      product: 'Sunflower',
      variety: 'Hybrid',
      quantity: 750,
      unit: 'kg',
      price: 65,
      totalAmount: 48750,
      orderDate: '2024-11-20',
      deliveryDate: '2024-11-30',
      status: 'Shipped',
      paymentStatus: 'Paid',
    },
    {
      id: 'ORD-004',
      buyer: 'GHI Exports',
      product: 'Mustard',
      variety: 'Black',
      quantity: 1000,
      unit: 'kg',
      price: 95,
      totalAmount: 95000,
      orderDate: '2024-11-10',
      deliveryDate: '2024-11-20',
      status: 'Delivered',
      paymentStatus: 'Paid',
    },
    {
      id: 'ORD-005',
      buyer: 'JKL Oil Mills',
      product: 'Safflower',
      variety: 'Standard',
      quantity: 400,
      unit: 'kg',
      price: 78,
      totalAmount: 31200,
      orderDate: '2024-11-22',
      deliveryDate: '2024-12-02',
      status: 'Cancelled',
      paymentStatus: 'Refunded',
    },
  ]

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning'
      case 'confirmed':
        return 'navy'
      case 'shipped':
        return 'tangerine'
      case 'delivered':
        return 'success'
      case 'cancelled':
        return 'error'
      default:
        return 'neutral'
    }
  }

  const getPaymentStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success'
      case 'advance paid':
        return 'navy'
      case 'pending':
        return 'warning'
      case 'refunded':
        return 'error'
      default:
        return 'neutral'
    }
  }

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, order) => sum + order.totalAmount, 0)

  const pendingOrders = orders.filter((o) => o.status === 'Pending').length
  const completedOrders = orders.filter((o) => o.status === 'Delivered').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Orders</h1>
          <p className="text-neutral-600 mt-2">Manage your sales orders</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" leftIcon={<Download className="h-5 w-5" />}>
            Export
          </Button>
          <Button variant="primary" leftIcon={<Plus className="h-5 w-5" />}>
            New Order
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-navy-900">{orders.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Filter className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{pendingOrders}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Filter className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Filter className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-navy-900">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Filter className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>Order Management</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                options={statusOptions}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Order ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Buyer
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Product
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Quantity
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Order Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Delivery Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Payment
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4 text-sm font-medium text-navy-900">
                      {order.id}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-700">{order.buyer}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-navy-900">{order.product}</p>
                        <p className="text-xs text-neutral-600">{order.variety}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-700">
                      {order.quantity} {order.unit}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-navy-900">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-700">
                      {order.orderDate}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-700">
                      {order.deliveryDate}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}