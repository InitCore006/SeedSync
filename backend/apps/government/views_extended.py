"""
Extended Government Dashboard Views
Additional analytics and monitoring endpoints
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg, Q, F, Min, Max
from django.utils import timezone
from datetime import timedelta
from apps.core.utils import response_success, response_error
from apps.farmers.models import FarmerProfile
from apps.fpos.models import FPOProfile
from apps.lots.models import ProcurementLot
from apps.bids.models import Bid
from apps.payments.models import Payment
from apps.processors.models import ProcessorProfile, ProcessingBatch
from apps.retailers.models import RetailerProfile
from apps.logistics.models import Shipment
from apps.crops.models import MandiPrice, MSPRecord


class FarmerRegistryAPIView(APIView):
    """
    Comprehensive farmer registry with filtering and map data
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Filters
        state = request.query_params.get('state')
        district = request.query_params.get('district')
        kyc_status = request.query_params.get('kyc_status')
        crop_type = request.query_params.get('crop_type')
        
        filters = {'is_active': True}
        if state:
            filters['state'] = state
        if district:
            filters['district__icontains'] = district
        if kyc_status:
            filters['kyc_status'] = kyc_status
        
        farmers = FarmerProfile.objects.filter(**filters).select_related('user', 'fpo')
        
        # Additional crop filter
        if crop_type:
            farmers = farmers.filter(primary_crops__contains=[crop_type])
        
        farmer_data = []
        for farmer in farmers[:200]:  # Limit for performance
            farmer_data.append({
                'id': str(farmer.id),
                'full_name': farmer.full_name,
                'phone_number': farmer.user.phone_number,
                'district': farmer.district,
                'state': farmer.state,
                'total_land_acres': float(farmer.total_land_acres),
                'primary_crops': farmer.primary_crops,
                'kyc_status': farmer.kyc_status,
                'fpo_name': farmer.fpo.organization_name if farmer.fpo else None,
                'farming_experience_years': farmer.farming_experience_years,
                'total_lots_created': farmer.total_lots_created,
                'total_earnings': float(farmer.total_earnings),
                'latitude': float(farmer.latitude) if farmer.latitude else None,
                'longitude': float(farmer.longitude) if farmer.longitude else None,
                'created_at': farmer.created_at.isoformat()
            })
        
        # Summary statistics
        total_farmers = farmers.count()
        total_land = farmers.aggregate(total=Sum('total_land_acres'))['total'] or 0
        verified_count = farmers.filter(kyc_status='verified').count()
        
        return Response(
            response_success(
                message="Farmer registry data fetched successfully",
                data={
                    'farmers': farmer_data,
                    'total_count': total_farmers,
                    'displayed_count': len(farmer_data),
                    'total_land_acres': float(total_land),
                    'verified_count': verified_count,
                    'verification_rate': (verified_count / total_farmers * 100) if total_farmers > 0 else 0
                }
            )
        )


