"""
FPO Views - Complete Implementation
Handles FPO profile, dashboard, members, procurement, and warehouses
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.utils import response_success, response_error, generate_otp
from apps.core.permissions import IsFPO
from .models import FPOProfile, FPOMembership, FPOWarehouse
from .serializers import FPOProfileSerializer, FPOMembershipSerializer, FPOWarehouseSerializer
from apps.lots.models import ProcurementLot
from apps.farmers.models import FarmerProfile
from apps.bids.models import Bid
from apps.users.models import User, UserProfile, OTPVerification
from datetime import date


class FPOProfileAPIView(APIView):
    """
    Get, create or update FPO profile
    """
    permission_classes = [IsAuthenticated, IsFPO]
    
    def get(self, request):
        """Get FPO profile"""
        try:
            fpo = FPOProfile.objects.get(user=request.user)
            serializer = FPOProfileSerializer(fpo)
            return Response(
                response_success(
                    message="Profile fetched successfully",
                    data=serializer.data
                )
            )
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO profile not found"),
                status=404
            )
    
    def post(self, request):
        """Create FPO profile"""
        try:
            # Check if profile already exists
            existing_profile = FPOProfile.objects.filter(user=request.user).first()
            if existing_profile:
                return Response(
                    response_error(message="Profile already exists. Use PATCH to update."),
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = FPOProfileSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user)
                return Response(
                    response_success(
                        message="Profile created successfully",
                        data=serializer.data
                    ),
                    status=status.HTTP_201_CREATED
                )
            return Response(
                response_error(message="Validation failed", errors=serializer.errors),
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                response_error(message=f"Failed to create profile: {str(e)}"),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def patch(self, request):
        """Update FPO profile"""
        try:
            fpo = FPOProfile.objects.get(user=request.user)
            serializer = FPOProfileSerializer(fpo, data=request.data, partial=True)
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
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO profile not found"),
                status=404
            )


class FPODashboardAPIView(APIView):
    """
    FPO Dashboard with key metrics and analytics
    """
    permission_classes = [IsAuthenticated, IsFPO]
    
    def get(self, request):
        try:
            fpo = FPOProfile.objects.get(user=request.user)
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO profile not found"),
                status=404
            )
        
        # Member statistics
        total_members = FPOMembership.objects.filter(fpo=fpo, is_active=True).count()
        new_members_this_month = FPOMembership.objects.filter(
            fpo=fpo,
            is_active=True,
            created_at__gte=timezone.now().date().replace(day=1)
        ).count()
        
        # Procurement statistics
        total_procured_lots = ProcurementLot.objects.filter(fpo=fpo).count()
        total_procured_quantity = ProcurementLot.objects.filter(fpo=fpo).aggregate(
            total=Sum('quantity_quintals')
        )['total'] or 0
        
        # Active bids placed by FPO
        active_bids = Bid.objects.filter(
            bidder_id=fpo.id,
            bidder_type='fpo',
            status='pending'
        ).count()
        
        accepted_bids = Bid.objects.filter(
            bidder_id=fpo.id,
            bidder_type='fpo',
            status='accepted'
        ).count()
        
        # Warehouse utilization
        warehouses = FPOWarehouse.objects.filter(fpo=fpo)
        total_capacity = warehouses.aggregate(total=Sum('capacity_quintals'))['total'] or 0
        current_stock = warehouses.aggregate(total=Sum('current_stock_quintals'))['total'] or 0
        utilization_percentage = (current_stock / total_capacity * 100) if total_capacity > 0 else 0
        
        # Monthly procurement trend (last 6 months)
        monthly_trend = []
        for i in range(6):
            month_start = (timezone.now().date().replace(day=1) - timedelta(days=30*i))
            month_end = month_start.replace(day=28) + timedelta(days=4)
            
            month_lots = ProcurementLot.objects.filter(
                fpo=fpo,
                created_at__gte=month_start,
                created_at__lt=month_end
            ).aggregate(
                count=Count('id'),
                quantity=Sum('quantity_quintals')
            )
            
            monthly_trend.append({
                'month': month_start.strftime('%B %Y'),
                'lots': month_lots['count'] or 0,
                'quantity_quintals': float(month_lots['quantity'] or 0)
            })
        
        # Crop-wise procurement
        crop_stats = ProcurementLot.objects.filter(fpo=fpo).values('crop_type').annotate(
            total_quantity=Sum('quantity_quintals'),
            total_lots=Count('id'),
            avg_price=Avg('final_price_per_quintal')
        )
        
        dashboard_data = {
            'fpo_info': {
                'name': fpo.organization_name,
                'total_members': total_members,
                'new_members_this_month': new_members_this_month,
                'registration_year': fpo.year_of_registration,
                'is_verified': fpo.is_verified
            },
            'procurement': {
                'total_lots': total_procured_lots,
                'total_quantity_quintals': float(total_procured_quantity),
                'active_bids': active_bids,
                'accepted_bids': accepted_bids
            },
            'warehouse': {
                'total_capacity_quintals': float(total_capacity),
                'current_stock_quintals': float(current_stock),
                'utilization_percentage': round(utilization_percentage, 2),
                'warehouse_count': warehouses.count()
            },
            'trends': {
                'monthly_procurement': list(reversed(monthly_trend)),
                'crop_wise_stats': list(crop_stats)
            }
        }
        
        return Response(
            response_success(
                message="Dashboard data fetched successfully",
                data=dashboard_data
            )
        )


class FPOMembersAPIView(APIView):
    """
    Manage FPO members - list and add members
    """
    permission_classes = [IsAuthenticated, IsFPO]
    
    def get(self, request):
        """Get all FPO members"""
        try:
            fpo = FPOProfile.objects.get(user=request.user)
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO profile not found"),
                status=404
            )
        
        memberships = FPOMembership.objects.filter(
            fpo=fpo,
            is_active=True
        ).select_related('farmer', 'farmer__user')
        
        members_data = []
        for membership in memberships:
            farmer = membership.farmer
            members_data.append({
                'id': str(membership.id),
                'farmer': {
                    'id': str(farmer.id),
                    'full_name': farmer.full_name,
                    'phone_number': farmer.user.phone_number,
                },
                'fpo': str(fpo.id),
                'joined_date': membership.joined_date.isoformat() if membership.joined_date else None,
                'is_active': membership.is_active,
            })
        
        # Paginated response format matching frontend expectations
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        
        start = (page - 1) * page_size
        end = start + page_size
        
        return Response({
            'status': 'success',
            'message': 'Members fetched successfully',
            'data': {
                'results': members_data[start:end]
            },
            'meta': {
                'count': len(members_data),
                'page': page,
                'page_size': page_size,
                'next': None,
                'previous': None
            }
        })
    
    def post(self, request):
        """Add new member to FPO"""
        try:
            fpo = FPOProfile.objects.get(user=request.user)
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO profile not found"),
                status=404
            )
        
        phone_number = request.data.get('phone_number', '').strip()
        
        # Validate phone number
        if not phone_number:
            return Response(
                response_error(message="Phone number is required"),
                status=400
            )
        
        # Format phone number if needed
        if not phone_number.startswith('+91'):
            if phone_number.isdigit() and len(phone_number) == 10:
                phone_number = f"+91{phone_number}"
            else:
                return Response(
                    response_error(message="Invalid phone number format. Use 10 digits or +91 format"),
                    status=400
                )
        
        # Find farmer by phone number
        try:
            user = User.objects.get(phone_number=phone_number, role='farmer')
            farmer = FarmerProfile.objects.get(user=user)
        except User.DoesNotExist:
            return Response(
                response_error(message="No farmer found with this phone number"),
                status=404
            )
        except FarmerProfile.DoesNotExist:
            return Response(
                response_error(message="Farmer profile not found"),
                status=404
            )
        
        # Check if already member
        if FPOMembership.objects.filter(fpo=fpo, farmer=farmer, is_active=True).exists():
            return Response(
                response_error(message="Farmer is already a member"),
                status=400
            )
        
        membership = FPOMembership.objects.create(
            fpo=fpo,
            farmer=farmer,
            joined_date=timezone.now().date(),
            is_active=True
        )
        
        # Update farmer's FPO reference
        farmer.fpo = fpo
        farmer.save()
        
        # Update FPO member count
        fpo.active_members = FPOMembership.objects.filter(fpo=fpo, is_active=True).count()
        fpo.total_members = fpo.active_members
        fpo.save()
        
        return Response(
            response_success(
                message="Member added successfully",
                data={'membership_id': str(membership.id)}
            ),
            status=201
        )


class FPOProcurementAPIView(APIView):
    """
    Browse available lots for procurement
    """
    permission_classes = [IsAuthenticated, IsFPO]
    
    def get(self, request):
        """Browse available lots for procurement"""
        try:
            fpo = FPOProfile.objects.get(user=request.user)
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO profile not found"),
                status=404
            )
        
        # Get query parameters
        view_type = request.query_params.get('view', 'available')  # 'available' or 'all'
        crop_type = request.query_params.get('crop_type')
        quality_grade = request.query_params.get('quality_grade')
        max_price = request.query_params.get('max_price')
        
        # ONLY show lots from FPO's own members
        # Filter by fpo field (auto-set when farmer is member) and managed_by_fpo=True
        lots = ProcurementLot.objects.filter(
            fpo=fpo,  # Only this FPO's lots
            managed_by_fpo=True,  # Auto-managed member lots
            is_active=True,
        ).select_related('farmer', 'farmer__user', 'warehouse').prefetch_related('source_warehouses')
        
        # Apply view filter
        if view_type == 'available':
            lots = lots.filter(
                status='available',
                available_quantity_quintals__gt=0
            )
        # For 'all' view, show all lots regardless of status
        
        # Apply filters
        if crop_type:
            lots = lots.filter(crop_type=crop_type)
        
        if quality_grade:
            lots = lots.filter(quality_grade=quality_grade)
        
        if max_price:
            lots = lots.filter(expected_price_per_quintal__lte=max_price)
        
        # Order by creation date (newest first)
        lots = lots.order_by('-created_at')
        
        lots_data = []
        for lot in lots:
            # Handle farmer data - None for FPO-aggregated lots
            farmer_data = None
            if lot.farmer:
                farmer_data = {
                    'id': str(lot.farmer.id),
                    'full_name': lot.farmer.full_name,
                    'phone_number': lot.farmer.user.phone_number,
                }
            
            lots_data.append({
                'id': str(lot.id),
                'lot_number': lot.lot_number,
                'farmer': farmer_data,  # None for FPO-aggregated lots
                'farmer_name': lot.fpo.organization_name if lot.listing_type == 'fpo_aggregated' and not lot.farmer else (lot.farmer.full_name if lot.farmer else 'Unknown'),
                'crop_type': lot.crop_type,
                'quantity_quintals': float(lot.available_quantity_quintals),
                'quality_grade': lot.quality_grade,
                'expected_price_per_quintal': float(lot.expected_price_per_quintal),
                'harvest_date': lot.harvest_date.isoformat(),
                'status': lot.status,
                'listing_type': lot.listing_type,
                'description': lot.description or '',
                'qr_code_url': lot.qr_code_url or None,
                'blockchain_tx_id': lot.blockchain_tx_id or None,
                'created_at': lot.created_at.isoformat(),
                # Warehouse information
                'warehouse_id': str(lot.warehouse.id) if lot.warehouse else None,
                'warehouse_name': lot.warehouse.warehouse_name if lot.warehouse else None,
                'warehouse_code': lot.warehouse.warehouse_code if lot.warehouse else None,
                'warehouse_district': lot.warehouse.district if lot.warehouse else None,
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


class FPOWarehousesAPIView(APIView):
    """
    Manage FPO warehouses - Create, Read, Update, Delete
    """
    permission_classes = [IsAuthenticated, IsFPO]
    
    def get(self, request):
        """Get all FPO warehouses"""
        try:
            fpo = FPOProfile.objects.get(user=request.user)
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO profile not found"),
                status=404
            )
        
        warehouses = FPOWarehouse.objects.filter(fpo=fpo, is_operational=True)
        serializer = FPOWarehouseSerializer(warehouses, many=True)
        
        return Response(
            response_success(
                message="Warehouses fetched successfully",
                data=serializer.data
            )
        )
    
    def post(self, request):
        """Create new warehouse"""
        try:
            fpo = FPOProfile.objects.get(user=request.user)
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO profile not found"),
                status=404
            )
        
        # Check if warehouse code already exists
        warehouse_code = request.data.get('warehouse_code')
        if warehouse_code and FPOWarehouse.objects.filter(warehouse_code=warehouse_code).exists():
            return Response(
                response_error(message="Warehouse code already exists"),
                status=400
            )
        
        # Add FPO to request data
        data = request.data.copy()
        data['fpo'] = fpo.id
        
        serializer = FPOWarehouseSerializer(data=data)
        if serializer.is_valid():
            warehouse = serializer.save()
            return Response(
                response_success(
                    message="Warehouse created successfully",
                    data=serializer.data
                ),
                status=201
            )
        
        return Response(
            response_error(
                message="Invalid data",
                errors=serializer.errors
            ),
            status=400
        )
    
    def put(self, request):
        """Update warehouse"""
        try:
            fpo = FPOProfile.objects.get(user=request.user)
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO profile not found"),
                status=404
            )
        
        warehouse_id = request.data.get('id')
        if not warehouse_id:
            return Response(
                response_error(message="Warehouse ID is required"),
                status=400
            )
        
        try:
            warehouse = FPOWarehouse.objects.get(id=warehouse_id, fpo=fpo, is_active=True)
        except FPOWarehouse.DoesNotExist:
            return Response(
                response_error(message="Warehouse not found"),
                status=404
            )
        
        # Check warehouse code uniqueness if being updated
        warehouse_code = request.data.get('warehouse_code')
        if warehouse_code and warehouse_code != warehouse.warehouse_code:
            if FPOWarehouse.objects.filter(warehouse_code=warehouse_code).exists():
                return Response(
                    response_error(message="Warehouse code already exists"),
                    status=400
                )
        
        serializer = FPOWarehouseSerializer(warehouse, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                response_success(
                    message="Warehouse updated successfully",
                    data=serializer.data
                )
            )
        
        return Response(
            response_error(
                message="Invalid data",
                errors=serializer.errors
            ),
            status=400
        )
    
    def delete(self, request):
        """Delete warehouse (soft delete)"""
        try:
            fpo = FPOProfile.objects.get(user=request.user)
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO profile not found"),
                status=404
            )
        
        warehouse_id = request.query_params.get('id')
        if not warehouse_id:
            return Response(
                response_error(message="Warehouse ID is required"),
                status=400
            )
        
        try:
            warehouse = FPOWarehouse.objects.get(id=warehouse_id, fpo=fpo, is_active=True)
        except FPOWarehouse.DoesNotExist:
            return Response(
                response_error(message="Warehouse not found"),
                status=404
            )
        
        # Check if warehouse has stock
        if warehouse.current_stock_quintals > 0:
            return Response(
                response_error(
                    message=f"Cannot delete warehouse with stock. Current stock: {warehouse.current_stock_quintals} quintals"
                ),
                status=400
            )
        
        # Soft delete
        warehouse.is_active = False
        warehouse.save()
        
        return Response(
            response_success(message="Warehouse deleted successfully")
        )


class FPOAssignWarehouseAPIView(APIView):
    """
    FPO assigns warehouse to member farmer lot
    Creates inventory and stock movement records
    """
    permission_classes = [IsAuthenticated, IsFPO]
    
    def post(self, request):
        """Assign warehouse to lot"""
        from django.utils import timezone
        from apps.warehouses.models import Inventory, StockMovement, Warehouse
        from django.db import transaction
        
        try:
            fpo = FPOProfile.objects.get(user=request.user)
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO profile not found"),
                status=404
            )
        
        lot_id = request.data.get('lot_id')
        warehouse_id = request.data.get('warehouse_id')
        
        if not lot_id or not warehouse_id:
            return Response(
                response_error(message="lot_id and warehouse_id are required"),
                status=400
            )
        
        # Get lot (must belong to this FPO and be managed by FPO)
        try:
            lot = ProcurementLot.objects.get(
                id=lot_id,
                fpo=fpo,
                managed_by_fpo=True,
                is_active=True
            )
        except ProcurementLot.DoesNotExist:
            return Response(
                response_error(message="Lot not found or not managed by this FPO"),
                status=404
            )
        
        # Check if lot already has warehouse assigned
        if lot.warehouse:
            return Response(
                response_error(message=f"Lot already assigned to warehouse: {lot.warehouse.warehouse_name}"),
                status=400
            )
        
        # Get warehouse (must belong to this FPO)
        try:
            warehouse = FPOWarehouse.objects.get(
                id=warehouse_id,
                fpo=fpo,
                is_active=True
            )
        except FPOWarehouse.DoesNotExist:
            return Response(
                response_error(message="Warehouse not found or does not belong to this FPO"),
                status=404
            )
        
        # Validate warehouse has sufficient capacity
        available_capacity = warehouse.get_available_capacity()
        if lot.quantity_quintals > available_capacity:
            return Response(
                response_error(
                    message=f"Insufficient warehouse capacity. Available: {available_capacity} quintals, Required: {lot.quantity_quintals} quintals"
                ),
                status=400
            )
        
        # Assign warehouse and create records in transaction
        try:
            with transaction.atomic():
                # Update lot with warehouse
                lot.warehouse = warehouse
                lot.save(update_fields=['warehouse'])
                
                # Create inventory record
                inventory = Inventory.objects.create(
                    warehouse=warehouse,
                    lot=lot,
                    quantity=lot.quantity_quintals,
                    entry_date=timezone.now().date()
                )
                
                # Create stock movement IN
                # Handle farmer name - could be None for FPO-aggregated lots
                farmer_name = lot.farmer.user.get_full_name() if lot.farmer else 'FPO Aggregated Lot'
                stock_movement = StockMovement.objects.create(
                    warehouse=warehouse,
                    lot=lot,
                    movement_type='in',
                    quantity=lot.quantity_quintals,
                    remarks=f'Received from: {farmer_name} - Lot: {lot.lot_number}'
                )
                
                # Update warehouse current stock
                warehouse.current_stock_quintals += lot.quantity_quintals
                warehouse.save(update_fields=['current_stock_quintals'])
                
                return Response(
                    response_success(
                        message="Warehouse assigned successfully",
                        data={
                            'lot_id': str(lot.id),
                            'lot_number': lot.lot_number,
                            'warehouse_id': str(warehouse.id),
                            'warehouse_name': warehouse.warehouse_name,
                            'inventory_id': str(inventory.id),
                            'stock_movement_id': str(stock_movement.id),
                            'new_warehouse_stock': float(warehouse.current_stock_quintals),
                            'warehouse_utilization': warehouse.get_capacity_utilization_percentage(),
                        }
                    ),
                    status=200
                )
                
        except Exception as e:
            return Response(
                response_error(message=f"Failed to assign warehouse: {str(e)}"),
                status=500
            )


class FPOWarehouseInventoryAPIView(APIView):
    """
    Get detailed warehouse inventory with stock breakdown by crop type
    """
    permission_classes = [IsAuthenticated, IsFPO]
    
    def get(self, request):
        """Get warehouse inventory breakdown"""
        from django.db.models import Sum, Count
        from apps.warehouses.models import StockMovement
        
        try:
            fpo = FPOProfile.objects.get(user=request.user)
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO profile not found"),
                status=404
            )
        
        warehouse_id = request.query_params.get('warehouse_id')
        
        if warehouse_id:
            # Get specific warehouse inventory
            try:
                warehouse = FPOWarehouse.objects.get(id=warehouse_id, fpo=fpo, is_active=True)
            except FPOWarehouse.DoesNotExist:
                return Response(
                    response_error(message="Warehouse not found"),
                    status=404
                )
            
            # Get all lots stored in this warehouse
            lots_in_warehouse = ProcurementLot.objects.filter(
                warehouse=warehouse,
                is_active=True,
                status__in=['available', 'bidding']
            ).select_related('farmer__user', 'fpo')
            
            # Group by crop type
            crop_breakdown = {}
            for lot in lots_in_warehouse:
                crop = lot.crop_type
                if crop not in crop_breakdown:
                    crop_breakdown[crop] = {
                        'crop_type': crop,
                        'total_quantity': 0,
                        'lot_count': 0,
                        'lots': []
                    }
                
                crop_breakdown[crop]['total_quantity'] += float(lot.available_quantity_quintals)
                crop_breakdown[crop]['lot_count'] += 1
                crop_breakdown[crop]['lots'].append({
                    'id': str(lot.id),
                    'lot_number': lot.lot_number,
                    'quantity_quintals': float(lot.available_quantity_quintals),
                    'quality_grade': lot.quality_grade,
                    'listing_type': lot.listing_type,
                    'farmer_name': lot.farmer.user.get_full_name() if lot.farmer else 'N/A',
                    'harvest_date': lot.harvest_date.isoformat() if lot.harvest_date else None,
                    'expected_price_per_quintal': float(lot.expected_price_per_quintal),
                    'status': lot.status,
                })
            
            # Get recent stock movements
            recent_movements = StockMovement.objects.filter(
                warehouse=warehouse
            ).select_related('lot').order_by('-movement_date')[:20]
            
            movements_data = []
            for movement in recent_movements:
                movements_data.append({
                    'id': str(movement.id),
                    'movement_type': movement.movement_type,
                    'quantity': float(movement.quantity),
                    'lot_number': movement.lot.lot_number,
                    'movement_date': movement.movement_date.isoformat(),
                    'remarks': movement.remarks,
                })
            
            return Response(
                response_success(
                    message="Warehouse inventory fetched successfully",
                    data={
                        'warehouse': {
                            'id': str(warehouse.id),
                            'warehouse_name': warehouse.warehouse_name,
                            'warehouse_code': warehouse.warehouse_code,
                            'capacity_quintals': float(warehouse.capacity_quintals),
                            'current_stock_quintals': float(warehouse.current_stock_quintals),
                            'available_capacity': float(warehouse.get_available_capacity()),
                            'utilization_percentage': warehouse.get_capacity_utilization_percentage(),
                        },
                        'crop_breakdown': list(crop_breakdown.values()),
                        'total_lots': lots_in_warehouse.count(),
                        'recent_movements': movements_data,
                    }
                )
            )
        else:
            # Get inventory summary for all warehouses
            warehouses = FPOWarehouse.objects.filter(fpo=fpo, is_active=True)
            
            summary = []
            for warehouse in warehouses:
                lots_in_wh = ProcurementLot.objects.filter(
                    warehouse=warehouse,
                    is_active=True,
                    status__in=['available', 'bidding']
                )
                
                crop_summary = lots_in_wh.values('crop_type').annotate(
                    total_quantity=Sum('available_quantity_quintals'),
                    lot_count=Count('id')
                )
                
                summary.append({
                    'id': str(warehouse.id),
                    'warehouse_name': warehouse.warehouse_name,
                    'warehouse_code': warehouse.warehouse_code,
                    'capacity_quintals': float(warehouse.capacity_quintals),
                    'current_stock_quintals': float(warehouse.current_stock_quintals),
                    'available_capacity': float(warehouse.get_available_capacity()),
                    'utilization_percentage': warehouse.get_capacity_utilization_percentage(),
                    'crop_breakdown': [
                        {
                            'crop_type': item['crop_type'],
                            'total_quantity': float(item['total_quantity'] or 0),
                            'lot_count': item['lot_count']
                        }
                        for item in crop_summary
                    ],
                    'total_lots': lots_in_wh.count(),
                })
            
            return Response(
                response_success(
                    message="Warehouse inventory summary fetched successfully",
                    data=summary
                )
            )


class FPOBidsAPIView(APIView):
    """
    Manage FPO bids - view received bids on FPO lots and manage them
    """
    permission_classes = [IsAuthenticated, IsFPO]
    
    def get(self, request):
        """Get all bids on FPO lots"""
        try:
            fpo = FPOProfile.objects.get(user=request.user)
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO profile not found"),
                status=404
            )
        
        # Get status filter
        status_filter = request.query_params.get('status', 'all')
        
        # Get all lots belonging to this FPO
        fpo_lots = ProcurementLot.objects.filter(fpo=fpo, is_active=True)
        
        # Get bids on these lots
        bids = Bid.objects.filter(
            lot__in=fpo_lots,
            is_active=True
        ).select_related('lot', 'bidder_user').order_by('-created_at')
        
        # Apply status filter
        if status_filter != 'all':
            bids = bids.filter(status=status_filter)
        
        bids_data = []
        for bid in bids:
            # Get bidder profile (processor or FPO)
            bidder_name = "Unknown"
            bidder_phone = ""
            
            if bid.bidder_type == 'processor':
                from apps.processors.models import ProcessorProfile
                try:
                    processor = ProcessorProfile.objects.get(id=bid.bidder_id)
                    bidder_name = processor.company_name
                    bidder_phone = processor.user.phone_number if processor.user else ""
                except ProcessorProfile.DoesNotExist:
                    pass
            elif bid.bidder_type == 'fpo':
                try:
                    bidder_fpo = FPOProfile.objects.get(id=bid.bidder_id)
                    bidder_name = bidder_fpo.organization_name
                    bidder_phone = bidder_fpo.user.phone_number if bidder_fpo.user else ""
                except FPOProfile.DoesNotExist:
                    pass
            
            bids_data.append({
                'id': str(bid.id),
                'lot_number': bid.lot.lot_number,
                'crop': bid.lot.crop_type,
                'quantity': float(bid.quantity_quintals),
                'bid_price': float(bid.offered_price_per_quintal),
                'expected_price': float(bid.lot.expected_price_per_quintal),
                'bidder': bidder_name,
                'bidder_phone': bidder_phone,
                'status': bid.status,
                'created_at': bid.created_at.isoformat(),
                'remarks': bid.message or '',  # Return as 'remarks' for frontend compatibility
            })
        
        return Response(
            response_success(
                message="Bids fetched successfully",
                data={'results': bids_data}
            )
        )
    
    def patch(self, request, bid_id=None):
        """Accept or reject a bid"""
        try:
            fpo = FPOProfile.objects.get(user=request.user)
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO profile not found"),
                status=404
            )
        
        bid_id = request.data.get('bid_id') or bid_id
        action = request.data.get('action')  # 'accept' or 'reject'
        
        if not bid_id or not action:
            return Response(
                response_error(message="bid_id and action are required"),
                status=400
            )
        
        try:
            bid = Bid.objects.get(id=bid_id, lot__fpo=fpo)
        except Bid.DoesNotExist:
            return Response(
                response_error(message="Bid not found"),
                status=404
            )
        
        if action == 'accept':
            # Use the model's accept() method which handles all related updates
            bid.accept(farmer_response="Accepted by FPO")
            return Response(
                response_success(
                    message="Bid accepted successfully. Lot marked as sold and other bids rejected.",
                    data={
                        'bid_id': str(bid.id), 
                        'status': bid.status,
                        'lot_status': bid.lot.status
                    }
                )
            )
        elif action == 'reject':
            # Use the model's reject() method
            bid.reject(farmer_response="Rejected by FPO")
            return Response(
                response_success(
                    message="Bid rejected successfully",
                    data={'bid_id': str(bid.id), 'status': bid.status}
                )
            )
        else:
            return Response(
                response_error(message="Invalid action. Use 'accept' or 'reject'"),
                status=400
            )


class FPOCreateFarmerAPIView(APIView):
    """
    Allow FPO to create farmer accounts for members who cannot self-register
    Creates complete farmer account with user, profile, and membership
    """
    permission_classes = [IsAuthenticated, IsFPO]
    
    def post(self, request):
        """Create a new farmer account and add to FPO membership"""
        try:
            fpo = FPOProfile.objects.get(user=request.user)
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO profile not found"),
                status=404
            )
        
        # Check if FPO is verified
        if not fpo.is_verified:
            return Response(
                response_error(message="Only verified FPOs can create farmer accounts"),
                status=403
            )
        
        # Extract request data
        phone_number = request.data.get('phone_number', '').strip()
        full_name = request.data.get('full_name', '').strip()
        father_name = request.data.get('father_name', '').strip()
        total_land_acres = request.data.get('total_land_acres')
        district = request.data.get('district', '').strip()
        state = request.data.get('state', '').strip()
        pincode = request.data.get('pincode', '').strip()
        village = request.data.get('village', '').strip()
        primary_crops = request.data.get('primary_crops', [])
        
        # Validate required fields
        if not all([phone_number, full_name, total_land_acres, district, state, pincode]):
            return Response(
                response_error(message="Missing required fields: phone_number, full_name, total_land_acres, district, state, pincode"),
                status=400
            )
        
        # Validate phone number format
        if not phone_number.isdigit() or len(phone_number) != 10 or phone_number[0] not in ['6', '7', '8', '9']:
            return Response(
                response_error(message="Invalid phone number. Must be 10 digits starting with 6-9"),
                status=400
            )
        
        # Format phone number
        formatted_phone = f"+91{phone_number}"
        
        # Check if user with this phone already exists
        if User.objects.filter(phone_number=formatted_phone).exists():
            return Response(
                response_error(message="A user with this phone number already exists"),
                status=400
            )
        
        # Validate land acres
        try:
            land_acres = float(total_land_acres)
            if land_acres <= 0:
                raise ValueError()
        except (ValueError, TypeError):
            return Response(
                response_error(message="Total land acres must be a positive number"),
                status=400
            )
        
        try:
            # Create User account
            user = User.objects.create_user(
                phone_number=formatted_phone,
                role='farmer',
                is_active=True,
                is_verified=False  # Requires OTP verification
            )
            
            # Create UserProfile
            UserProfile.objects.create(
                user=user,
                full_name=full_name
            )
            
            # Create FarmerProfile
            farmer_profile = FarmerProfile.objects.create(
                user=user,
                fpo=fpo,
                full_name=full_name,
                father_name=father_name,
                total_land_acres=land_acres,
                district=district,
                state=state,
                pincode=pincode,
                village=village,
                primary_crops=primary_crops if isinstance(primary_crops, list) else [],
                farming_experience_years=0,
                kyc_status='pending'
            )
            
            # Generate membership number
            membership_count = FPOMembership.objects.filter(fpo=fpo).count()
            membership_number = f"{fpo.registration_number[:4]}-MEM-{membership_count + 1:04d}"
            
            # Create FPOMembership
            membership = FPOMembership.objects.create(
                farmer=farmer_profile,
                fpo=fpo,
                membership_number=membership_number,
                joined_date=date.today(),
                is_active=True,
                is_founding_member=False
            )
            
            # Update FPO member counts
            fpo.active_members = FPOMembership.objects.filter(fpo=fpo, is_active=True).count()
            fpo.total_members = fpo.active_members
            fpo.save()
            
            # Generate OTP for phone verification
            otp_code = generate_otp()
            OTPVerification.objects.create(
                user=user,
                phone_number=formatted_phone,
                otp=otp_code,
                purpose='registration',
                expires_at=timezone.now() + timedelta(minutes=10)  # OTP valid for 10 minutes
            )
            
            # TODO: Send SMS with OTP to farmer's phone
            # For now, return OTP in response (remove in production)
            
            return Response(
                response_success(
                    message="Farmer account registered successfully.",
                    data={
                        'farmer_id': str(farmer_profile.id),
                        'membership_id': str(membership.id),
                        'membership_number': membership_number,
                        'phone_number': formatted_phone,
                        'full_name': full_name,
                        'message': 'Farmer registered successfully. Login credentials sent to their phone number.'
                    }
                ),
                status=201
            )
            
        except Exception as e:
            # Rollback if any error occurs
            if 'user' in locals():
                user.delete()
            return Response(
                response_error(message=f"Failed to create farmer account: {str(e)}"),
                status=500
            )


class FPORemoveMemberAPIView(APIView):
    """API endpoint for FPO to remove a member (deactivate membership only)"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, membership_id):
        try:
            user = request.user
            
            # Get FPO profile
            try:
                fpo = FPOProfile.objects.get(user=user)
            except FPOProfile.DoesNotExist:
                return Response(
                    response_error(message="FPO profile not found"),
                    status=404
                )
            
            # Get the membership
            try:
                membership = FPOMembership.objects.get(id=membership_id, fpo=fpo)
            except FPOMembership.DoesNotExist:
                return Response(
                    response_error(message="Membership not found"),
                    status=404
                )
            
            # Deactivate membership (don't delete)
            membership.is_active = False
            membership.save()
            
            # Update FPO active members count
            fpo.active_members = FPOMembership.objects.filter(fpo=fpo, is_active=True).count()
            fpo.save()
            
            return Response(
                response_success(
                    message="Member removed successfully",
                    data={
                        'membership_id': str(membership.id),
                        'farmer_name': membership.farmer.full_name
                    }
                ),
                status=200
            )
            
        except Exception as e:
            return Response(
                response_error(message=f"Failed to remove member: {str(e)}"),
                status=500
            )


