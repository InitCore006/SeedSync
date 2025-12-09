'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import { useGovtDashboard, useGovtHeatmap } from '@/lib/hooks/useAPI';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown, Users, Package, IndianRupee, MapPin, Map } from 'lucide-react';
import { getEntityLocations, type EntityLocation } from '@/lib/api/government';
import { useAuthStore } from '@/lib/stores/authStore';
// Dynamically import map to avoid SSR issues
import dynamic from 'next/dynamic';

const IndiaMap = dynamic(() => import('@/components/ui/IndiaMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gray-50 rounded-lg flex items-center justify-center">
      <Loading />
    </div>
  )
});

function GovernmentDashboardContent() {
  const { dashboard, isError: dashError, isLoading: dashLoading } = useGovtDashboard();
  const { heatmap: heatmapData, isLoading: heatLoading, isError: heatError } = useGovtHeatmap();
  const { token } = useAuthStore();
  
  const [locations, setLocations] = useState<EntityLocation[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  
  // Fetch entity locations for map
  useEffect(() => {
    const fetchLocations = async () => {
      if (!token) return;
      
      try {
        setLocationsLoading(true);
        const response = await getEntityLocations(token);
        if (response.success && response.data) {
          setLocations(response.data.locations);
        }
      } catch (error) {
        console.error('Failed to fetch entity locations:', error);
        setLocationsError('Failed to load map data');
      } finally {
        setLocationsLoading(false);
      }
    };
    
    fetchLocations();
  }, [token]);
  
  if (dashLoading) return <Loading fullScreen />;
  if (dashError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load dashboard data
        </div>
      </div>
    );
  }
  
  const stats = dashboard;
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">National Dashboard</h1>
        <p className="text-gray-600 mt-1">Comprehensive overview of India's oilseed value chain</p>
      </div>
      
      {/* India Map with Entity Locations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Entity Distribution Map</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Geographic distribution of FPOs, Processors, and Farmers
              </p>
            </div>
            <Map className="w-6 h-6 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {locationsLoading ? (
            <div className="h-[600px] bg-gray-50 rounded-lg flex items-center justify-center">
              <Loading />
            </div>
          ) : locationsError ? (
            <div className="h-[600px] bg-red-50 rounded-lg flex items-center justify-center">
              <p className="text-red-600">{locationsError}</p>
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="flex items-center gap-6 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  <span className="text-sm font-medium">
                    FPOs ({locations.filter(l => l.entity_type === 'fpo').length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                  <span className="text-sm font-medium">
                    Processors ({locations.filter(l => l.entity_type === 'processor').length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                  <span className="text-sm font-medium">
                    Farmers ({locations.filter(l => l.entity_type === 'farmer').length})
                  </span>
                </div>
                <div className="ml-auto text-sm text-gray-600">
                  Total Locations: {locations.length}
                </div>
              </div>
              
              {/* Map Component */}
              <IndiaMap locations={locations} loading={locationsLoading} />
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active FPOs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats?.total_fpos || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            {stats?.fpo_growth_percent !== undefined && (
              <div className="flex items-center mt-4 text-sm">
                {stats.fpo_growth_percent >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600 font-medium">
                      +{stats.fpo_growth_percent.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    <span className="text-red-600 font-medium">
                      {stats.fpo_growth_percent.toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-gray-600 ml-1">vs last month</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Production</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(stats?.total_production_mt || 0)} MT
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
            {stats?.production_growth_percent !== undefined && (
              <div className="flex items-center mt-4 text-sm">
                {stats.production_growth_percent >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600 font-medium">
                      +{stats.production_growth_percent.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    <span className="text-red-600 font-medium">
                      {stats.production_growth_percent.toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-gray-600 ml-1">YoY growth</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Market Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats?.total_market_value || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            {stats?.avg_price_per_quintal && (
              <div className="mt-4 text-sm text-gray-600">
                Avg: {formatCurrency(stats.avg_price_per_quintal)}/quintal
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active States</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.active_states || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Across India
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Top Performing States - Visual Heatmap Grid */}
      {heatmapData && Array.isArray(heatmapData) && heatmapData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>State-wise Production Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            {heatLoading ? (
              <div className="h-96 flex items-center justify-center">
                <Loading />
              </div>
            ) : heatError ? (
              <div className="h-96 flex items-center justify-center text-red-600">
                Failed to load heatmap data
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {heatmapData.slice(0, 24).map((state: any) => {
                  const maxProduction = heatmapData[0]?.total_production_mt || 1;
                  const intensity = (state.total_production_mt / maxProduction) * 100;
                  const bgColor = intensity > 80 ? 'bg-primary' : 
                                 intensity > 60 ? 'bg-primary/80' :
                                 intensity > 40 ? 'bg-primary/60' :
                                 intensity > 20 ? 'bg-primary/40' : 'bg-primary/20';
                  
                  return (
                    <div
                      key={state.state_code}
                      className={`${bgColor} p-4 rounded-lg text-white hover:scale-105 transition-transform`}
                    >
                      <p className="text-xs font-semibold mb-1 line-clamp-2">{state.state_name}</p>
                      <p className="text-sm font-bold">{formatNumber(state.total_production_mt)} MT</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Top 10 Producing States */}
      {heatmapData && Array.isArray(heatmapData) && heatmapData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Producing States</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {heatmapData.slice(0, 10).map((state: any, index: number) => (
                <div key={state.state_code} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{state.state_name}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatNumber(state.total_production_mt)} MT
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(state.total_production_mt / heatmapData[0].total_production_mt) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Crop Distribution */}
      {stats?.crop_distribution && stats.crop_distribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Crop-wise Production Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.crop_distribution.map((crop: any) => (
                <div key={crop.crop_name} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">{crop.crop_name}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {formatNumber(crop.production_mt)} MT
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {crop.percentage?.toFixed(1)}% of total
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function GovernmentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['government']}>
      <DashboardLayout>
        <GovernmentDashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