class ProcessorMonitoringAPIView(APIView):
    """
    Processor monitoring with production and efficiency metrics
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        state = request.query_params.get('state')
        
        filters = {'is_active': True}
        if state:
            filters['state'] = state
        
        processors = ProcessorProfile.objects.filter(**filters).select_related('user')
        
        processor_data = []
        for processor in processors:
            # Get processing statistics
            total_batches = ProcessingBatch.objects.filter(processor=processor).count()
            completed_batches = ProcessingBatch.objects.filter(
                processor=processor,
                status='completed'
            ).count()
            
            total_input = ProcessingBatch.objects.filter(
                processor=processor
            ).aggregate(total=Sum('input_quantity_quintals'))['total'] or 0
            
            total_output = ProcessingBatch.objects.filter(
                processor=processor,
                status='completed'
            ).aggregate(total=Sum('output_quantity_quintals'))['total'] or 0
            
            efficiency = (total_output / total_input * 100) if total_input > 0 else 0
            
            # Get bids statistics
            total_bids = Bid.objects.filter(bidder=processor.user).count()
            won_bids = Bid.objects.filter(bidder=processor.user, status='accepted').count()
            
            processor_data.append({
                'id': str(processor.id),
                'company_name': processor.company_name,
                'license_number': processor.license_number,
                'district': processor.district,
                'state': processor.state,
                'processing_capacity_mt_per_day': float(processor.processing_capacity_mt_per_day),
                'total_batches': total_batches,
                'completed_batches': completed_batches,
                'completion_rate': (completed_batches / total_batches * 100) if total_batches > 0 else 0,
                'total_input_quintals': float(total_input),
                'total_output_quintals': float(total_output),
                'processing_efficiency': round(efficiency, 2),
                'total_bids': total_bids,
                'won_bids': won_bids,
                'bid_success_rate': (won_bids / total_bids * 100) if total_bids > 0 else 0,
                'is_verified': processor.is_verified,
                'latitude': float(processor.latitude) if processor.latitude else None,
                'longitude': float(processor.longitude) if processor.longitude else None
            })
        
        return Response(
            response_success(
                message="Processor monitoring data fetched successfully",
                data={
                    'processors': processor_data,
                    'total_count': len(processor_data),
                    'total_processing_capacity': sum(p['processing_capacity_mt_per_day'] for p in processor_data),
                    'avg_efficiency': sum(p['processing_efficiency'] for p in processor_data) / len(processor_data) if processor_data else 0
                }
            )
        )


class RetailerAnalyticsAPIView(APIView):
    """
    Retailer analytics and performance tracking
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        state = request.query_params.get('state')
        
        filters = {'is_active': True}
        if state:
            filters['state'] = state
        
        retailers = RetailerProfile.objects.filter(**filters).select_related('user')
        
        retailer_data = []
        for retailer in retailers:
            # Get order statistics
            from apps.retailers.models import RetailerOrder
            
            total_orders = RetailerOrder.objects.filter(retailer=retailer).count()
            completed_orders = RetailerOrder.objects.filter(
                retailer=retailer,
                status='delivered'
            ).count()
            
            total_value = RetailerOrder.objects.filter(
                retailer=retailer,
                status='delivered'
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            retailer_data.append({
                'id': str(retailer.id),
                'business_name': retailer.business_name,
                'gstin': retailer.gstin,
                'district': retailer.district,
                'state': retailer.state,
                'total_orders': total_orders,
                'completed_orders': completed_orders,
                'order_fulfillment_rate': (completed_orders / total_orders * 100) if total_orders > 0 else 0,
                'total_purchase_value': float(total_value),
                'is_verified': retailer.is_verified,
                'latitude': float(retailer.latitude) if retailer.latitude else None,
                'longitude': float(retailer.longitude) if retailer.longitude else None
            })
        
        return Response(
            response_success(
                message="Retailer analytics data fetched successfully",
                data={
                    'retailers': retailer_data,
                    'total_count': len(retailer_data),
                    'total_transaction_value': sum(r['total_purchase_value'] for r in retailer_data)
                }
            )
        )


class SupplyChainTrackingAPIView(APIView):
    """
    End-to-end supply chain tracking and logistics monitoring
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        status_filter = request.query_params.get('status')
        crop_type = request.query_params.get('crop_type')
        
        # Get shipments
        filters = {'is_active': True}
        if status_filter:
            filters['status'] = status_filter
        if crop_type:
            filters['lot__crop_type'] = crop_type
        
        shipments = Shipment.objects.filter(**filters).select_related(
            'lot', 'logistics_partner', 'pickup_location', 'delivery_location'
        )[:100]
        
        shipment_data = []
        for shipment in shipments:
            shipment_data.append({
                'id': str(shipment.id),
                'tracking_number': shipment.tracking_number,
                'lot_id': str(shipment.lot.id),
                'crop_type': shipment.lot.crop_type,
                'quantity_quintals': float(shipment.quantity_quintals),
                'status': shipment.status,
                'logistics_partner': shipment.logistics_partner.company_name if shipment.logistics_partner else None,
                'pickup_location': {
                    'name': shipment.pickup_location.warehouse_name if shipment.pickup_location else None,
                    'district': shipment.pickup_location.district if shipment.pickup_location else None,
                    'state': shipment.pickup_location.state if shipment.pickup_location else None
                },
                'delivery_location': {
                    'name': shipment.delivery_location.warehouse_name if shipment.delivery_location else None,
                    'district': shipment.delivery_location.district if shipment.delivery_location else None,
                    'state': shipment.delivery_location.state if shipment.delivery_location else None
                },
                'pickup_date': shipment.pickup_date.isoformat() if shipment.pickup_date else None,
                'delivery_date': shipment.delivery_date.isoformat() if shipment.delivery_date else None,
                'estimated_delivery': shipment.estimated_delivery.isoformat() if shipment.estimated_delivery else None,
                'current_latitude': float(shipment.current_latitude) if shipment.current_latitude else None,
                'current_longitude': float(shipment.current_longitude) if shipment.current_longitude else None
            })
        
        # Statistics
        total_shipments = Shipment.objects.count()
        status_breakdown = Shipment.objects.values('status').annotate(count=Count('id'))
        
        return Response(
            response_success(
                message="Supply chain tracking data fetched successfully",
                data={
                    'shipments': shipment_data,
                    'total_shipments': total_shipments,
                    'displayed_count': len(shipment_data),
                    'status_breakdown': list(status_breakdown)
                }
            )
        )


class ProcurementAnalyticsAPIView(APIView):
    """
    Detailed procurement analytics with trends and insights
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        crop_type = request.query_params.get('crop_type')
        state = request.query_params.get('state')
        days = int(request.query_params.get('days', 30))
        
        start_date = timezone.now() - timedelta(days=days)
        
        filters = {'is_active': True, 'created_at__gte': start_date}
        if crop_type:
            filters['crop_type'] = crop_type
        if state:
            filters['farmer__state'] = state
        
        lots = ProcurementLot.objects.filter(**filters)
        
        # Overall statistics
        total_lots = lots.count()
        total_quantity = lots.aggregate(total=Sum('quantity_quintals'))['total'] or 0
        avg_price = lots.aggregate(avg=Avg('expected_price_per_quintal'))['avg'] or 0
        total_value = lots.aggregate(total=Sum(F('quantity_quintals') * F('expected_price_per_quintal')))['total'] or 0
        
        # Crop-wise breakdown
        crop_breakdown = lots.values('crop_type').annotate(
            total_quantity=Sum('quantity_quintals'),
            lot_count=Count('id'),
            avg_price=Avg('expected_price_per_quintal'),
            min_price=Min('expected_price_per_quintal'),
            max_price=Max('expected_price_per_quintal')
        ).order_by('-total_quantity')
        
        # Daily trends
        from django.db.models.functions import TruncDate
        daily_trends = lots.annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            lots=Count('id'),
            quantity=Sum('quantity_quintals')
        ).order_by('date')
        
        # Status distribution
        status_distribution = lots.values('status').annotate(count=Count('id'))
        
        return Response(
            response_success(
                message="Procurement analytics fetched successfully",
                data={
                    'summary': {
                        'total_lots': total_lots,
                        'total_quantity_quintals': float(total_quantity),
                        'total_quantity_mt': float(total_quantity) / 10,
                        'average_price_per_quintal': float(avg_price),
                        'total_value': float(total_value),
                        'days_covered': days
                    },
                    'crop_breakdown': list(crop_breakdown),
                    'daily_trends': list(daily_trends),
                    'status_distribution': list(status_distribution)
                }
            )
        )