class FPOCreateFarmerLotAPIView(APIView):
    """
    FPO creates a lot on behalf of a farmer member
    Allows FPO to list produce for farmers who are their members
    """
    permission_classes = [IsAuthenticated, IsFPO]
    
    def post(self, request):
        try:
            fpo = request.user.fpo_profile
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO profile not found"),
                status=404
            )
        
        # Get farmer by phone number or membership ID
        farmer_phone = request.data.get('farmer_phone_number')
        farmer_id = request.data.get('farmer_id')
        
        if not farmer_phone and not farmer_id:
            return Response(
                response_error(message="Either farmer_phone_number or farmer_id is required"),
                status=400
            )
        
        # Find farmer
        try:
            if farmer_id:
                farmer = FarmerProfile.objects.get(id=farmer_id)
            else:
                # Format phone number
                if not farmer_phone.startswith('+91'):
                    farmer_phone = f'+91{farmer_phone}'
                user = User.objects.get(phone_number=farmer_phone, role='farmer')
                farmer = user.farmer_profile
        except (User.DoesNotExist, FarmerProfile.DoesNotExist):
            return Response(
                response_error(message="Farmer not found"),
                status=404
            )
        
        # Verify farmer is a member of this FPO
        membership = FPOMembership.objects.filter(
            fpo=fpo,
            farmer=farmer,
            is_active=True
        ).first()
        
        if not membership:
            return Response(
                response_error(message="Farmer is not a member of your FPO"),
                status=403
            )
        
        # Create the lot
        from apps.lots.models import ProcurementLot
        from apps.core.utils import generate_unique_code
        
        lot_data = {
            'farmer': farmer,
            'fpo': fpo,
            'managed_by_fpo': True,
            'listing_type': 'fpo_managed',
            'crop_type': request.data.get('crop_type'),
            'crop_variety': request.data.get('crop_variety', ''),
            'quantity_quintals': request.data.get('quantity_quintals'),
            'available_quantity_quintals': request.data.get('quantity_quintals'),
            'expected_price_per_quintal': request.data.get('expected_price_per_quintal'),
            'harvest_date': request.data.get('harvest_date'),
            'quality_grade': request.data.get('quality_grade'),
            'moisture_content': request.data.get('moisture_content'),
            'oil_content': request.data.get('oil_content'),
            'description': request.data.get('description', ''),
            'status': 'available',
        }
        
        # Optional fields
        if request.data.get('crop_master_code'):
            lot_data['crop_master_code'] = request.data.get('crop_master_code')
        if request.data.get('crop_variety_code'):
            lot_data['crop_variety_code'] = request.data.get('crop_variety_code')
        if request.data.get('location_latitude'):
            lot_data['location_latitude'] = request.data.get('location_latitude')
        if request.data.get('location_longitude'):
            lot_data['location_longitude'] = request.data.get('location_longitude')
        
        # Assign warehouse if provided
        warehouse_id = request.data.get('warehouse_id')
        if warehouse_id:
            try:
                warehouse = FPOWarehouse.objects.get(id=warehouse_id, fpo=fpo)
                lot_data['warehouse'] = warehouse
            except FPOWarehouse.DoesNotExist:
                return Response(
                    response_error(message="Warehouse not found or not owned by your FPO"),
                    status=404
                )
        
        try:
            lot = ProcurementLot.objects.create(**lot_data)
            
            # Create inventory and stock movement if warehouse is assigned
            if warehouse_id:
                from apps.warehouses.models import Inventory, StockMovement
                
                # Update or create inventory
                inventory, created = Inventory.objects.get_or_create(
                    warehouse=warehouse,
                    crop_type=lot.crop_type,
                    crop_variety=lot.crop_variety or 'General',
                    quality_grade=lot.quality_grade or 'A',
                    defaults={
                        'quantity_quintals': lot.quantity_quintals,
                        'last_updated': timezone.now()
                    }
                )
                
                if not created:
                    inventory.quantity_quintals += lot.quantity_quintals
                    inventory.last_updated = timezone.now()
                    inventory.save()
                
                # Create stock movement record
                StockMovement.objects.create(
                    warehouse=warehouse,
                    lot=lot,
                    movement_type='inward',
                    quantity_quintals=lot.quantity_quintals,
                    reference_number=f'FPO-LOT-{lot.lot_number}',
                    notes=f'FPO created lot on behalf of farmer {farmer.full_name}'
                )
                
                # Update warehouse stock
                warehouse.current_stock_quintals += lot.quantity_quintals
                warehouse.save()
            
            from apps.lots.serializers import ProcurementLotSerializer
            serializer = ProcurementLotSerializer(lot)
            
            return Response(
                response_success(
                    message="Lot created successfully on behalf of farmer",
                    data=serializer.data
                ),
                status=201
            )
        except Exception as e:
            return Response(
                response_error(message=f"Failed to create lot: {str(e)}"),
                status=400
            )


