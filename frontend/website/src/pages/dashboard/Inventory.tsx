import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@components/common/Card'
import { Input } from '@components/common/Input'
import { Button } from '@components/common/Button'
import { Badge } from '@components/common/Badge'
import { Select } from '@components/common/Select'
import { Search, Plus, Download, Package, AlertTriangle } from 'lucide-react'

export const Inventory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  const inventoryItems = [
    {
      id: 1,
      product: 'Groundnut',
      variety: 'TMV-2',
      batch: 'BATCH-001',
      quantity: 2500,
      unit: 'kg',
      warehouse: 'Main Storage',
      quality: 'Grade A',
      purchaseDate: '2024-10-01',
      expiryDate: '2025-04-01',
      price: 85,
      status: 'In Stock',
    },
    {
      id: 2,
      product: 'Sesame',
      variety: 'White',
      batch: 'BATCH-002',
      quantity: 1800,
      unit: 'kg',
      warehouse: 'Regional Hub',
      quality: 'Grade A',
      purchaseDate: '2024-10-15',
      expiryDate: '2025-04-15',
      price: 120,
      status: 'In Stock',
    },
    {
      id: 3,
      product: 'Sunflower',
      variety: 'Hybrid',
      batch: 'BATCH-003',
      quantity: 150,
      unit: 'kg',
      warehouse: 'Collection Center',
      quality: 'Grade B',
      purchaseDate: '2024-11-01',
      expiryDate: '2025-05-01',
      price: 65,
      status: 'Low Stock',
    },
  ]

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'groundnut', label: 'Groundnut' },
    { value: 'sesame', label: 'Sesame' },
    { value: 'sunflower', label: 'Sunflower' },
    { value: 'mustard', label: 'Mustard' },
    { value: 'safflower', label: 'Safflower' },
  ]

  const totalValue = inventoryItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Inventory</h1>
          <p className="text-neutral-600 mt-2">Track and manage your stock</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" leftIcon={<Download className="h-5 w-5" />}>
            Export
          </Button>
          <Button variant="primary" leftIcon={<Plus className="h-5 w-5" />}>
            Add Stock
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Items</p>
                <p className="text-2xl font-bold text-navy-900">
                  {inventoryItems.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Quantity</p>
                <p className="text-2xl font-bold text-navy-900">4,450 kg</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-navy-900">
                  ₹{totalValue.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600">1</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>Stock Details</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  placeholder="Search inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                options={categoryOptions}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
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
                    Product
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Batch
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Quantity
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Warehouse
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Quality
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Price/kg
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Expiry
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-navy-900">{item.product}</p>
                        <p className="text-xs text-neutral-600">{item.variety}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-700">{item.batch}</td>
                    <td className="py-3 px-4 text-sm font-medium text-navy-900">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-700">{item.warehouse}</td>
                    <td className="py-3 px-4">
                      <Badge variant={item.quality === 'Grade A' ? 'success' : 'warning'}>
                        {item.quality}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-navy-900">
                      ₹{item.price}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-700">{item.expiryDate}</td>
                    <td className="py-3 px-4">
                      <Badge variant={item.status === 'In Stock' ? 'success' : 'error'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          Move
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