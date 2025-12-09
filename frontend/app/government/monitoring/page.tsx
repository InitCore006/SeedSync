'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Building2, Search, Users, MapPin, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';

// Mock data - replace with API call
const mockFPOs = [
  {
    id: 1,
    name: 'Madhya Pradesh Farmers Collective',
    registrationNumber: 'FPO-MP-2023-001',
    location: 'Bhopal, Madhya Pradesh',
    members: 450,
    crops: ['Soybean', 'Wheat', 'Mustard'],
    totalProcurement: 12500000,
    status: 'active',
    healthScore: 92,
    registeredOn: '2023-01-15',
    lastActive: '2025-12-05',
    contactPerson: 'Ramesh Kumar',
    phone: '+91 98765 43210',
  },
  {
    id: 2,
    name: 'Gujarat Oilseed Producers Union',
    registrationNumber: 'FPO-GJ-2023-002',
    location: 'Rajkot, Gujarat',
    members: 680,
    crops: ['Groundnut', 'Castor', 'Sesame'],
    totalProcurement: 18200000,
    status: 'active',
    healthScore: 88,
    registeredOn: '2023-02-20',
    lastActive: '2025-12-05',
    contactPerson: 'Priya Patel',
    phone: '+91 98765 43211',
  },
  {
    id: 3,
    name: 'Maharashtra Seed Growers Association',
    registrationNumber: 'FPO-MH-2023-003',
    location: 'Pune, Maharashtra',
    members: 320,
    crops: ['Soybean', 'Sunflower'],
    totalProcurement: 8900000,
    status: 'active',
    healthScore: 85,
    registeredOn: '2023-03-10',
    lastActive: '2025-12-04',
    contactPerson: 'Amit Desai',
    phone: '+91 98765 43212',
  },
  {
    id: 4,
    name: 'Telangana Oilseed Federation',
    registrationNumber: 'FPO-TG-2023-004',
    location: 'Hyderabad, Telangana',
    members: 520,
    crops: ['Groundnut', 'Sunflower', 'Sesame'],
    totalProcurement: 14800000,
    status: 'under_review',
    healthScore: 78,
    registeredOn: '2023-05-18',
    lastActive: '2025-12-03',
    contactPerson: 'Sneha Reddy',
    phone: '+91 98765 43213',
  },
  {
    id: 5,
    name: 'Rajasthan Mustard Growers Collective',
    registrationNumber: 'FPO-RJ-2023-005',
    location: 'Jaipur, Rajasthan',
    members: 280,
    crops: ['Mustard', 'Sesame'],
    totalProcurement: 6500000,
    status: 'active',
    healthScore: 82,
    registeredOn: '2023-06-25',
    lastActive: '2025-12-05',
    contactPerson: 'Vikram Singh',
    phone: '+91 98765 43214',
  },
  {
    id: 6,
    name: 'Karnataka Soybean Producers Network',
    registrationNumber: 'FPO-KA-2023-006',
    location: 'Bangalore, Karnataka',
    members: 190,
    crops: ['Soybean'],
    totalProcurement: 4200000,
    status: 'inactive',
    healthScore: 65,
    registeredOn: '2023-08-12',
    lastActive: '2025-11-15',
    contactPerson: 'Lakshmi Naidu',
    phone: '+91 98765 43215',
  },
];

const getHealthScoreColor = (score: number) => {
  if (score >= 85) return 'text-green-600';
  if (score >= 70) return 'text-orange-600';
  return 'text-red-600';
};

const getHealthScoreBg = (score: number) => {
  if (score >= 85) return 'bg-green-50';
  if (score >= 70) return 'bg-orange-50';
  return 'bg-red-50';
};

function MonitoringContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredFPOs = mockFPOs.filter(fpo =>
    (statusFilter === 'all' || fpo.status === statusFilter) &&
    (fpo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     fpo.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
     fpo.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalFPOs = mockFPOs.length;
  const activeFPOs = mockFPOs.filter(f => f.status === 'active').length;
  const totalMembers = mockFPOs.reduce((sum, f) => sum + f.members, 0);
  const totalProcurement = mockFPOs.reduce((sum, f) => sum + f.totalProcurement, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">FPO Monitoring</h1>
        <p className="text-gray-600 mt-1">Monitor and track all registered Farmer Producer Organizations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total FPOs</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalFPOs}</p>
              </div>
              <Building2 className="w-12 h-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active FPOs</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{activeFPOs}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{formatNumber(totalMembers)}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Procurement</p>
                <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(totalProcurement)}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-primary opacity-20" />
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
                placeholder="Search by name, registration number, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'under_review' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('under_review')}
              >
                Under Review
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('inactive')}
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FPO List */}
      {filteredFPOs.length > 0 ? (
        <div className="space-y-4">
          {filteredFPOs.map((fpo) => (
            <Card key={fpo.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{fpo.name}</h3>
                      <p className="text-sm text-gray-600">{fpo.registrationNumber}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{fpo.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`text-center px-4 py-2 rounded-lg ${getHealthScoreBg(fpo.healthScore)}`}>
                      <p className="text-xs font-medium text-gray-600 mb-1">Health Score</p>
                      <p className={`text-2xl font-bold ${getHealthScoreColor(fpo.healthScore)}`}>
                        {fpo.healthScore}
                      </p>
                    </div>
                    <Badge variant="status" status={fpo.status}>
                      {fpo.status === 'active' ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Active
                        </>
                      ) : fpo.status === 'under_review' ? (
                        <>
                          <Clock className="w-4 h-4 mr-1" />
                          Under Review
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                {/* FPO Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Members</p>
                    <p className="text-lg font-bold text-gray-900">{formatNumber(fpo.members)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Procurement Value</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(fpo.totalProcurement)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Registered On</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(fpo.registeredOn, 'short')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Last Active</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(fpo.lastActive, 'short')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Contact</p>
                    <p className="text-sm font-medium text-gray-900">{fpo.contactPerson}</p>
                  </div>
                </div>

                {/* Crops */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">CROPS HANDLED</p>
                  <div className="flex flex-wrap gap-2">
                    {fpo.crops.map((crop, idx) => (
                      <Badge key={idx} variant="outline">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="primary" size="sm">View Full Report</Button>
                  <Button variant="outline" size="sm">Member Details</Button>
                  <Button variant="outline" size="sm">Transaction History</Button>
                  <Button variant="outline" size="sm">Contact</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No FPOs found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No FPOs registered yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function GovernmentMonitoringPage() {
  return (
    <ProtectedRoute allowedRoles={['government']}>
      <DashboardLayout>
        <MonitoringContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