class FPOCreateAggregatedLotAPIView(APIView):
    """
    Create FPO aggregated bulk lot by merging member lots
    Supports multi-warehouse aggregation with stock movement tracking
    """
    permission_classes = [IsAuthenticated, IsFPO]
    
    def post(self, request):
        """Create aggregated bulk lot from member lots with warehouse management"""
        from django.utils import timezone
        from apps.warehouses.models import Inventory, StockMovement
        from django.db import transaction
        
        try:
            fpo = FPOProfile.objects.get(user=request.user)
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO profile not found"),
                status=404
            )
        
        # Get request data
        parent_lot_ids = request.data.get('parent_lot_ids', [])
        crop_type = request.data.get('crop_type')
        quality_grade = request.data.get('quality_grade')
        expected_price_per_quintal = request.data.get('expected_price_per_quintal')
        description = request.data.get('description', '')
        # Note: No target warehouse needed - aggregated lots are marketplace listings, not physical storage
        
        # Validation
        if not parent_lot_ids or len(parent_lot_ids) == 0:
            return Response(
                response_error(message="At least one parent lot is required"),
                status=400
            )
        
        if not crop_type:
            return Response(
                response_error(message="Crop type is required"),
                status=400
            )
        
        if not quality_grade:
            return Response(
                response_error(message="Quality grade is required"),
                status=400
            )
        
        if not expected_price_per_quintal:
            return Response(
                response_error(message="Expected price per quintal is required"),
                status=400
            )
        
        # Get parent lots (must be from FPO members and managed by this FPO)
        parent_lots = ProcurementLot.objects.filter(
            id__in=parent_lot_ids,
            fpo=fpo,
            managed_by_fpo=True,
            is_active=True,
            status='available'
        ).select_related('warehouse').prefetch_related('source_warehouses')
        
        if parent_lots.count() != len(parent_lot_ids):
            # Debug: Find which lots are missing/invalid
            found_ids = list(parent_lots.values_list('id', flat=True))
            missing_ids = [str(lot_id) for lot_id in parent_lot_ids if lot_id not in found_ids]
            
            # Check what's wrong with missing lots
            all_lots = ProcurementLot.objects.filter(id__in=parent_lot_ids)
            invalid_reasons = []
            for lot in all_lots:
                if lot.id not in found_ids:
                    reasons = []
                    if lot.fpo != fpo:
                        reasons.append(f"belongs to different FPO")
                    if not lot.managed_by_fpo:
                        reasons.append(f"not managed by FPO (managed_by_fpo={lot.managed_by_fpo})")
                    if not lot.is_active:
                        reasons.append(f"not active")
                    if lot.status != 'available':
                        reasons.append(f"status is '{lot.status}' not 'available'")
                    invalid_reasons.append(f"Lot {lot.lot_number}: {', '.join(reasons)}")
            
            error_detail = ". ".join(invalid_reasons) if invalid_reasons else "Unknown reason"
            return Response(
                response_error(
                    message=f"Some parent lots are invalid or not available. {error_detail}"
                ),
                status=400
            )
        
        # Verify all parent lots have the same crop type
        if not all(lot.crop_type == crop_type for lot in parent_lots):
            return Response(
                response_error(message="All parent lots must have the same crop type"),
                status=400
            )
        
        # VALIDATION: All parent lots MUST have warehouses assigned
        lots_without_warehouse = [lot for lot in parent_lots if not lot.warehouse]
        if lots_without_warehouse:
            lot_numbers = ', '.join([lot.lot_number for lot in lots_without_warehouse])
            return Response(
                response_error(
                    message=f"Aggregation requires all lots to be stored in warehouses first. "
                            f"Please assign warehouses to these lots: {lot_numbers}"
                ),
                status=400
            )
        
        # No need to get target warehouse - aggregated lots are marketplace listings, not stored
        
        # Calculate total quantity
        total_quantity = sum(lot.available_quantity_quintals for lot in parent_lots)
        
        # No warehouse capacity check needed - aggregated lots are marketplace listings, not stored
        
        # Collect source warehouses (multi-warehouse aggregation)
        source_warehouses = set()
        for lot in parent_lots:
            if lot.warehouse:
                source_warehouses.add(lot.warehouse)
        
        # No need for first_farmer reference - FPO owns the aggregated lot
        
        # Use database transaction for atomicity
        try:
            with transaction.atomic():
                # Create aggregated lot (FPO-owned marketplace listing)
                aggregated_lot = ProcurementLot.objects.create(
                    farmer=None,  # FPO-owned lot, not individual farmer
                    fpo=fpo,
                    managed_by_fpo=True,
                    listing_type='fpo_aggregated',
                    crop_type=crop_type,
                    quality_grade=quality_grade,
                    quantity_quintals=total_quantity,
                    available_quantity_quintals=total_quantity,
                    expected_price_per_quintal=expected_price_per_quintal,
                    harvest_date=parent_lots.first().harvest_date,
                    description=description or f"FPO Aggregated Bulk Lot from {parent_lots.count()} member lots",
                    status='available',  # Available in marketplace
                    warehouse=None  # Marketplace listing, not warehouse storage
                )
                
                # Link parent lots
                aggregated_lot.parent_lots.set(parent_lots)
                
                # Link source warehouses (multi-warehouse tracking)
                if source_warehouses:
                    aggregated_lot.source_warehouses.set(source_warehouses)
                
                # Process stock movements from source warehouses
                for lot in parent_lots:
                    if lot.warehouse:
                        # Create stock movement OUT from source warehouse
                        StockMovement.objects.create(
                            warehouse=lot.warehouse,
                            lot=lot,
                            movement_type='out',
                            quantity=lot.available_quantity_quintals,
                            movement_date=timezone.now().date(),
                            remarks=f'Aggregated into bulk lot {aggregated_lot.lot_number}'
                        )
                        
                        # Update source warehouse stock
                        lot.warehouse.current_stock_quintals -= lot.available_quantity_quintals
                        lot.warehouse.save(update_fields=['current_stock_quintals'])
                
                # Note: No stock IN to target warehouse - aggregated lot is a marketplace listing
                # Stock has been deducted from source warehouses above and is now allocated to this listing
                # When sold, stock will be shipped directly from available FPO stock
                
                # Update parent lots status to 'aggregated'
                parent_lots.update(status='aggregated')
                
                return Response(
                    response_success(
                        message=f"Aggregated bulk lot created successfully. {total_quantity} quintals deducted from source warehouses and listed in marketplace.",
                        data={
                            'id': str(aggregated_lot.id),
                            'lot_number': aggregated_lot.lot_number,
                            'crop_type': aggregated_lot.crop_type,
                            'quantity_quintals': float(aggregated_lot.quantity_quintals),
                            'quality_grade': aggregated_lot.quality_grade,
                            'expected_price_per_quintal': float(aggregated_lot.expected_price_per_quintal),
                            'parent_lots_count': parent_lots.count(),
                            'listing_type': aggregated_lot.listing_type,
                            'warehouse_id': None,  # Marketplace listing, not stored
                            'warehouse_name': None,  # Marketplace listing, not stored
                            'source_warehouses_count': len(source_warehouses),
                            'source_warehouse_names': [wh.warehouse_name for wh in source_warehouses]
                        }
                    ),
                    status=201
                )
        
        except Exception as e:
            return Response(
                response_error(message=f"Failed to create aggregated lot: {str(e)}"),
                status=500
            )


