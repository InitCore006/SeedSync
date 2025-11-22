import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@components/common/Card'
import { Input } from '@components/common/Input'
import { Button } from '@components/common/Button'
import { Badge } from '@components/common/Badge'
import { Search, Plus, Truck, Calendar } from 'lucide-react'

export const Vehicles: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const vehicles = [
    {
      id: 1,
      name: 'Tata Ace',
      registrationNumber: 'KA-01-AB-1234',
      type: 'Mini Truck',
      capacity: '750 kg',
      driver: 'Ravi Kumar',
      driverPhone: '9876543210',
      status: 'Available',
      lastService: '2024-10-15',
      nextService: '2024-12-15',
      currentLocation: 'Warehouse - Main',
    },
    {
      id: 2,
      name: 'Mahindra Bolero',
      registrationNumber: 'KA-02-CD-5678',
      type: 'Pickup',
      capacity: '1000 kg',
      driver: 'Suresh Patil',
      driverPhone: '9876543211',
      status: 'In Transit',
      lastService: '2024-11-01',
      nextService: '2025-01-01',
      currentLocation: 'En route to Mandya',
    },
    {
      id: 3,
      name: 'Ashok Leyland',
      registrationNumber: 'KA-03-EF-9012',
      type: 'Heavy Truck',
      capacity: '5000 kg',
      driver: 'Mahesh Gowda',
      driverPhone: '9876543212',
      status: 'Under Maintenance',
      lastService: '2024-11-10',
      nextService: '2025-01-10',
      currentLocation: 'Service Center',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'success'
      case 'In Transit':
        return 'warning'
      case 'Under Maintenance':
        return 'error'
      default:
        return 'neutral'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Vehicles</h1>
          <p className="text-neutral-600 mt-2">Manage your transport fleet</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="h-5 w-5" />}>
          Add Vehicle
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Vehicles</p>
                <p className="text-2xl font-bold text-navy-900">3</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Available</p>
                <p className="text-2xl font-bold text-green-600">1</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">In Transit</p>
                <p className="text-2xl font-bold text-orange-600">1</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Maintenance</p>
                <p className="text-2xl font-bold text-red-600">1</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>Fleet Management</CardTitle>
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} hover>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-navy-900 mb-1">
                        {vehicle.name}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {vehicle.registrationNumber}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(vehicle.status)}>
                      {vehicle.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-neutral-600">Type</p>
                        <p className="text-sm font-medium text-navy-900">{vehicle.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-600">Capacity</p>
                        <p className="text-sm font-medium text-navy-900">
                          {vehicle.capacity}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-200">
                      <p className="text-xs text-neutral-600 mb-1">Driver</p>
                      <p className="text-sm font-medium text-navy-900">{vehicle.driver}</p>
                      <p className="text-xs text-neutral-600">{vehicle.driverPhone}</p>
                    </div>

                    <div className="pt-3 border-t border-neutral-200">
                      <p className="text-xs text-neutral-600 mb-1">Current Location</p>
                      <p className="text-sm font-medium text-navy-900">
                        {vehicle.currentLocation}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-200">
                      <div>
                        <div className="flex items-center text-xs text-neutral-600 mb-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Last Service
                        </div>
                        <p className="text-sm font-medium text-navy-900">
                          {vehicle.lastService}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center text-xs text-neutral-600 mb-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Next Service
                        </div>
                        <p className="text-sm font-medium text-navy-900">
                          {vehicle.nextService}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4 pt-4 border-t border-neutral-200">
                    <Button variant="primary" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1">
                      Track
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