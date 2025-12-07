"""
Processor Views - Complete Implementation
Handles processor dashboard, procurement, batches, inventory, bids, and analytics
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Sum, Count, Avg, Q, F
from django.db import transaction
from django.utils import timezone
from datetime import timedelta, datetime
from decimal import Decimal

from apps.core.utils import response_success, response_error
from apps.core.permissions import IsProcessor
from .models import ProcessorProfile, ProcessingPlant, ProcessingBatch, ProcessingStageLog, FinishedProduct
from .serializers import (
    ProcessorProfileSerializer, 
    ProcessingPlantSerializer, 
    ProcessingBatchSerializer,
    ProcessingBatchCreateSerializer,
    ProcessingStageLogSerializer,
    FinishedProductSerializer
)
from apps.lots.models import ProcurementLot
from apps.bids.models import Bid
from apps.warehouses.models import Inventory, StockMovement


class ProcessorProfileAPIView(APIView):
    """
    Get or update Processor profile
    GET: /api/processors/profile/
    PATCH: /api/processors/profile/
    """
    permission_classes = [IsAuthenticated, IsProcessor]
    
    def get(self, request):
        """Get Processor profile"""
        try:
            processor = ProcessorProfile.objects.get(user=request.user)
        except ProcessorProfile.DoesNotExist:
            # Auto-create profile if it doesn't exist
            processor = ProcessorProfile.objects.create(
                user=request.user,
                company_name=f"{request.user.get_full_name() or request.user.username}'s Processing Company",
                contact_person=request.user.get_full_name() or request.user.username,
                phone=request.user.phone or '',
                email=request.user.email,
                is_verified=False
            )
        
        serializer = ProcessorProfileSerializer(processor)
        return Response(
            response_success(
                message="Profile fetched successfully",
                data=serializer.data
            )
        )
    
    def patch(self, request):
        """Update Processor profile"""
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


class ProcessingPlantViewSet(viewsets.ModelViewSet):
    """
    Processing Plant CRUD operations
    GET: /api/processors/plants/ - List all plants
    POST: /api/processors/plants/ - Create new plant
    GET: /api/processors/plants/{id}/ - Get plant details
    PATCH: /api/processors/plants/{id}/ - Update plant
    DELETE: /api/processors/plants/{id}/ - Delete plant
    """
    serializer_class = ProcessingPlantSerializer
    permission_classes = [IsAuthenticated, IsProcessor]
    
    def get_queryset(self):
        """Return plants owned by the current processor"""
        try:
            processor = ProcessorProfile.objects.get(user=self.request.user)
            return ProcessingPlant.objects.filter(processor=processor).order_by('-created_at')
        except ProcessorProfile.DoesNotExist:
            return ProcessingPlant.objects.none()
    
    def create(self, request):
        """Create a new processing plant"""
        try:
            processor = ProcessorProfile.objects.get(user=request.user)
        except ProcessorProfile.DoesNotExist:
            return Response(
                response_error(message="Processor profile not found"),
                status=404
            )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(processor=processor)
            return Response(
                response_success(
                    message="Processing plant created successfully",
                    data=serializer.data
                ),
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            response_error(message="Validation failed", errors=serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def list(self, request):
        """List all processing plants"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response(
            response_success(
                message="Processing plants fetched successfully",
                data=serializer.data
            )
        )
    
    def retrieve(self, request, pk=None):
        """Get a specific processing plant"""
        try:
            plant = self.get_queryset().get(pk=pk)
            serializer = self.get_serializer(plant)
            
            return Response(
                response_success(
                    message="Processing plant details fetched successfully",
                    data=serializer.data
                )
            )
        except ProcessingPlant.DoesNotExist:
            return Response(
                response_error(message="Processing plant not found"),
                status=status.HTTP_404_NOT_FOUND
            )
    
    def update(self, request, pk=None):
        """Update a processing plant"""
        try:
            plant = self.get_queryset().get(pk=pk)
        except ProcessingPlant.DoesNotExist:
            return Response(
                response_error(message="Processing plant not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(plant, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                response_success(
                    message="Processing plant updated successfully",
                    data=serializer.data
                )
            )
        
        return Response(
            response_error(message="Validation failed", errors=serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def destroy(self, request, pk=None):
        """Delete a processing plant"""
        try:
            plant = self.get_queryset().get(pk=pk)
            
            # Check if plant has active batches
            active_batches = ProcessingBatch.objects.filter(
                plant=plant,
                status__in=['pending', 'in_progress']
            ).count()
            
            if active_batches > 0:
                return Response(
                    response_error(
                        message=f"Cannot delete plant with {active_batches} active batches. Please complete or cancel them first."
                    ),
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            plant_name = plant.plant_name
            plant.delete()
            
            return Response(
                response_success(
                    message=f"Processing plant '{plant_name}' deleted successfully"
                )
            )
        except ProcessingPlant.DoesNotExist:
            return Response(
                response_error(message="Processing plant not found"),
                status=status.HTTP_404_NOT_FOUND
            )


class ProcessorDashboardAPIView(APIView):
    """
    Processor Dashboard with comprehensive metrics and analytics
    GET: /api/processors/dashboard/
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
        
        # Procurement statistics
        total_procured_lots = ProcurementLot.objects.filter(
            bids__bidder_id=processor.id,
            bids__bidder_type='processor',
            bids__status='accepted'
        ).distinct().count()
        
        total_procured_quantity = ProcurementLot.objects.filter(
            bids__bidder_id=processor.id,
            bids__bidder_type='processor',
            bids__status='accepted'
        ).distinct().aggregate(total=Sum('quantity_quintals'))['total'] or 0
        
        # Bidding statistics
        total_bids = Bid.objects.filter(
            bidder_id=processor.id,
            bidder_type='processor'
        ).count()
        
        pending_bids = Bid.objects.filter(
            bidder_id=processor.id,
            bidder_type='processor',
            status='pending'
        ).count()
        
        accepted_bids = Bid.objects.filter(
            bidder_id=processor.id,
            bidder_type='processor',
            status='accepted'
        ).count()
        
        rejected_bids = Bid.objects.filter(
            bidder_id=processor.id,
            bidder_type='processor',
            status='rejected'
        ).count()
        
        # Processing batches statistics
        total_batches = ProcessingBatch.objects.filter(
            plant__processor=processor
        ).count()
        
        total_processed_quantity = ProcessingBatch.objects.filter(
            plant__processor=processor
        ).aggregate(total=Sum('initial_quantity_quintals'))['total'] or 0
        
        total_oil_extracted = ProcessingBatch.objects.filter(
            plant__processor=processor
        ).aggregate(total=Sum('oil_extracted_quintals'))['total'] or 0
        
        total_cake_produced = ProcessingBatch.objects.filter(
            plant__processor=processor
        ).aggregate(total=Sum('cake_produced_quintals'))['total'] or 0
        
        # Processing efficiency
        extraction_efficiency = (total_oil_extracted / total_processed_quantity * 100) if total_processed_quantity > 0 else 0
        
        # Monthly procurement trend (last 6 months)
        monthly_trend = []
        for i in range(6):
            month_date = timezone.now().date() - timedelta(days=30*i)
            month_start = month_date.replace(day=1)
            next_month = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1)
            
            month_lots = ProcurementLot.objects.filter(
                bids__bidder_id=processor.id,
                bids__bidder_type='processor',
                bids__status='accepted',
                created_at__gte=month_start,
                created_at__lt=next_month
            ).distinct()
            
            month_quantity = month_lots.aggregate(total=Sum('quantity_quintals'))['total'] or 0
            month_count = month_lots.count()
            
            monthly_trend.append({
                'month': month_start.strftime('%B %Y'),
                'lots': month_count,
                'quantity_quintals': float(month_quantity)
            })
        
        # Crop-wise procurement
        crop_stats = ProcurementLot.objects.filter(
            bids__bidder_id=processor.id,
            bids__bidder_type='processor',
            bids__status='accepted'
        ).distinct().values('crop_type').annotate(
            total_quantity=Sum('quantity_quintals'),
            total_lots=Count('id'),
            avg_price=Avg('expected_price_per_quintal')
        )
        
        # Recent batches
        recent_batches = ProcessingBatch.objects.filter(
            plant__processor=processor
        ).select_related('lot', 'plant').order_by('-created_at')[:5]
        
        recent_batches_data = []
        for batch in recent_batches:
            recent_batches_data.append({
                'id': str(batch.id),
                'batch_number': batch.batch_number,
                'crop_type': batch.lot.crop_type if batch.lot else 'N/A',
                'processed_quantity': float(batch.initial_quantity_quintals) if batch.initial_quantity_quintals else 0,
                'oil_extracted': float(batch.oil_extracted_quintals) if batch.oil_extracted_quintals else 0,
                'cake_produced': float(batch.cake_produced_quintals) if batch.cake_produced_quintals else 0,
                'start_date': batch.start_date.isoformat() if batch.start_date else None,
                'plant_name': batch.plant.plant_name,
            })
        
        dashboard_data = {
            'processor_info': {
                'company_name': processor.company_name,
                'contact_person': processor.contact_person,
                'processing_capacity': float(processor.processing_capacity_quintals_per_day),
                'is_verified': processor.is_verified,
                'city': processor.city,
                'state': processor.state
            },
            'procurement': {
                'total_lots': total_procured_lots,
                'total_quantity_quintals': float(total_procured_quantity),
            },
            'bidding': {
                'total_bids': total_bids,
                'pending_bids': pending_bids,
                'accepted_bids': accepted_bids,
                'rejected_bids': rejected_bids,
                'success_rate': round((accepted_bids / total_bids * 100) if total_bids > 0 else 0, 2)
            },
            'processing': {
                'total_batches': total_batches,
                'total_processed_quintals': float(total_processed_quantity),
                'total_oil_extracted_quintals': float(total_oil_extracted),
                'total_cake_produced_quintals': float(total_cake_produced),
                'extraction_efficiency_percent': round(extraction_efficiency, 2)
            },
            'trends': {
                'monthly_procurement': list(reversed(monthly_trend)),
                'crop_wise_stats': list(crop_stats)
            },
            'recent_batches': recent_batches_data
        }
        
        return Response(
            response_success(
                message="Dashboard data fetched successfully",
                data=dashboard_data
            )
        )


class ProcessorBidsAPIView(APIView):
    """
    Manage processor bids - view and place bids
    GET: /api/processors/bids/
    POST: /api/processors/bids/
    """
    permission_classes = [IsAuthenticated, IsProcessor]
    
    def get(self, request):
        """Get all processor bids"""
        try:
            processor = ProcessorProfile.objects.get(user=request.user)
        except ProcessorProfile.DoesNotExist:
            return Response(
                response_error(message="Processor profile not found"),
                status=404
            )
        
        # Filter by status if provided
        bid_status = request.query_params.get('status')  # 'pending', 'accepted', 'rejected'
        
        bids = Bid.objects.filter(
            bidder_id=processor.id,
            bidder_type='processor'
        ).select_related('lot', 'lot__farmer', 'lot__farmer__user', 'lot__fpo').order_by('-created_at')
        
        if bid_status:
            bids = bids.filter(status=bid_status)
        
        bids_data = []
        for bid in bids:
            bid_data = {
                'id': str(bid.id),
                'lot': {
                    'id': str(bid.lot.id),
                    'lot_number': bid.lot.lot_number,
                    'crop_type': bid.lot.crop_type,
                    'quantity_quintals': float(bid.lot.quantity_quintals),
                    'quality_grade': bid.lot.quality_grade,
                    'expected_price_per_quintal': float(bid.lot.expected_price_per_quintal),
                },
                'bid_amount_per_quintal': float(bid.offered_price_per_quintal),
                'quantity_quintals': float(bid.quantity_quintals),
                'total_amount': float(bid.total_amount),
                'status': bid.status,
                'remarks': bid.message or '',  # Return as 'remarks' for frontend compatibility
                'created_at': bid.created_at.isoformat(),
                'updated_at': bid.updated_at.isoformat()
            }
            
            # Add farmer info if lot has a farmer (individual farmer lots)
            if bid.lot.farmer:
                bid_data['lot']['farmer'] = {
                    'full_name': bid.lot.farmer.full_name,
                    'phone_number': bid.lot.farmer.user.phone_number,
                }
            else:
                # FPO-aggregated lots have farmer=None
                bid_data['lot']['farmer'] = None
            
            # Add FPO info if lot is from FPO
            if bid.lot.fpo:
                bid_data['lot']['fpo'] = {
                    'organization_name': bid.lot.fpo.organization_name,
                    'phone_number': bid.lot.fpo.user.phone_number,
                }
            else:
                bid_data['lot']['fpo'] = None
            
            bids_data.append(bid_data)
        
        # Paginated response
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        
        start = (page - 1) * page_size
        end = start + page_size
        
        return Response({
            'status': 'success',
            'message': 'Bids fetched successfully',
            'data': {
                'results': bids_data[start:end]
            },
            'meta': {
                'count': len(bids_data),
                'page': page,
                'page_size': page_size,
                'total_pages': (len(bids_data) + page_size - 1) // page_size
            }
        })
    
    def post(self, request):
        """Place a new bid"""
        try:
            processor = ProcessorProfile.objects.get(user=request.user)
        except ProcessorProfile.DoesNotExist:
            return Response(
                response_error(message="Processor profile not found"),
                status=404
            )
        
        lot_id = request.data.get('lot_id')
        bid_amount_per_quintal = request.data.get('bid_amount_per_quintal')
        quantity_quintals = request.data.get('quantity_quintals')
        message = request.data.get('remarks', '')  # Frontend sends 'remarks' but model uses 'message'
        
        # Validate inputs
        if not all([lot_id, bid_amount_per_quintal, quantity_quintals]):
            return Response(
                response_error(message="Missing required fields: lot_id, bid_amount_per_quintal, quantity_quintals"),
                status=400
            )
        
        try:
            lot = ProcurementLot.objects.get(id=lot_id, status__in=['available', 'bidding'], is_active=True)
        except ProcurementLot.DoesNotExist:
            return Response(
                response_error(message="Lot not found or not available for bidding"),
                status=404
            )
        
        # Check if quantity is available
        if float(quantity_quintals) > lot.available_quantity_quintals:
            return Response(
                response_error(message=f"Requested quantity exceeds available quantity ({lot.available_quantity_quintals} quintals)"),
                status=400
            )
        
        # Check if processor already has a pending bid on this lot
        existing_bid = Bid.objects.filter(
            lot=lot,
            bidder_id=processor.id,
            bidder_type='processor',
            status='pending'
        ).first()
        
        if existing_bid:
            return Response(
                response_error(message="You already have a pending bid on this lot"),
                status=400
            )
        
        # Create bid
        from datetime import date, timedelta
        
        bid = Bid.objects.create(
            lot=lot,
            bidder_id=processor.id,
            bidder_type='processor',
            bidder_name=processor.company_name,
            bidder_user=request.user,
            offered_price_per_quintal=bid_amount_per_quintal,
            quantity_quintals=quantity_quintals,
            expected_pickup_date=date.today() + timedelta(days=7),  # Default 7 days from now
            status='pending',
            message=message
        )
        
        # Update lot status to bidding
        if lot.status == 'available':
            lot.status = 'bidding'
            lot.save()
        
        return Response(
            response_success(
                message="Bid placed successfully",
                data={
                    'bid_id': str(bid.id),
                    'lot_number': lot.lot_number,
                    'total_amount': float(bid.total_amount)
                }
            ),
            status=201
        )


class ProcessorProcurementAPIView(APIView):
    """
    Browse available lots for procurement and view procurement history
    GET: /api/processors/procurement/
    """
    permission_classes = [IsAuthenticated, IsProcessor]
    
    def get(self, request):
        """Browse available lots or view procurement history"""
        try:
            processor = ProcessorProfile.objects.get(user=request.user)
        except ProcessorProfile.DoesNotExist:
            return Response(
                response_error(message="Processor profile not found"),
                status=404
            )
        
        # Check if viewing history or available lots
        view_type = request.query_params.get('view', 'available')  # 'available' or 'history'
        
        if view_type == 'history':
            # Get procurement history
            lots = ProcurementLot.objects.filter(
                bids__bidder_id=processor.id,
                bids__bidder_type='processor',
                bids__status='accepted'
            ).distinct().select_related('farmer', 'farmer__user', 'fpo').order_by('-created_at')
        else:
            # Get available lots for procurement
            lots = ProcurementLot.objects.filter(
                status__in=['available', 'bidding'],
                is_active=True,
                available_quantity_quintals__gt=0
            ).select_related('farmer', 'farmer__user', 'fpo')
            
            # Apply filters
            crop_type = request.query_params.get('crop_type')
            quality_grade = request.query_params.get('quality_grade')
            max_price = request.query_params.get('max_price')
            min_quantity = request.query_params.get('min_quantity')
            source = request.query_params.get('source')  # 'farmer' or 'fpo'
            
            if crop_type:
                lots = lots.filter(crop_type=crop_type)
            
            if quality_grade:
                lots = lots.filter(quality_grade=quality_grade)
            
            if max_price:
                lots = lots.filter(expected_price_per_quintal__lte=max_price)
            
            if min_quantity:
                lots = lots.filter(available_quantity_quintals__gte=min_quantity)
            
            if source == 'farmer':
                lots = lots.filter(farmer__isnull=False, fpo__isnull=True)
            elif source == 'fpo':
                lots = lots.filter(fpo__isnull=False)
            
            # Order by best quality and price
            lots = lots.order_by('quality_grade', 'expected_price_per_quintal')
        
        lots_data = []
        for lot in lots:
            lot_data = {
                'id': str(lot.id),
                'lot_number': lot.lot_number,
                'crop_type': lot.crop_type,
                'quantity_quintals': float(lot.quantity_quintals),
                'available_quantity_quintals': float(lot.available_quantity_quintals),
                'quality_grade': lot.quality_grade,
                'expected_price_per_quintal': float(lot.expected_price_per_quintal),
                'harvest_date': lot.harvest_date.isoformat(),
                'status': lot.status,
                'description': lot.description or '',
                'qr_code_url': lot.qr_code_url or None,
                'blockchain_tx_id': lot.blockchain_tx_id or None,
                'created_at': lot.created_at.isoformat(),
                'source': 'fpo' if lot.fpo else 'farmer',
            }
            
            if lot.farmer:
                lot_data['farmer'] = {
                    'id': str(lot.farmer.id),
                    'full_name': lot.farmer.full_name,
                    'phone_number': lot.farmer.user.phone_number,
                    'district': lot.farmer.district or '',
                    'state': lot.farmer.state or ''
                }
            
            if lot.fpo:
                lot_data['fpo'] = {
                    'id': str(lot.fpo.id),
                    'organization_name': lot.fpo.organization_name,
                    'phone_number': lot.fpo.user.phone_number,
                }
            
            lots_data.append(lot_data)
        
        # Paginated response
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        
        start = (page - 1) * page_size
        end = start + page_size
        
        return Response({
            'status': 'success',
            'message': f'{"Procurement history" if view_type == "history" else "Available lots"} fetched successfully',
            'data': {
                'results': lots_data[start:end]
            },
            'meta': {
                'count': len(lots_data),
                'page': page,
                'page_size': page_size,
                'total_pages': (len(lots_data) + page_size - 1) // page_size,
                'next': page < ((len(lots_data) + page_size - 1) // page_size),
                'previous': page > 1
            }
        })


class ProcessingBatchesAPIView(APIView):
    """
    Manage processing batches - list and create
    GET: /api/processors/batches/
    POST: /api/processors/batches/
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
            plant__processor=processor
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
                'total_pages': (len(batches_data) + page_size - 1) // page_size
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
    GET: /api/processors/inventory/
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
        
        # Calculate inventory from procurement and processing
        raw_materials = []
        finished_products = []
        
        # Get procured lots through accepted bids
        procured_lots = ProcurementLot.objects.filter(
            bids__bidder_id=processor.id,
            bids__bidder_type='processor',
            bids__status='accepted'
        ).distinct().values('crop_type').annotate(
            total_quantity=Sum('quantity_quintals')
        )
        
        for lot in procured_lots:
            raw_materials.append({
                'name': f"{lot['crop_type']} Seeds",
                'quantity': float(lot['total_quantity']),
                'unit': 'quintals',
                'category': 'raw',
                'status': 'optimal'
            })
        
        # Get processed batches
        processed_batches = ProcessingBatch.objects.filter(
            plant__processor=processor
        ).values('lot__crop_type').annotate(
            total_oil=Sum('oil_extracted_quintals'),
            total_cake=Sum('cake_produced_quintals')
        )
        
        for batch in processed_batches:
            if batch['total_oil']:
                finished_products.append({
                    'name': f"{batch['lot__crop_type']} Oil",
                    'quantity': float(batch['total_oil']),
                    'unit': 'quintals',
                    'category': 'finished',
                    'status': 'optimal'
                })
            if batch['total_cake']:
                finished_products.append({
                    'name': f"{batch['lot__crop_type']} Cake",
                    'quantity': float(batch['total_cake']),
                    'unit': 'quintals',
                    'category': 'finished',
                    'status': 'optimal'
                })
        
        inventory_data = {
            'raw_materials': raw_materials,
            'finished_products': finished_products
        }
        
        return Response(
            response_success(
                message="Inventory fetched successfully",
                data=inventory_data
            )
        )


class LotAvailabilityAPIView(APIView):
    """
    Check lot availability for batch creation
    GET /api/processors/lots/{lot_id}/availability/
    """
    permission_classes = [IsAuthenticated, IsProcessor]
    
    def get(self, request, lot_id):
        """Get lot availability information"""
        try:
            processor = ProcessorProfile.objects.get(user=request.user)
        except ProcessorProfile.DoesNotExist:
            return Response(
                response_error(message="Processor profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            lot = ProcurementLot.objects.select_related('warehouse').get(id=lot_id)
        except ProcurementLot.DoesNotExist:
            return Response(
                response_error(message="Lot not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check ownership
        has_ownership = Bid.objects.filter(
            lot=lot,
            bidder_id=processor.id,
            bidder_type='processor',
            status='accepted'
        ).exists()
        
        # Get existing batches from this lot
        existing_batches = ProcessingBatch.objects.filter(
            lot=lot,
            plant__processor=processor
        ).aggregate(
            total_used=Sum('initial_quantity_quintals')
        )
        
        total_used = existing_batches['total_used'] or 0
        
        availability_data = {
            'lot_id': str(lot.id),
            'lot_number': lot.lot_number,
            'crop_type': lot.crop_type,
            'total_quantity': float(lot.quantity_quintals),
            'available_quantity': float(lot.available_quantity_quintals),
            'already_used_by_processor': float(total_used),
            'has_ownership': has_ownership,
            'is_in_warehouse': lot.warehouse is not None,
            'warehouse_info': None
        }
        
        if lot.warehouse:
            try:
                inventory = Inventory.objects.get(warehouse=lot.warehouse, lot=lot)
                availability_data['warehouse_info'] = {
                    'warehouse_id': str(lot.warehouse.id),
                    'warehouse_name': lot.warehouse.warehouse_name,
                    'warehouse_code': lot.warehouse.warehouse_code,
                    'inventory_quantity': float(inventory.quantity),
                    'warehouse_total_stock': float(lot.warehouse.current_stock_quintals)
                }
            except Inventory.DoesNotExist:
                pass
        
        return Response(
            response_success(
                message="Lot availability retrieved successfully",
                data=availability_data
            )
        )


class ProcessingBatchViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProcessingBatch with stage advancement and inventory deduction
    """
    permission_classes = [IsAuthenticated, IsProcessor]
    serializer_class = ProcessingBatchSerializer
    
    def get_queryset(self):
        processor = ProcessorProfile.objects.get(user=self.request.user)
        return ProcessingBatch.objects.filter(
            plant__processor=processor
        ).select_related('plant', 'lot').prefetch_related('stage_logs', 'finished_products')
    
    def create(self, request, *args, **kwargs):
        """
        Create new processing batch with automatic inventory deduction
        Validates ownership, quantity, and deducts from warehouse if applicable
        """
        try:
            processor = ProcessorProfile.objects.get(user=request.user)
        except ProcessorProfile.DoesNotExist:
            return Response(
                response_error(message="Processor profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get lot and validate
        lot_id = request.data.get('lot')
        if not lot_id:
            return Response(
                response_error(message="Lot ID is required"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            lot = ProcurementLot.objects.select_related('warehouse').get(id=lot_id)
        except ProcurementLot.DoesNotExist:
            return Response(
                response_error(message="Lot not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validate ownership - processor must have accepted bid
        has_ownership = Bid.objects.filter(
            lot=lot,
            bidder_id=processor.id,
            bidder_type='processor',
            status='accepted'
        ).exists()
        
        if not has_ownership:
            return Response(
                response_error(message="You don't have rights to process this lot. Bid must be accepted first."),
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get and validate initial quantity
        try:
            initial_quantity = Decimal(str(request.data.get('initial_quantity_quintals', 0)))
        except (ValueError, TypeError):
            return Response(
                response_error(message="Invalid initial quantity value"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if initial_quantity <= 0:
            return Response(
                response_error(message="Initial quantity must be greater than 0"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if sufficient quantity available
        if initial_quantity > lot.available_quantity_quintals:
            return Response(
                response_error(
                    message=f"Insufficient quantity. Available: {lot.available_quantity_quintals}Q, Requested: {initial_quantity}Q"
                ),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create batch with inventory deduction
        with transaction.atomic():
            # Create the batch using create serializer
            serializer = ProcessingBatchCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            batch = serializer.save()
            
            inventory_changes = None
            
            # If lot is in warehouse, deduct inventory
            if lot.warehouse:
                try:
                    # Get inventory record
                    inventory = Inventory.objects.select_for_update().get(
                        warehouse=lot.warehouse,
                        lot=lot
                    )
                    
                    # Validate inventory has sufficient quantity
                    if inventory.quantity < initial_quantity:
                        raise ValueError(
                            f"Insufficient inventory. Warehouse has {inventory.quantity}Q, need {initial_quantity}Q"
                        )
                    
                    # Deduct from inventory
                    inventory.quantity -= initial_quantity
                    inventory.save()
                    
                    # Create stock movement OUT
                    stock_movement = StockMovement.objects.create(
                        warehouse=lot.warehouse,
                        lot=lot,
                        movement_type='out',
                        quantity=initial_quantity,
                        remarks=f'Moved to processing - Batch {batch.batch_number}'
                    )
                    
                    # Update warehouse stock
                    lot.warehouse.current_stock_quintals -= initial_quantity
                    lot.warehouse.save(update_fields=['current_stock_quintals'])
                    
                    inventory_changes = {
                        'warehouse_id': str(lot.warehouse.id),
                        'warehouse_name': lot.warehouse.warehouse_name,
                        'warehouse_code': lot.warehouse.warehouse_code,
                        'deducted_quantity': float(initial_quantity),
                        'remaining_warehouse_stock': float(lot.warehouse.current_stock_quintals),
                        'stock_movement_id': str(stock_movement.id)
                    }
                    
                except Inventory.DoesNotExist:
                    # Lot not in inventory system, just deduct from lot
                    pass
                except ValueError as e:
                    return Response(
                        response_error(message=str(e)),
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Update lot available quantity
            lot.available_quantity_quintals -= initial_quantity
            lot.save(update_fields=['available_quantity_quintals'])
            
            # Prepare response with full batch details
            batch_serializer = ProcessingBatchSerializer(batch)
            response_data = {
                'batch': batch_serializer.data,
                'lot_remaining_quantity': float(lot.available_quantity_quintals)
            }
            
            if inventory_changes:
                response_data['inventory_changes'] = inventory_changes
                message = f"Batch created successfully. {initial_quantity}Q deducted from warehouse {lot.warehouse.warehouse_code}"
            else:
                message = f"Batch created successfully. {initial_quantity}Q allocated from lot"
            
            return Response(
                response_success(
                    message=message,
                    data=response_data
                ),
                status=status.HTTP_201_CREATED
            )
    
    @action(detail=True, methods=['post'])
    def start_batch(self, request, pk=None):
        """
        Start processing a batch
        Note: Inventory is already deducted during batch creation
        """
        batch = self.get_object()
        
        if batch.status != 'pending':
            return Response(
                response_error(message="Batch has already been started"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify batch has initial quantity set
        if not batch.initial_quantity_quintals or batch.initial_quantity_quintals <= 0:
            return Response(
                response_error(message="Batch must have valid initial quantity"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        batch.status = 'in_progress'
        batch.start_date = timezone.now()
        batch.current_stage = 'cleaning'
        batch.save()
        
        # Create first stage log
        ProcessingStageLog.objects.create(
            batch=batch,
            stage='cleaning',
            input_quantity=batch.initial_quantity_quintals,
            output_quantity=0,
            start_time=timezone.now(),
            operator=request.user
        )
        
        serializer = self.get_serializer(batch)
        return Response(
            response_success(
                message="Batch processing started",
                data=serializer.data
            )
        )
    
    @action(detail=True, methods=['post'])
    def advance_stage(self, request, pk=None):
        """
        Complete current stage and advance to next stage
        POST /api/processors/batches/{id}/advance_stage/
        Body: {
            "output_quantity": 95.5,
            "waste_quantity": 2.5,
            "quality_metrics": {"moisture": 8.5, "purity": 99.2},
            "equipment_used": "Cleaner Model XYZ",
            "notes": "Good quality output"
        }
        """
        batch = self.get_object()
        
        if batch.status != 'in_progress':
            return Response(
                response_error(message="Batch is not in progress"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get current stage log
        try:
            current_log = ProcessingStageLog.objects.get(
                batch=batch,
                stage=batch.current_stage,
                end_time__isnull=True
            )
        except ProcessingStageLog.DoesNotExist:
            return Response(
                response_error(message="Current stage log not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update current stage log
        current_log.output_quantity = request.data.get('output_quantity')
        current_log.waste_quantity = request.data.get('waste_quantity', 0)
        current_log.quality_metrics = request.data.get('quality_metrics', {})
        current_log.equipment_used = request.data.get('equipment_used', '')
        current_log.notes = request.data.get('notes', '')
        current_log.end_time = timezone.now()
        current_log.save()
        
        # Update batch fields based on stage
        stage_field_map = {
            'cleaning': 'cleaned_quantity_quintals',
            'dehulling': 'dehulled_quantity_quintals',
            'crushing': 'crushed_quantity_quintals',
            'conditioning': 'conditioned_quantity_quintals',
        }
        
        if batch.current_stage in stage_field_map:
            setattr(batch, stage_field_map[batch.current_stage], current_log.output_quantity)
        
        # Update total waste
        batch.waste_quantity_quintals += current_log.waste_quantity
        
        # Determine next stage
        stages = [stage[0] for stage in ProcessingBatch.PROCESSING_STAGES]
        current_index = stages.index(batch.current_stage)
        
        if current_index < len(stages) - 1:
            next_stage = stages[current_index + 1]
            batch.current_stage = next_stage
            batch.save()
            
            # Create next stage log
            ProcessingStageLog.objects.create(
                batch=batch,
                stage=next_stage,
                input_quantity=current_log.output_quantity,
                output_quantity=0,
                start_time=timezone.now(),
                operator=request.user
            )
            
            serializer = self.get_serializer(batch)
            return Response(
                response_success(
                    message=f"Advanced to {next_stage} stage",
                    data=serializer.data
                )
            )
        else:
            # Last stage completed
            batch.status = 'completed'
            batch.completion_date = timezone.now()
            batch.save()
            
            serializer = self.get_serializer(batch)
            return Response(
                response_success(
                    message="Batch processing completed",
                    data=serializer.data
                )
            )
    
    @action(detail=True, methods=['post'])
    def record_output(self, request, pk=None):
        """
        Record final oil and cake outputs after pressing/refining
        POST /api/processors/batches/{id}/record_output/
        Body: {
            "oil_extracted_quintals": 35.5,
            "refined_oil_quintals": 34.0,
            "cake_produced_quintals": 58.5,
            "hulls_produced_quintals": 3.0
        }
        """
        batch = self.get_object()
        
        batch.oil_extracted_quintals = request.data.get('oil_extracted_quintals')
        batch.refined_oil_quintals = request.data.get('refined_oil_quintals')
        batch.cake_produced_quintals = request.data.get('cake_produced_quintals')
        batch.hulls_produced_quintals = request.data.get('hulls_produced_quintals')
        batch.save()
        
        serializer = self.get_serializer(batch)
        return Response(
            response_success(
                message="Output quantities recorded",
                data=serializer.data
            )
        )
    
    @action(detail=True, methods=['post'])
    def create_finished_products(self, request, pk=None):
        """
        Create finished product inventory entries from completed batch
        POST /api/processors/batches/{id}/create_finished_products/
        Body: {
            "products": [
                {
                    "product_type": "refined_oil",
                    "quantity_quintals": 34.0,
                    "storage_location": "Tank A1",
                    "quality_grade": "Premium",
                    "packaging_type": "5L bottles"
                }
            ]
        }
        """
        batch = self.get_object()
        
        if batch.status != 'completed':
            return Response(
                response_error(message="Batch must be completed first"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        products_data = request.data.get('products', [])
        created_products = []
        
        for product_data in products_data:
            product = FinishedProduct.objects.create(
                batch=batch,
                product_type=product_data['product_type'],
                quantity_quintals=product_data['quantity_quintals'],
                available_quantity_quintals=product_data['quantity_quintals'],
                storage_location=product_data.get('storage_location', ''),
                quality_grade=product_data.get('quality_grade', ''),
                packaging_type=product_data.get('packaging_type', ''),
                production_date=timezone.now().date(),
                storage_conditions=product_data.get('storage_conditions', 'cool_dry'),
                selling_price_per_quintal=product_data.get('selling_price_per_quintal'),
                notes=product_data.get('notes', '')
            )
            created_products.append(product)
        
        serializer = FinishedProductSerializer(created_products, many=True)
        return Response(
            response_success(
                message="Finished products created successfully",
                data=serializer.data
            )
        )


class ProcessingStageLogAPIView(APIView):
    """
    Get stage logs for a batch
    GET /api/processors/batches/{batch_id}/stage-logs/
    """
    permission_classes = [IsAuthenticated, IsProcessor]
    
    def get(self, request, batch_id):
        processor = ProcessorProfile.objects.get(user=request.user)
        
        try:
            batch = ProcessingBatch.objects.get(
                id=batch_id,
                plant__processor=processor
            )
        except ProcessingBatch.DoesNotExist:
            return Response(
                response_error(message="Batch not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        stage_logs = ProcessingStageLog.objects.filter(batch=batch).select_related('operator')
        serializer = ProcessingStageLogSerializer(stage_logs, many=True)
        
        return Response(
            response_success(
                message="Stage logs fetched successfully",
                data=serializer.data
            )
        )


class FinishedProductAPIView(APIView):
    """
    Get finished products inventory
    GET /api/processors/finished-products/
    """
    permission_classes = [IsAuthenticated, IsProcessor]
    
    def get(self, request):
        processor = ProcessorProfile.objects.get(user=request.user)
        
        products = FinishedProduct.objects.filter(
            batch__plant__processor=processor
        ).select_related('batch').order_by('-production_date')
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            products = products.filter(status=status_filter)
        
        # Filter by product type if provided
        product_type = request.query_params.get('product_type')
        if product_type:
            products = products.filter(product_type=product_type)
        
        serializer = FinishedProductSerializer(products, many=True)
        
        return Response(
            response_success(
                message="Finished products fetched successfully",
                data=serializer.data
            )
        )
