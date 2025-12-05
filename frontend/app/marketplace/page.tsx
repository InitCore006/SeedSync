'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import { useLots } from '@/lib/hooks/useAPI';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { Search, ShoppingCart, Package, Filter, Eye } from 'lucide-react';
import { CROPS, QUALITY_GRADES } from '@/lib/constants';

function MarketplaceContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cropFilter, setCropFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const { lots, isLoading, isError } = useLots({ status: 'open' });

  if (isLoading) return <Loading fullScreen />;
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load marketplace data
        </div>
      </div>
    );
  }

  const filteredLots = lots?.filter((lot: any) =>
    (cropFilter === 'all' || lot.crop_name === cropFilter) &&
    (gradeFilter === 'all' || lot.quality_grade === gradeFilter) &&
    (lot.crop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     lot.lot_number?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
        <p className="text-gray-600 mt-1">Browse available procurement lots from FPOs</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Available Lots</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{lots?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Total Quantity</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatNumber(lots?.reduce((sum: number, l: any) => sum + (l.quantity_kg || 0), 0) || 0)} kg
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Avg Price</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(
                lots?.length > 0
                  ? lots.reduce((sum: number, l: any) => sum + (l.expected_price_per_quintal || 0), 0) / lots.length
                  : 0
              )}/qtl
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Crop Varieties</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {new Set(lots?.map((l: any) => l.crop_name)).size || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by crop name or lot number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Crops' },
                ...CROPS.map(crop => ({ value: crop.label, label: crop.label }))
              ]}
              className="w-full md:w-48"
            />
            <Select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Grades' },
                ...Object.values(QUALITY_GRADES).map(grade => ({ value: grade, label: `Grade ${grade}` }))
              ]}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lots Grid */}
      {filteredLots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLots.map((lot: any) => (
            <Card key={lot.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{lot.crop_name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{lot.lot_number}</p>
                  </div>
                  <Badge variant="status" status="active">
                    Available
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* FPO Info */}
                  <div className="pb-3 border-b border-gray-200">
                    <p className="text-xs text-gray-600">Seller</p>
                    <p className="font-medium text-gray-900">{lot.farmer?.full_name || 'FPO Member'}</p>
                    <p className="text-xs text-gray-600">{lot.farmer?.city}, {lot.farmer?.state}</p>
                  </div>

                  {/* Lot Details */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold">{formatNumber(lot.quantity_kg)} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Quality Grade:</span>
                    <span className="font-semibold">Grade {lot.quality_grade}</span>
                  </div>
                  {lot.moisture_content && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Moisture:</span>
                      <span className="font-semibold">{lot.moisture_content}%</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Listed:</span>
                    <span className="text-gray-900">{formatDate(lot.created_at, 'PP')}</span>
                  </div>

                  {/* Price */}
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Expected Price</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(lot.expected_price_per_quintal)}<span className="text-sm text-gray-600">/qtl</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Total: {formatCurrency((lot.quantity_kg / 100) * lot.expected_price_per_quintal)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button variant="primary" size="sm" className="flex-1">
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Place Bid
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || cropFilter !== 'all' || gradeFilter !== 'all'
                  ? 'No lots found'
                  : 'No lots available'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || cropFilter !== 'all' || gradeFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Check back later for new procurement lots'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <DashboardLayout>
      <MarketplaceContent />
    </DashboardLayout>
  );
}
