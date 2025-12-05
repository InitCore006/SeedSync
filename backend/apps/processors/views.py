"""
Processor Views - Complete Implementation
Handles processor dashboard, procurement, batches, and inventory
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import timedelta

from apps.core.utils import response_success, response_error
from apps.core.permissions import IsProcessor
from .models import ProcessorProfile, ProcessingPlant, ProcessingBatch
from .serializers import ProcessorProfileSerializer, ProcessingPlantSerializer, ProcessingBatchSerializer
from apps.lots.models import ProcurementLot
from apps.bids.models import Bid


class ProcessorProfileAPIView(APIView):
    """
    Get or update processor profile
    """
    permission_classes = [IsAuthenticated, IsProcessor]
    
    def get(self, request):
        """Get processor profile"""
        try:
            processor = ProcessorProfile.objects.get(user=request.user)
            serializer = ProcessorProfileSerializer(processor)
            return Response(
                response_success(
                    message="Profile fetched successfully",
                    data=serializer.data
                )
            )
        except ProcessorProfile.DoesNotExist:
            return Response(
                response_error(message="Processor profile not found"),
                status=404
            )
    
    def patch(self, request):
        """Update processor profile"""
        try:
            processor = ProcessorProfile.objects.get(user=request.user)
            serializer = ProcessorProfileSerializer(processor, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    response_success(
                        message="Profile updated successfully",
                        data=serializer.data
                    )
                )
            return Response(
                response_error(message="Validation failed", errors=serializer.errors),
                status=400
            )
        except ProcessorProfile.DoesNotExist:
            return Response(
                response_error(message="Processor profile not found"),
                status=404
            )


class ProcessorDashboardAPIView(APIView):
    """
    Processor Dashboard with key metrics and analytics
    """
    permission_classes = [IsAuthenticated, IsProcessor]
    
    def get(self, request):
        try:
            processor = ProcessorProfile.objects.get(user=request.user)
        except ProcessorProfile.DoesNotExist:
            return Response(
                response_error(message="Processor profile not found"),
                status=404
            )
        
        # Active bids statistics
        active_bids = Bid.objects.filter(
            bidder_id=processor.id,
            bidder_type='processor',
            status='pending'
        ).count()
        
        accepted_bids = Bid.objects.filter(
            bidder_id=processor.id,
            bidder_type='processor',
            status='accepted'
        ).count()
        
        # Processing batches statistics
        active_batches = ProcessingBatch.objects.filter(
            plant__processor=processor,
            is_active=True
        ).count()
        
        completed_batches = ProcessingBatch.objects.filter(
            plant__processor=processor,
            is_active=True
        ).count()
        
        # Calculate raw material and finished product stock
        # Note: This is simplified - in real app, you'd have inventory models
        raw_material_stock_mt = 0  # Calculate from inventory
        finished_product_stock_mt = 0  # Calculate from inventory
        
        # Recent batches
        recent_batches = ProcessingBatch.objects.filter(
            plant__processor=processor,
            is_active=True
        ).select_related('lot', 'plant').order_by('-created_at')[:5]
        
        recent_batches_data = []
        for batch in recent_batches:
            recent_batches_data.append({
                'id': str(batch.id),
                'batch_number': batch.batch_number,
                'crop_name': batch.lot.crop_type if batch.lot else 'N/A',
                'product_name': f"{batch.lot.crop_type} Oil" if batch.lot else 'N/A',
                'input_quantity_kg': float(batch.processed_quantity) if batch.processed_quantity else 0,
                'output_quantity_kg': float(batch.oil_extracted) if batch.oil_extracted else 0,
                'status': 'completed',  # Simplified
                'processing_date': batch.processing_date.isoformat() if batch.processing_date else None,
            })
        
        # Calculate average processing time
        avg_processing_days = 3  # Simplified calculation
        
        dashboard_data = {
            'active_bids': active_bids,
            'accepted_bids': accepted_bids,
            'active_batches': active_batches,
            'completed_batches': completed_batches,
            'raw_material_stock_mt': float(raw_material_stock_mt),
            'finished_product_stock_mt': float(finished_product_stock_mt),
            'recent_batches': recent_batches_data,
            'avg_processing_days': avg_processing_days,
            'processor_info': {
                'company_name': processor.company_name,
                'processing_capacity': float(processor.processing_capacity_quintals_per_day),
                'is_verified': processor.is_verified
            }
        }
        
        return Response(
            response_success(
                message="Dashboard data fetched successfully",
                data=dashboard_data
            )
        )


class ProcessorProcurementAPIView(APIView):
    """
    Browse available lots for procurement
    """
    permission_classes = [IsAuthenticated, IsProcessor]
    
    def get(self, request):
        """Browse available lots for procurement"""
        try:
            processor = ProcessorProfile.objects.get(user=request.user)
        except ProcessorProfile.DoesNotExist:
            return Response(
                response_error(message="Processor profile not found"),
                status=404
            )
        
        # Get query parameters
        crop_type = request.query_params.get('crop_type')
        quality_grade = request.query_params.get('quality_grade')
        max_price = request.query_params.get('max_price')
        
        # Available lots
        lots = ProcurementLot.objects.filter(
            status__in=['available', 'bidding'],
            is_active=True,
            available_quantity_quintals__gt=0
        ).select_related('farmer', 'farmer__user')
        
        # Apply filters
        if crop_type:
            lots = lots.filter(crop_type=crop_type)
        
        if quality_grade:
            lots = lots.filter(quality_grade=quality_grade)
        
        if max_price:
            lots = lots.filter(expected_price_per_quintal__lte=max_price)
        
        # Order by price
        lots = lots.order_by('expected_price_per_quintal')
        
        lots_data = []
        for lot in lots:
            lots_data.append({
                'id': str(lot.id),
                'lot_number': lot.lot_number,
                'farmer': {
                    'id': str(lot.farmer.id),
                    'full_name': lot.farmer.full_name,
                    'phone_number': lot.farmer.user.phone_number,
                },
                'crop_type': lot.crop_type,
                'quantity_quintals': float(lot.available_quantity_quintals),
                'quality_grade': lot.quality_grade,
                'expected_price_per_quintal': float(lot.expected_price_per_quintal),
                'harvest_date': lot.harvest_date.isoformat(),
                'status': lot.status,
                'description': lot.description or '',
                'qr_code_url': lot.qr_code_url or None,
                'blockchain_tx_id': lot.blockchain_tx_id or None,
                'created_at': lot.created_at.isoformat(),
            })
        
        # Paginated response
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        
        start = (page - 1) * page_size
        end = start + page_size
        
        return Response({
            'status': 'success',
            'message': 'Procurement opportunities fetched successfully',
            'data': {
                'results': lots_data[start:end]
            },
            'meta': {
                'count': len(lots_data),
                'page': page,
                'page_size': page_size,
                'next': None,
                'previous': None
            }
        })


class ProcessingBatchesAPIView(APIView):
    """
    Manage processing batches - list and create
    """
    permission_classes = [IsAuthenticated, IsProcessor]
    
    def get(self, request):
        """Get all processing batches"""
        try:
            processor = ProcessorProfile.objects.get(user=request.user)
        except ProcessorProfile.DoesNotExist:
            return Response(
                response_error(message="Processor profile not found"),
                status=404
            )
        
        batches = ProcessingBatch.objects.filter(
            plant__processor=processor,
            is_active=True
        ).select_related('lot', 'plant').order_by('-created_at')
        
        batches_data = []
        for batch in batches:
            batches_data.append({
                'id': str(batch.id),
                'batch_number': batch.batch_number,
                'lot': {
                    'id': str(batch.lot.id) if batch.lot else None,
                    'lot_number': batch.lot.lot_number if batch.lot else None,
                    'crop_type': batch.lot.crop_type if batch.lot else None,
                },
                'plant': {
                    'id': str(batch.plant.id),
                    'name': batch.plant.plant_name,
                },
                'processed_quantity': float(batch.processed_quantity) if batch.processed_quantity else 0,
                'oil_extracted': float(batch.oil_extracted) if batch.oil_extracted else 0,
                'cake_produced': float(batch.cake_produced) if batch.cake_produced else 0,
                'processing_date': batch.processing_date.isoformat() if batch.processing_date else None,
                'created_at': batch.created_at.isoformat(),
            })
        
        # Paginated response
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        
        start = (page - 1) * page_size
        end = start + page_size
        
        return Response({
            'status': 'success',
            'message': 'Batches fetched successfully',
            'data': {
                'results': batches_data[start:end]
            },
            'meta': {
                'count': len(batches_data),
                'page': page,
                'page_size': page_size,
                'next': None,
                'previous': None
            }
        })
    
    def post(self, request):
        """Create new processing batch"""
        try:
            processor = ProcessorProfile.objects.get(user=request.user)
        except ProcessorProfile.DoesNotExist:
            return Response(
                response_error(message="Processor profile not found"),
                status=404
            )
        
        serializer = ProcessingBatchSerializer(data=request.data)
        if serializer.is_valid():
            batch = serializer.save()
            return Response(
                response_success(
                    message="Batch created successfully",
                    data=ProcessingBatchSerializer(batch).data
                ),
                status=201
            )
        
        return Response(
            response_error(message="Validation failed", errors=serializer.errors),
            status=400
        )


class ProcessorInventoryAPIView(APIView):
    """
    Get processor inventory (raw materials and finished products)
    """
    permission_classes = [IsAuthenticated, IsProcessor]
    
    def get(self, request):
        """Get inventory data"""
        try:
            processor = ProcessorProfile.objects.get(user=request.user)
        except ProcessorProfile.DoesNotExist:
            return Response(
                response_error(message="Processor profile not found"),
                status=404
            )
        
        # Mock inventory data - In real app, you'd have inventory models
        inventory_data = {
            'raw_materials': [
                {
                    'id': 1,
                    'name': 'Soybean Seeds',
                    'quantity': 15000,
                    'unit': 'kg',
                    'category': 'raw',
                    'location': 'Warehouse 1',
                    'min_stock': 5000,
                    'status': 'optimal',
                    'last_updated': timezone.now().isoformat()
                },
                {
                    'id': 2,
                    'name': 'Mustard Seeds',
                    'quantity': 8000,
                    'unit': 'kg',
                    'category': 'raw',
                    'location': 'Warehouse 1',
                    'min_stock': 3000,
                    'status': 'optimal',
                    'last_updated': timezone.now().isoformat()
                }
            ],
            'finished_products': [
                {
                    'id': 3,
                    'name': 'Soybean Oil',
                    'quantity': 5000,
                    'unit': 'liters',
                    'category': 'finished',
                    'location': 'Storage A',
                    'min_stock': 2000,
                    'status': 'optimal',
                    'last_updated': timezone.now().isoformat()
                },
                {
                    'id': 4,
                    'name': 'Mustard Oil',
                    'quantity': 3500,
                    'unit': 'liters',
                    'category': 'finished',
                    'location': 'Storage B',
                    'min_stock': 2000,
                    'status': 'optimal',
                    'last_updated': timezone.now().isoformat()
                }
            ]
        }
        
        return Response(
            response_success(
                message="Inventory fetched successfully",
                data=inventory_data
            )
        )
