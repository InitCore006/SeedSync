"""
FPO Views - Complete Implementation
Handles FPO profile, dashboard, members, procurement, and warehouses
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.utils import response_success, response_error
from apps.core.permissions import IsFPO
from .models import FPOProfile, FPOMembership, FPOWarehouse
from .serializers import FPOProfileSerializer, FPOMembershipSerializer, FPOWarehouseSerializer
from apps.lots.models import ProcurementLot
from apps.farmers.models import FarmerProfile
from apps.bids.models import Bid


class FPOProfileAPIView(APIView):
    """
    Get or update FPO profile
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
                'share_capital': float(membership.share_capital),
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
        
        farmer_id = request.data.get('farmer_id')
        share_capital = float(request.data.get('share_capital', 0))
        
        try:
            farmer = FarmerProfile.objects.get(id=farmer_id)
        except FarmerProfile.DoesNotExist:
            return Response(
                response_error(message="Farmer not found"),
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
            share_capital=share_capital,
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
        crop_type = request.query_params.get('crop_type')
        quality_grade = request.query_params.get('quality_grade')
        max_price = request.query_params.get('max_price')
        
        # Available lots (not yet procured or fully sold)
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
        
        # Prioritize FPO member lots
        lots = lots.order_by(
            '-farmer__fpo_id',
            'expected_price_per_quintal'
        )
        
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


class FPOWarehousesAPIView(APIView):
    """
    Get FPO warehouses
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
        
        warehouses = FPOWarehouse.objects.filter(fpo=fpo, is_active=True)
        serializer = FPOWarehouseSerializer(warehouses, many=True)
        
        return Response(
            response_success(
                message="Warehouses fetched successfully",
                data=serializer.data
            )
        )
