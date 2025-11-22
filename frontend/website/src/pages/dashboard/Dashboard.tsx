import React from 'react'
import { useAuth } from '@hooks/useAuth'
import { Card, CardHeader, CardTitle, CardContent } from '@components/common/Card'
import {
  Users,
  Package,
  DollarSign,
  Warehouse,
  Truck,
  ShoppingCart,
  AlertCircle,
} from 'lucide-react'
import { BarChart, LineChart } from '@components/shared/Charts'

export const Dashboard: React.FC = () => {
  const { user } = useAuth()

  const stats = [
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Total Members',
      value: '1,234',
      change: '+12%',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      icon: <Package className="h-6 w-6" />,
      title: 'Total Inventory',
      value: '45,678 kg',
      change: '+8%',
      color: 'bg-green-100 text-green-700',
    },
    {
      icon: <ShoppingCart className="h-6 w-6" />,
      title: 'Active Orders',
      value: '23',
      change: '+5',
      color: 'bg-orange-100 text-orange-700',
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: 'Revenue (This Month)',
      value: '₹12,34,567',
      change: '+15%',
      color: 'bg-purple-100 text-purple-700',
    },
  ]

  const recentOrders = [
    {
      id: 'ORD-001',
      buyer: 'ABC Processors',
      product: 'Groundnut',
      quantity: '500 kg',
      amount: '₹45,000',
      status: 'Pending',
    },
    {
      id: 'ORD-002',
      buyer: 'XYZ Retailers',
      product: 'Sesame',
      quantity: '300 kg',
      amount: '₹38,000',
      status: 'Confirmed',
    },
    {
      id: 'ORD-003',
      buyer: 'DEF Foods',
      product: 'Sunflower',
      quantity: '750 kg',
      amount: '₹67,500',
      status: 'Shipped',
    },
  ]

  const alerts = [
    {
      type: 'warning',
      message: 'Low stock alert: Groundnut inventory below threshold',
      time: '2 hours ago',
    },
    {
      type: 'info',
      message: 'New order received from ABC Processors',
      time: '4 hours ago',
    },
    {
      type: 'success',
      message: 'Payment received for Order #ORD-345',
      time: '1 day ago',
    },
  ]

  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [65000, 75000, 85000, 95000, 105000, 123456],
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
      },
    ],
  }

  const inventoryData = {
    labels: ['Groundnut', 'Sesame', 'Sunflower', 'Mustard', 'Safflower'],
    datasets: [
      {
        label: 'Current Stock (kg)',
        data: [12000, 8500, 15000, 6000, 4178],
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899',
        ],
      },
    ],
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-navy-900">
          Welcome back, {user?.username || user?.email}!
        </h1>
        <p className="text-neutral-600 mt-2">
          Here's what's happening with your organization today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={monthlyData} height={300} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={inventoryData} height={300} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
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
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4 text-sm font-medium text-navy-900">
                        {order.id}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-700">
                        {order.buyer}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-700">
                        {order.product}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-700">
                        {order.quantity}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-navy-900">
                        {order.amount}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'Confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    alert.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-200'
                      : alert.type === 'info'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <AlertCircle
                      className={`h-5 w-5 mt-0.5 ${
                        alert.type === 'warning'
                          ? 'text-yellow-600'
                          : alert.type === 'info'
                          ? 'text-blue-600'
                          : 'text-green-600'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-neutral-800">{alert.message}</p>
                      <p className="text-xs text-neutral-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-navy-500 hover:bg-navy-50 transition-colors text-center">
              <Warehouse className="h-8 w-8 mx-auto mb-2 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-700">Add Warehouse</span>
            </button>
            <button className="p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-navy-500 hover:bg-navy-50 transition-colors text-center">
              <Truck className="h-8 w-8 mx-auto mb-2 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-700">Add Vehicle</span>
            </button>
            <button className="p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-navy-500 hover:bg-navy-50 transition-colors text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-700">Add Member</span>
            </button>
            <button className="p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-navy-500 hover:bg-navy-50 transition-colors text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-700">Add Inventory</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}