class FPOPaymentAPIView(APIView):
    """
    FPO Payment Management
    Create and manage payments from FPO to farmers
    """
    permission_classes = [IsAuthenticated, IsFPO]
    
    def post(self, request):
        """Create payment from FPO to farmer(s)"""
        from apps.payments.models import Payment
        from apps.farmers.models import FarmerProfile
        from decimal import Decimal
        
        try:
            fpo = FPOProfile.objects.get(user=request.user)
            farmer_id = request.data.get('farmer_id')
            amount = Decimal(str(request.data.get('amount', 0)))
            lot_id = request.data.get('lot_id')  # Optional
            notes = request.data.get('notes', '')
            payment_method = request.data.get('payment_method', 'wallet')
            
            # Validate amount
            if amount <= 0:
                return Response(
                    response_error(message="Amount must be greater than 0"),
                    status=400
                )
            
            # Get farmer
            try:
                farmer = FarmerProfile.objects.select_related('user').get(id=farmer_id)
            except FarmerProfile.DoesNotExist:
                return Response(
                    response_error(message="Farmer not found"),
                    status=404
                )
            
            # Check if farmer is FPO member (optional but recommended)
            membership = FPOMembership.objects.filter(
                fpo=fpo,
                farmer=farmer,
                is_active=True
            ).first()
            
            if not membership:
                return Response(
                    response_error(message="Farmer is not a member of this FPO"),
                    status=400
                )
            
            # Get lot reference if provided
            lot = None
            if lot_id:
                from apps.lots.models import ProcurementLot
                try:
                    lot = ProcurementLot.objects.get(id=lot_id, fpo=fpo)
                except ProcurementLot.DoesNotExist:
                    return Response(
                        response_error(message="Lot not found or not managed by this FPO"),
                        status=404
                    )
            
            # Create payment record
            payment = Payment.objects.create(
                lot=lot,
                bid=None,  # Direct payment, not from bid
                payer_id=fpo.id,
                payer_name=fpo.organization_name,
                payer_type='fpo',
                payee_id=farmer.id,
                payee_name=farmer.full_name,
                payee_account_number=farmer.bank_account_number or '',
                payee_ifsc_code=farmer.ifsc_code or '',
                gross_amount=amount,
                commission_amount=Decimal('0'),  # No commission on FPO-to-farmer payments
                commission_percentage=Decimal('0'),
                tax_amount=Decimal('0'),
                payment_method=payment_method,
                status='pending',
                notes=notes or f'Direct payment from FPO {fpo.organization_name} to farmer {farmer.full_name}'
            )
            
            return Response(
                response_success(
                    message="Payment created successfully",
                    data={
                        'payment_id': payment.payment_id,
                        'id': str(payment.id),
                        'amount': float(amount),
                        'payee_name': farmer.full_name,
                        'status': 'pending'
                    }
                ),
                status=201
            )
            
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO profile not found"),
                status=404
            )
        except Exception as e:
            return Response(
                response_error(message=f"Failed to create payment: {str(e)}"),
                status=500
            )