class MarketPricesAnalyticsAPIView(APIView):
    """
    Market prices analytics with MSP comparison and trends
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        crop_type = request.query_params.get('crop_type')
        state = request.query_params.get('state')
        days = int(request.query_params.get('days', 30))
        
        start_date = timezone.now().date() - timedelta(days=days)
        
        filters = {'date__gte': start_date}
        if crop_type:
            filters['crop_type'] = crop_type
        if state:
            filters['state'] = state
        
        prices = MandiPrice.objects.filter(**filters)
        
        # Calculate statistics
        price_stats = prices.aggregate(
            avg_modal=Avg('modal_price'),
            min_modal=Min('modal_price'),
            max_modal=Max('modal_price'),
            avg_min=Avg('min_price'),
            avg_max=Avg('max_price')
        )
        
        # Crop-wise prices
        crop_prices = prices.values('crop_type').annotate(
            avg_modal_price=Avg('modal_price'),
            min_price=Min('modal_price'),
            max_price=Max('modal_price'),
            market_count=Count('market_name', distinct=True)
        ).order_by('-avg_modal_price')
        
        # Get MSP records
        msp_records = MSPRecord.objects.filter(is_active=True)
        if crop_type:
            msp_records = msp_records.filter(crop_type=crop_type)
        
        msp_data = []
        for msp in msp_records:
            msp_data.append({
                'crop_type': msp.crop_type,
                'crop_name': msp.crop_name,
                'msp_price_per_quintal': float(msp.msp_price_per_quintal),
                'year': msp.year,
                'season': msp.season
            })
        
        # Price trends (daily average)
        from django.db.models.functions import TruncDate
        price_trends = prices.annotate(
            date=TruncDate('date')
        ).values('date').annotate(
            avg_price=Avg('modal_price'),
            min_price=Min('modal_price'),
            max_price=Max('modal_price')
        ).order_by('date')
        
        return Response(
            response_success(
                message="Market prices analytics fetched successfully",
                data={
                    'statistics': {
                        'average_modal_price': float(price_stats['avg_modal'] or 0),
                        'min_price': float(price_stats['min_modal'] or 0),
                        'max_price': float(price_stats['max_modal'] or 0),
                        'price_range': float((price_stats['max_modal'] or 0) - (price_stats['min_modal'] or 0)),
                        'days_covered': days
                    },
                    'crop_wise_prices': list(crop_prices),
                    'msp_records': msp_data,
                    'price_trends': list(price_trends)
                }
            )
        )
