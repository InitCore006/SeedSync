'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { Package, Search, Eye, Wheat, Sprout, Flower2, Leaf, Users, User, ShoppingCart, Warehouse, Lightbulb, TrendingUp, Navigation, Car, AlertTriangle } from 'lucide-react';
import { CROPS, QUALITY_GRADES } from '@/lib/constants';
import useSWR from 'swr';
import API from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { toast } from 'react-hot-toast';
import { BidSuggestion } from '@/lib/types';

// Helper function to get crop icon
const getCropIcon = (cropType: string) => {
  const iconProps = { className: 'w-5 h-5', strokeWidth: 2 };
  
  switch (cropType?.toLowerCase()) {
    case 'soybean':
    case 'groundnut':
      return <Sprout {...iconProps} />;
    case 'mustard':
    case 'safflower':
      return <Flower2 {...iconProps} />;
    case 'sunflower':
      return <Flower2 {...iconProps} className="w-5 h-5 text-yellow-600" />;
    case 'sesame':
    case 'linseed':
    case 'niger':
      return <Leaf {...iconProps} />;
    default:
      return <Wheat {...iconProps} />;
  }
};

function MarketplaceContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [listingTypeFilter, setListingTypeFilter] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidQuantity, setBidQuantity] = useState('');
  const [bidSuggestion, setBidSuggestion] = useState<BidSuggestion | null>(null);
  const [originalSuggestion, setOriginalSuggestion] = useState<BidSuggestion | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');

  // Vehicle types with rates
  const vehicleTypes = [
    { type: 'mini_truck', label: 'Mini Truck (1 ton)', capacity_tons: 1, rate_per_km: 12 },
    { type: 'small_truck', label: 'Small Truck (3 tons)', capacity_tons: 3, rate_per_km: 18 },
    { type: 'medium_truck', label: 'Medium Truck (7 tons)', capacity_tons: 7, rate_per_km: 25 },
    { type: 'large_truck', label: 'Large Truck (15 tons)', capacity_tons: 15, rate_per_km: 35 },
    { type: 'trailer', label: 'Trailer (20+ tons)', capacity_tons: 20, rate_per_km: 50 },
  ];

  const { data, error, isLoading, mutate } = useSWR(
    ['/marketplace/lots', cropFilter, gradeFilter, listingTypeFilter],
    () => API.marketplace.getLots({
      crop_type: cropFilter || undefined,
      quality_grade: gradeFilter || undefined,
      listing_type: listingTypeFilter || undefined,
    })
  );

  const handleViewLot = (lot: any) => {
    setSelectedLot(lot);
    setIsViewModalOpen(true);
  };

  const handleGetSuggestion = async (lot: any) => {
    // Check if user is processor
    if (user?.role !== 'processor') {
      toast.error('AI bid suggestion is only available for processors');
      return;
    }

    setSelectedLot(lot);
    setLoadingSuggestion(true);
    setIsSuggestionModalOpen(true);
    setBidSuggestion(null);

    try {
      console.log('Requesting bid suggestion for lot:', lot.id);
      const response = await API.processor.getBidSuggestion(lot.id);
      console.log('Full API Response:', response);
      console.log('Response data:', response.data);
      
      // Handle both possible response structures: response.data.data or response.data
      const suggestionData = response.data?.data || response.data;
      console.log('Suggestion data:', suggestionData);
      
      if (!suggestionData || !suggestionData.recommended_vehicle_type) {
        throw new Error('Invalid response structure from server');
      }
      
      setBidSuggestion(suggestionData);
      setOriginalSuggestion(suggestionData);
      setSelectedVehicle(suggestionData.recommended_vehicle_type);
    } catch (error: any) {
      console.error('Bid suggestion error - Full error:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          error?.message ||
                          'Failed to get bid suggestion';
      
      toast.error(errorMessage);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  // Recalculate costs based on selected vehicle
  const recalculateCosts = (vehicleType: string) => {
    if (!originalSuggestion) return;

    const vehicle = vehicleTypes.find(v => v.type === vehicleType);
    if (!vehicle) return;

    const quantity = parseFloat(originalSuggestion.lot_quantity_quintals.toString());
    const distance = originalSuggestion.distance_km;
    
    // Recalculate logistics costs
    const transport_cost = distance * vehicle.rate_per_km;
    const loading_cost = quantity * 20;
    const unloading_cost = quantity * 20;
    const toll_cost = distance * 0.5;
    const total_logistics_cost = transport_cost + loading_cost + unloading_cost + toll_cost;
    
    // Recalculate total costs
    const lot_total_price = parseFloat(originalSuggestion.lot_total_price.toString());
    const processing_cost = quantity * 500;
    const total_cost_with_logistics = lot_total_price + total_logistics_cost + processing_cost;
    
    // Recalculate financials
    const expected_revenue = parseFloat(originalSuggestion.expected_processing_revenue.toString());
    const expected_net_profit = expected_revenue - total_cost_with_logistics;
    const roi_percentage = (expected_net_profit / total_cost_with_logistics) * 100;
    
    // Recalculate confidence and recommendation
    let confidence_score = Math.min(100, Math.floor(roi_percentage * 2));
    if (distance > 500) confidence_score -= 20;
    if (quantity < 10) confidence_score -= 10;
    confidence_score = Math.max(0, confidence_score);
    
    const should_bid = roi_percentage >= 15;
    
    // Update suggestion
    setBidSuggestion({
      ...originalSuggestion,
      recommended_vehicle_type: vehicleType,
      vehicle_capacity_tons: vehicle.capacity_tons,
      logistics_cost_breakdown: {
        transport_cost,
        loading_cost,
        unloading_cost,
        toll_cost,
        total_logistics_cost,
      },
      total_logistics_cost,
      total_cost_with_logistics,
      expected_net_profit,
      roi_percentage,
      confidence_score,
      should_bid,
      recommendation_reason: should_bid 
        ? `${roi_percentage >= 30 ? 'Excellent' : 'Good'} opportunity! ${roi_percentage >= 30 ? 'High' : 'Positive'} ROI of ${roi_percentage.toFixed(1)}% with ${distance.toFixed(2)} km distance.`
        : `ROI of ${roi_percentage.toFixed(1)}% is below the 15% threshold. Consider alternative lots or negotiate pricing.`,
      suggested_bid_min: lot_total_price * 0.9,
      suggested_bid_max: lot_total_price * 1.05,
    });
  };

  const handleVehicleChange = (vehicleType: string) => {
    setSelectedVehicle(vehicleType);
    recalculateCosts(vehicleType);
  };

  const handleProceedToBid = () => {
    setIsSuggestionModalOpen(false);
    // Pre-fill with suggested bid amount
    if (bidSuggestion && selectedLot) {
      const suggestedMin = parseFloat(bidSuggestion.suggested_bid_min.toString());
      const suggestedMax = parseFloat(bidSuggestion.suggested_bid_max.toString());
      const suggestedAmount = (suggestedMin + suggestedMax) / 2;
      const suggestedPerUnit = suggestedAmount / selectedLot.quantity_quintals;
      setBidAmount(suggestedPerUnit.toFixed(2));
      setBidQuantity(selectedLot.quantity_quintals?.toString() || '');
    }
    setIsBidModalOpen(true);
  };

  const handlePlaceBid = (lot: any) => {
    // Check if user is processor or retailer (who can place bids)
    if (user?.role !== 'processor' && user?.role !== 'retailer') {
      toast.error('Only processors and retailers can place bids');
      return;
    }
    
    setSelectedLot(lot);
    setBidAmount(lot.expected_price_per_quintal?.toString() || '');
    setBidQuantity(lot.quantity_quintals?.toString() || '');
    setIsBidModalOpen(true);
  };

  const handleSubmitBid = async () => {
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    if (!bidQuantity || parseFloat(bidQuantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (parseFloat(bidQuantity) > selectedLot.quantity_quintals) {
      toast.error('Quantity exceeds available quantity');
      return;
    }

    try {
      if (user?.role === 'processor') {
        await API.processor.placeBid({
          lot_id: selectedLot.id,
          bid_amount_per_quintal: parseFloat(bidAmount),
          quantity_quintals: parseFloat(bidQuantity),
        });
      } else if (user?.role === 'retailer') {
        // Assuming similar API for retailer
        await API.processor.placeBid({
          lot_id: selectedLot.id,
          bid_amount_per_quintal: parseFloat(bidAmount),
          quantity_quintals: parseFloat(bidQuantity),
        });
      }
      
      toast.success('Bid placed successfully!');
      setIsBidModalOpen(false);
      setSelectedLot(null);
      setBidAmount('');
      setBidQuantity('');
      mutate(); // Refresh lots
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to place bid');
    }
  };

  if (isLoading) return <Loading fullScreen />;
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load marketplace listings
        </div>
      </div>
    );
  }

  const lots = data?.data?.results || [];
  
  const filteredLots = lots.filter((lot: any) =>
    lot.crop_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lot.lot_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const individualLots = filteredLots.filter((lot: any) => lot.listing_type === 'individual');
  const aggregatedLots = filteredLots.filter((lot: any) => lot.listing_type === 'fpo_aggregated');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
        <p className="text-gray-600 mt-1">Browse and purchase oilseed lots - Individual farmers and FPO bulk offerings</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Total Listings</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{filteredLots.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-medium text-gray-600">Individual Lots</p>
            </div>
            <p className="text-3xl font-bold text-blue-600 mt-1">{individualLots.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-gray-600">FPO Bulk Lots</p>
            </div>
            <p className="text-3xl font-bold text-green-600 mt-1">{aggregatedLots.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Total Quantity</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatNumber(filteredLots.reduce((sum: number, l: any) => sum + (l.quantity_quintals || 0), 0))} Q
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
                { value: '', label: 'All Crops' },
                ...CROPS.map(crop => ({ value: crop.value, label: crop.label }))
              ]}
              className="w-full md:w-48"
            />
            <Select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              options={[
                { value: '', label: 'All Grades' },
                { value: 'A+', label: 'Grade A+' },
                { value: 'A', label: 'Grade A' },
                { value: 'B', label: 'Grade B' },
                { value: 'C', label: 'Grade C' },
              ]}
              className="w-full md:w-48"
            />
            <Select
              value={listingTypeFilter}
              onChange={(e) => setListingTypeFilter(e.target.value)}
              options={[
                { value: '', label: 'All Types' },
                { value: 'individual', label: 'Individual Farmers' },
                { value: 'fpo_aggregated', label: 'FPO Bulk Lots' }
              ]}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* FPO Aggregated Bulk Lots Section */}
      {aggregatedLots.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">FPO Aggregated Bulk Lots</h2>
            <Badge className="ml-2 bg-green-100 text-green-800">{aggregatedLots.length} Listings</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aggregatedLots.map((lot: any) => (
              <Card key={lot.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        {getCropIcon(lot.crop_type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{lot.lot_number}</CardTitle>
                        <p className="text-sm text-gray-600">{lot.crop_type_display}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">FPO Bulk</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">FPO:</span>
                      <span className="font-semibold text-gray-900">{lot.fpo_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <span className="font-semibold text-gray-900">{formatNumber(lot.quantity_quintals)} Q</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quality:</span>
                      <Badge className="bg-blue-100 text-blue-800">{lot.quality_grade}</Badge>
                    </div>
                    {lot.warehouse_name && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Warehouse className="w-3 h-3" />
                          Warehouse:
                        </span>
                        <span className="text-xs font-medium text-purple-600">{lot.warehouse_name}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="font-bold text-green-600">{formatCurrency(lot.expected_price_per_quintal)}/Q</span>
                    </div>
                    <div className="pt-3 border-t flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewLot(lot)} className="flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      {user?.role === 'processor' && (
                        <Button variant="outline" size="sm" onClick={() => handleGetSuggestion(lot)} className="flex items-center justify-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50">
                          <Lightbulb className="w-4 h-4" />
                          AI
                        </Button>
                      )}
                      <Button variant="primary" size="sm" onClick={() => handlePlaceBid(lot)} className="flex-1">
                        Place Bid
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Individual Farmer Lots Section */}
      {individualLots.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Individual Farmer Lots</h2>
            <Badge className="ml-2 bg-blue-100 text-blue-800">{individualLots.length} Listings</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {individualLots.map((lot: any) => (
              <Card key={lot.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        {getCropIcon(lot.crop_type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{lot.lot_number}</CardTitle>
                        <p className="text-sm text-gray-600">{lot.crop_type_display}</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Individual</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Farmer:</span>
                      <span className="font-semibold text-gray-900">{lot.farmer_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <span className="font-semibold text-gray-900">{formatNumber(lot.quantity_quintals)} Q</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quality:</span>
                      <Badge className="bg-blue-100 text-blue-800">{lot.quality_grade}</Badge>
                    </div>
                    {lot.warehouse_name && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Warehouse className="w-3 h-3" />
                          Warehouse:
                        </span>
                        <span className="text-xs font-medium text-purple-600">{lot.warehouse_name}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="font-bold text-green-600">{formatCurrency(lot.expected_price_per_quintal)}/Q</span>
                    </div>
                    <div className="pt-3 border-t flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewLot(lot)} className="flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      {user?.role === 'processor' && (
                        <Button variant="outline" size="sm" onClick={() => handleGetSuggestion(lot)} className="flex items-center justify-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50">
                          <Lightbulb className="w-4 h-4" />
                          AI
                        </Button>
                      )}
                      <Button variant="primary" size="sm" onClick={() => handlePlaceBid(lot)} className="flex-1">
                        Place Bid
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {filteredLots.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No lots available at the moment</p>
          </CardContent>
        </Card>
      )}

      {/* AI Bid Suggestion Modal */}
      {selectedLot && (
        <Modal isOpen={isSuggestionModalOpen} onClose={() => setIsSuggestionModalOpen(false)} title="AI Bid Suggestion" size="xl">
          {loadingSuggestion ? (
            <div className="text-center py-12">
              <Loading />
              <p className="mt-4 text-gray-600">Analyzing lot and calculating costs...</p>
            </div>
          ) : bidSuggestion ? (
            <div className="space-y-6">
              {/* Recommendation Banner */}
              <div className={`p-4 rounded-lg ${bidSuggestion.should_bid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-3">
                  {bidSuggestion.should_bid ? (
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">✓</div>
                  ) : (
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white">✕</div>
                  )}
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${bidSuggestion.should_bid ? 'text-green-900' : 'text-red-900'}`}>
                      {bidSuggestion.should_bid ? 'Recommended to Bid' : 'Not Recommended'}
                    </h3>
                    <p className={`text-sm ${bidSuggestion.should_bid ? 'text-green-700' : 'text-red-700'}`}>
                      Confidence: {bidSuggestion.confidence_score}%
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-gray-700">{bidSuggestion.recommendation_reason}</p>
              </div>

              {/* Vehicle Selector */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Select Vehicle Type (Recalculates Costs)
                </h4>
                <Select
                  value={selectedVehicle}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  options={vehicleTypes.map(v => ({ 
                    value: v.type, 
                    label: `${v.label} - ₹${v.rate_per_km}/km` 
                  }))}
                  className="w-full"
                />
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Expected ROI</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{parseFloat(bidSuggestion.roi_percentage.toString()).toFixed(1)}%</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Distance</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{bidSuggestion.distance_km.toFixed(0)} km</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-5 h-5 text-orange-600" />
                    <span className="text-sm text-gray-600">Logistics Cost</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(parseFloat(bidSuggestion.total_logistics_cost.toString()))}</p>
                </div>
              </div>

              {/* Logistics Cost Breakdown */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Logistics Cost Breakdown
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transport Cost ({bidSuggestion.distance_km.toFixed(2)} km × ₹{vehicleTypes.find(v => v.type === selectedVehicle)?.rate_per_km}/km)</span>
                    <span className="font-semibold">{formatCurrency(bidSuggestion.logistics_cost_breakdown.transport_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loading Cost ({parseFloat(bidSuggestion.lot_quantity_quintals.toString()).toFixed(2)} Q × ₹20/Q)</span>
                    <span className="font-semibold">{formatCurrency(bidSuggestion.logistics_cost_breakdown.loading_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unloading Cost ({parseFloat(bidSuggestion.lot_quantity_quintals.toString()).toFixed(2)} Q × ₹20/Q)</span>
                    <span className="font-semibold">{formatCurrency(bidSuggestion.logistics_cost_breakdown.unloading_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toll Cost ({bidSuggestion.distance_km.toFixed(2)} km × ₹0.5/km)</span>
                    <span className="font-semibold">{formatCurrency(bidSuggestion.logistics_cost_breakdown.toll_cost)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-orange-300">
                    <span className="font-bold text-orange-900">Total Logistics Cost</span>
                    <span className="font-bold text-orange-600">{formatCurrency(bidSuggestion.logistics_cost_breakdown.total_logistics_cost)}</span>
                  </div>
                </div>
              </div>

              {/* Financial Analysis */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-3">Financial Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lot Price ({parseFloat(bidSuggestion.lot_quantity_quintals.toString()).toFixed(2)} Q × ₹{parseFloat(bidSuggestion.lot_expected_price_per_quintal.toString()).toFixed(2)}/Q)</span>
                    <span className="font-semibold">{formatCurrency(parseFloat(bidSuggestion.lot_total_price.toString()))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Logistics Cost</span>
                    <span className="font-semibold">{formatCurrency(parseFloat(bidSuggestion.total_logistics_cost.toString()))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Cost ({parseFloat(bidSuggestion.lot_quantity_quintals.toString()).toFixed(2)} Q × ₹500/Q)</span>
                    <span className="font-semibold">{formatCurrency(parseFloat(bidSuggestion.lot_quantity_quintals.toString()) * 500)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold text-gray-900">Total Cost</span>
                    <span className="font-bold">{formatCurrency(parseFloat(bidSuggestion.total_cost_with_logistics.toString()))}</span>
                  </div>
                  <div className="flex justify-between mt-3 pt-2 border-t-2 border-gray-300">
                    <span className="text-gray-600">Expected Revenue ({parseFloat(bidSuggestion.lot_quantity_quintals.toString()).toFixed(2)} Q processed)</span>
                    <span className="font-semibold text-green-600">{formatCurrency(parseFloat(bidSuggestion.expected_processing_revenue.toString()))}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300 bg-green-50 -mx-4 px-4 py-2 rounded">
                    <span className="font-bold text-green-900">Net Profit</span>
                    <span className="font-bold text-green-600">{formatCurrency(parseFloat(bidSuggestion.expected_net_profit.toString()))}</span>
                  </div>
                </div>
              </div>

              {/* Logistics Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-3">Logistics Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Selected Vehicle</p>
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-blue-600" />
                      <p className="font-semibold capitalize">{selectedVehicle.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Travel Time</p>
                    <p className="font-semibold">~{Math.round(bidSuggestion.travel_duration_minutes)} mins</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Distance</p>
                    <p className="font-semibold">{bidSuggestion.distance_km.toFixed(2)} km ({bidSuggestion.distance_calculation_method === 'osrm' ? 'Road' : 'Est.'})</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Capacity</p>
                    <p className="font-semibold">{vehicleTypes.find(v => v.type === selectedVehicle)?.capacity_tons} tons</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lot Crop Type</p>
                    <p className="font-semibold">{bidSuggestion.lot_crop_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lot Quantity</p>
                    <p className="font-semibold">{parseFloat(bidSuggestion.lot_quantity_quintals.toString()).toFixed(2)} Q</p>
                  </div>
                </div>
              </div>

              {/* Suggested Bid Range */}
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                <h4 className="font-bold text-blue-900 mb-3">Suggested Bid Range</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-blue-700 mb-1">Minimum Bid</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(parseFloat(bidSuggestion.suggested_bid_min.toString()))}</p>
                    <p className="text-sm text-blue-600">{formatCurrency(parseFloat(bidSuggestion.suggested_bid_min.toString()) / parseFloat(selectedLot.quantity_quintals.toString()))}/Q</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-blue-700 mb-1">Maximum Bid</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(parseFloat(bidSuggestion.suggested_bid_max.toString()))}</p>
                    <p className="text-sm text-blue-600">{formatCurrency(parseFloat(bidSuggestion.suggested_bid_max.toString()) / parseFloat(selectedLot.quantity_quintals.toString()))}/Q</p>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {bidSuggestion.warnings.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-bold text-yellow-900">Important Considerations</h4>
                  </div>
                  <ul className="space-y-1 text-sm text-yellow-800">
                    {bidSuggestion.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsSuggestionModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleProceedToBid} className="flex-1">
                  Proceed to Place Bid
                </Button>
              </div>
            </div>
          ) : null}
        </Modal>
      )}

      {/* View Lot Modal */}
      {selectedLot && (
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Lot Details" size="lg">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                {getCropIcon(selectedLot.crop_type)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{selectedLot.crop_type_display}</h3>
                <p className="text-gray-600">Lot #{selectedLot.lot_number}</p>
              </div>
              <Badge className={selectedLot.listing_type === 'fpo_aggregated' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                {selectedLot.listing_type === 'fpo_aggregated' ? 'FPO Bulk' : 'Individual'}
              </Badge>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Seller Information</h4>
              <div className="grid grid-cols-2 gap-3">
                {selectedLot.listing_type === 'fpo_aggregated' ? (
                  <>
                    <div><p className="text-sm text-gray-600">FPO Name</p><p className="font-semibold">{selectedLot.fpo_name || 'N/A'}</p></div>
                    <div><p className="text-sm text-gray-600">Type</p><p className="font-semibold">Farmer Producer Organization</p></div>
                  </>
                ) : (
                  <>
                    <div><p className="text-sm text-gray-600">Farmer Name</p><p className="font-semibold">{selectedLot.farmer_name}</p></div>
                    <div><p className="text-sm text-gray-600">Type</p><p className="font-semibold">Individual Farmer</p></div>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-600">Quantity</p><p className="font-semibold text-lg">{formatNumber(selectedLot.quantity_quintals)} Q</p></div>
              <div><p className="text-sm text-gray-600">Quality Grade</p><p className="font-semibold text-lg">{selectedLot.quality_grade}</p></div>
              <div><p className="text-sm text-gray-600">Expected Price</p><p className="font-semibold text-lg text-green-600">{formatCurrency(selectedLot.expected_price_per_quintal)}/Q</p></div>
              <div><p className="text-sm text-gray-600">Total Value</p><p className="font-semibold text-lg">{formatCurrency(selectedLot.quantity_quintals * selectedLot.expected_price_per_quintal)}</p></div>
            </div>
            {selectedLot.description && (<div><h4 className="font-semibold mb-2">Description</h4><p className="text-gray-700">{selectedLot.description}</p></div>)}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)} className="flex-1">Close</Button>
              <Button variant="primary" onClick={() => { setIsViewModalOpen(false); handlePlaceBid(selectedLot); }} className="flex-1">Place Bid</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bid Modal */}
      {selectedLot && (
        <Modal isOpen={isBidModalOpen} onClose={() => setIsBidModalOpen(false)} title="Place Bid">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg">{selectedLot.crop_type}</h3>
              <p className="text-sm text-gray-600">{selectedLot.lot_number}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Available Quantity:</span>
                <span className="font-medium">{formatNumber(selectedLot.quantity_quintals)} qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Expected Price:</span>
                <span className="font-medium">{formatCurrency(selectedLot.expected_price_per_quintal)}/qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Quality Grade:</span>
                <span className="font-medium">Grade {selectedLot.quality_grade}</span>
              </div>
            </div>

            <Input
              label="Quantity (quintals)"
              type="number"
              placeholder="Enter quantity"
              value={bidQuantity}
              onChange={(e) => setBidQuantity(e.target.value)}
              required
            />

            <Input
              label="Your Bid Amount (₹/quintal)"
              type="number"
              placeholder="Enter your bid"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              required
            />

            {bidAmount && bidQuantity && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Total Bid Value: {formatCurrency(parseFloat(bidQuantity) * parseFloat(bidAmount || '0'))}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSubmitBid}
              >
                Submit Bid
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsBidModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
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
