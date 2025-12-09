'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Package, MapPin, User, Building2, Factory, CheckCircle, 
  AlertCircle, Calendar, TrendingUp, Award, Truck, FileCheck,
  ShieldCheck, ExternalLink 
} from 'lucide-react';

interface Location {
  latitude: number | null;
  longitude: number | null;
}

interface JourneyStage {
  stage: string;
  action_code: string;
  actor: string;
  actor_role: string;
  timestamp: string;
  location: Location;
  transaction_id: string;
  data: any;
  verified: boolean;
}

interface LotData {
  lot_number: string;
  crop_type: string;
  crop_variety: string;
  quantity_quintals: number;
  quality_grade: string;
  harvest_date: string;
  listing_type: string;
  created_at: string;
}

interface FarmerData {
  name: string;
  location: {
    village: string;
    district: string;
    state: string;
  };
}

interface FPOData {
  name: string;
  registration_number: string;
  contact: string;
}

interface TraceData {
  status: string;
  lot: LotData;
  farmer: FarmerData | null;
  fpo: FPOData | null;
  journey: JourneyStage[];
  total_transactions: number;
  chain_verified: boolean;
  traced_at: string;
}

export default function TraceLotPage() {
  const params = useParams();
  const lot_number = params?.lot_number as string;
  
  const [traceData, setTraceData] = useState<TraceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<number>(0);

  useEffect(() => {
    if (lot_number) {
      fetchTraceData();
    }
  }, [lot_number]);

  const fetchTraceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blockchain/trace/${lot_number}/`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setTraceData(data);
      } else {
        setError(data.message || 'Failed to fetch trace data');
      }
    } catch (err: any) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getStageIcon = (actionCode: string) => {
    const icons: Record<string, any> = {
      'created': Package,
      'procured': Building2,
      'warehouse_in': Building2,
      'quality_checked': Award,
      'sale_agreed': FileCheck,
      'shipped': Truck,
      'received': CheckCircle,
      'processed': Factory,
      'stage_completed': Factory,
      'packaged': Package,
      'payment_completed': CheckCircle
    };
    
    return icons[actionCode] || CheckCircle;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading traceability data...</p>
        </div>
      </div>
    );
  }

  if (error || !traceData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trace Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Unable to find traceability data for this lot'}</p>
          <p className="text-sm text-gray-500">Lot Number: <span className="font-mono font-semibold">{lot_number}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-green-600 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Farm to Fork Traceability</h1>
            {traceData.chain_verified && (
              <div className="flex items-center gap-2 bg-green-700 px-4 py-2 rounded-full">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm font-semibold">Verified</span>
              </div>
            )}
          </div>
          <p className="text-green-100 text-sm sm:text-base">
            Complete journey tracking powered by blockchain technology
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lot Summary Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {traceData.lot.crop_type}
              </h2>
              <p className="text-gray-600">Lot #{traceData.lot.lot_number}</p>
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
              Grade {traceData.lot.quality_grade || 'N/A'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600">Quantity</p>
              <p className="text-lg font-semibold text-gray-900">
                {traceData.lot.quantity_quintals} Quintals
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-600">Variety</p>
              <p className="text-lg font-semibold text-gray-900">
                {traceData.lot.crop_variety || 'Standard'}
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm text-gray-600">Harvest Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(traceData.lot.harvest_date).toLocaleDateString('en-IN')}
              </p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-lg font-semibold text-gray-900">
                {traceData.total_transactions}
              </p>
            </div>
          </div>
        </div>

        {/* Farmer & FPO Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {traceData.farmer && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Farmer</h3>
                  <p className="text-sm text-gray-600">Original Producer</p>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900 mb-2">{traceData.farmer.name}</p>
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <p className="text-sm">
                  {[
                    traceData.farmer.location.village,
                    traceData.farmer.location.district,
                    traceData.farmer.location.state
                  ].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          )}

          {traceData.fpo && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">FPO</h3>
                  <p className="text-sm text-gray-600">Farmer Organization</p>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900 mb-2">{traceData.fpo.name}</p>
              <p className="text-sm text-gray-600 mb-1">
                Reg: {traceData.fpo.registration_number}
              </p>
              <p className="text-sm text-gray-600">{traceData.fpo.contact}</p>
            </div>
          )}
        </div>

        {/* Journey Timeline */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Supply Chain Journey</h3>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Journey Stages */}
            <div className="space-y-6">
              {traceData.journey.map((stage, index) => {
                const StageIcon = getStageIcon(stage.action_code);
                const isSelected = index === selectedStage;
                
                return (
                  <div 
                    key={stage.transaction_id}
                    className={`relative pl-16 cursor-pointer transition-all ${
                      isSelected ? 'scale-105' : 'hover:scale-102'
                    }`}
                    onClick={() => setSelectedStage(index)}
                  >
                    {/* Icon */}
                    <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      stage.verified 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <StageIcon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className={`bg-gray-50 rounded-lg p-4 border-2 transition-colors ${
                      isSelected ? 'border-green-500 bg-green-50' : 'border-transparent'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{stage.stage}</h4>
                          <p className="text-sm text-gray-600">{stage.actor}</p>
                        </div>
                        {stage.verified && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(stage.timestamp)}</span>
                        </div>
                        {stage.location.latitude && stage.location.longitude && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {stage.location.latitude.toFixed(4)}, {stage.location.longitude.toFixed(4)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Expanded Details */}
                      {isSelected && stage.data && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <pre className="text-xs bg-white p-3 rounded overflow-auto max-h-64">
                            {JSON.stringify(stage.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Verification Footer */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Blockchain Verified</h3>
              <p className="text-green-100 text-sm">
                This record is secured on an immutable blockchain ledger
              </p>
            </div>
            <ShieldCheck className="w-16 h-16 opacity-20" />
          </div>
          <div className="mt-4 pt-4 border-t border-green-500">
            <p className="text-sm text-green-100">
              Traced on: {formatDate(traceData.traced_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
