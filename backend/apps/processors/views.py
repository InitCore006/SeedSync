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
        ).aggregate(total=Sum('processed_quantity'))['total'] or 0
        
        total_oil_extracted = ProcessingBatch.objects.filter(
            plant__processor=processor
        ).aggregate(total=Sum('oil_extracted'))['total'] or 0
        
        total_cake_produced = ProcessingBatch.objects.filter(
            plant__processor=processor
        ).aggregate(total=Sum('cake_produced'))['total'] or 0
        
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
                'processed_quantity': float(batch.processed_quantity) if batch.processed_quantity else 0,
                'oil_extracted': float(batch.oil_extracted) if batch.oil_extracted else 0,
                'cake_produced': float(batch.cake_produced) if batch.cake_produced else 0,
                'processing_date': batch.processing_date.isoformat() if batch.processing_date else None,
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
            total_oil=Sum('oil_extracted'),
            total_cake=Sum('cake_produced')
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
