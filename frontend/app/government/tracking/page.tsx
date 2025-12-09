'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { formatNumber } from '@/lib/utils';
import { Truck, MapPin, Package, Clock, Filter, Navigation } from 'lucide-react';
import { CROPS } from '@/lib/constants';

interface Shipment {
  id: string;
  tracking_number: string;
  crop_type: string;
  quantity_quintals: number;
  status: string;
  logistics_partner: string;
  pickup_location: string;
  delivery_location: string;
  pickup_district: string;
  pickup_state: string;
  delivery_district: string;
  delivery_state: string;
  current_latitude: number | null;
  current_longitude: number | null;
  estimated_delivery: string | null;
  actual_delivery: string | null;
}

interface ShipmentStats {
  total_shipments: number;
  in_transit: number;
  delivered: number;
  pending: number;
}

function SupplyChainTrackingContent() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState<ShipmentStats>({
    total_shipments: 0,
    in_transit: 0,
    delivered: 0,
    pending: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');

  React.useEffect(() => {
    fetchShipments();
  }, [selectedStatus, selectedCrop]);

  const fetchShipments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedCrop) params.append('crop_type', selectedCrop);

      const response = await fetch(`/api/government/supply-chain-tracking/?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setShipments(data.data.shipments);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      in_transit: { color: 'bg-blue-100 text-blue-800', label: 'In Transit' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      delayed: { color: 'bg-red-100 text-red-800', label: 'Delayed' }
    };
    const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN');
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Supply Chain Tracking</h1>
        <p className="text-gray-600 mt-1">Real-time tracking of shipments across the supply chain</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats.total_shipments)}
                </p>
              </div>
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats.in_transit)}
                </p>
              </div>
              <Navigation className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats.delivered)}
                </p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats.pending)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Crop Type</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Crops</option>
                {CROPS.map((crop) => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end col-span-2">
              <button
                onClick={() => {
                  setSelectedStatus('');
                  setSelectedCrop('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Shipments ({shipments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crop & Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Logistics Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ETA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GPS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Truck className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {shipment.tracking_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{shipment.crop_type}</div>
                      <div className="text-xs text-gray-500">
                        {formatNumber(shipment.quantity_quintals)} Quintals
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-green-500" />
                          <span className="font-medium">From:</span> {shipment.pickup_district}, {shipment.pickup_state}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-red-500" />
                          <span className="font-medium">To:</span> {shipment.delivery_district}, {shipment.delivery_state}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shipment.logistics_partner}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(shipment.estimated_delivery)}
                      </div>
                      {shipment.actual_delivery && (
                        <div className="text-xs text-green-600">
                          Delivered: {formatDate(shipment.actual_delivery)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(shipment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {shipment.current_latitude && shipment.current_longitude ? (
                        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          N/A
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {shipments.length === 0 && (
            <div className="text-center py-12">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No shipments found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Shipment Map (Coming Soon)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Interactive Map Visualization</p>
            <p className="text-sm text-gray-500 mt-2">
              Real-time GPS tracking of {stats.in_transit} active shipments will be displayed here
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Map integration with Leaflet/Mapbox coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SupplyChainTrackingPage() {
  return (
    <ProtectedRoute allowedRoles={['government']}>
      <DashboardLayout>
        <SupplyChainTrackingContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
