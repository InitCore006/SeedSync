import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@components/common/Card'
import { Input } from '@components/common/Input'
import { Button } from '@components/common/Button'
import { Badge } from '@components/common/Badge'
import { Search, Plus, MapPin, Package } from 'lucide-react'

export const Warehouses: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const warehouses = [
    {
      id: 1,
      name: 'Main Storage Facility',
      code: 'WH-001',
      location: 'Kanakapura, Karnataka',
      capacity: '10000 kg',
      currentStock: '7500 kg',
      utilization: 75,
      status: 'Active',
      temperature: '25°C',
      humidity: '45%',
    },
    {
      id: 2,
      name: 'Regional Hub - North',
      code: 'WH-002',
      location: 'Ramanagara, Karnataka',
      capacity: '15000 kg',
      currentStock: '12000 kg',
      utilization: 80,
      status: 'Active',
      temperature: '23°C',
      humidity: '42%',
    },
    {
      id: 3,
      name: 'Collection Center',
      code: 'WH-003',
      location: 'Mandya, Karnataka',
      capacity: '5000 kg',
      currentStock: '1500 kg',
      utilization: 30,
      status: 'Active',
      temperature: '26°C',
      humidity: '48%',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Warehouses</h1>
          <p className="text-neutral-600 mt-2">Manage your storage facilities</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="h-5 w-5" />}>
          Add Warehouse
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Capacity</p>
                <p className="text-2xl font-bold text-navy-900">30,000 kg</p>
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
                <p className="text-sm text-neutral-600 mb-1">Current Stock</p>
                <p className="text-2xl font-bold text-navy-900">21,000 kg</p>
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
                <p className="text-sm text-neutral-600 mb-1">Average Utilization</p>
                <p className="text-2xl font-bold text-navy-900">70%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warehouses List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>Storage Facilities</CardTitle>
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                placeholder="Search warehouses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {warehouses.map((warehouse) => (
              <Card key={warehouse.id} hover>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-navy-900 mb-1">
                        {warehouse.name}
                      </h3>
                      <div className="flex items-center text-sm text-neutral-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {warehouse.location}
                      </div>
                    </div>
                    <Badge variant={warehouse.status === 'Active' ? 'success' : 'neutral'}>
                      {warehouse.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Code:</span>
                      <span className="text-sm font-medium text-navy-900">
                        {warehouse.code}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Capacity:</span>
                      <span className="text-sm font-medium text-navy-900">
                        {warehouse.capacity}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Current Stock:</span>
                      <span className="text-sm font-medium text-navy-900">
                        {warehouse.currentStock}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-neutral-600">Utilization:</span>
                        <span className="text-sm font-medium text-navy-900">
                          {warehouse.utilization}%
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            warehouse.utilization >= 80
                              ? 'bg-red-500'
                              : warehouse.utilization >= 60
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${warehouse.utilization}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-200">
                      <div>
                        <p className="text-xs text-neutral-600">Temperature</p>
                        <p className="text-sm font-medium text-navy-900">
                          {warehouse.temperature}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-600">Humidity</p>
                        <p className="text-sm font-medium text-navy-900">
                          {warehouse.humidity}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4 pt-4 border-t border-neutral-200">
                    <Button variant="primary" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1">
                      Manage Stock
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}