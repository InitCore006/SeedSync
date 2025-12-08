"""Retailers Views"""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, Q, F
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from apps.core.utils import response_success, response_error
from apps.core.permissions import IsRetailer
from .models import RetailerProfile, Store, RetailerOrder, OrderItem, RetailerInventory
from .serializers import (
    RetailerProfileSerializer, 
    StoreSerializer,
    RetailerOrderSerializer,
    RetailerOrderCreateSerializer,
    RetailerInventorySerializer,
    RetailerDashboardSerializer
)
from apps.processors.models import ProcessedProduct

class RetailerProfileViewSet(viewsets.ModelViewSet):
    queryset = RetailerProfile.objects.filter(is_active=True)
    serializer_class = RetailerProfileSerializer
    permission_classes = [IsAuthenticated]

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.filter(is_active=True)
    serializer_class = StoreSerializer
    permission_classes = [IsAuthenticated]


class RetailerDashboardAPIView(APIView):
    """
    Retailer dashboard with stats and recent data
    GET /api/retailers/dashboard/
    """
    permission_classes = [IsAuthenticated, IsRetailer]
    
    def get(self, request):
        """Get retailer dashboard stats"""
        try:
            retailer = RetailerProfile.objects.get(user=request.user)
        except RetailerProfile.DoesNotExist:
            return Response(
                response_error(message="Retailer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Order statistics
        orders = RetailerOrder.objects.filter(retailer=retailer)
        total_orders = orders.count()
        pending_orders = orders.filter(status__in=['pending', 'processing']).count()
        completed_orders = orders.filter(status='delivered').count()
        cancelled_orders = orders.filter(status='cancelled').count()
        
        # Revenue statistics
        completed_order_stats = orders.filter(status='delivered').aggregate(
            total_revenue=Sum('total_amount'),
            avg_order_value=Avg('total_amount')
        )
        
        total_revenue = completed_order_stats['total_revenue'] or Decimal('0')
        avg_order_value = completed_order_stats['avg_order_value'] or Decimal('0')
        
        # Supplier statistics
        active_suppliers = orders.values('processor').distinct().count()
        
        # Inventory statistics
        inventory = RetailerInventory.objects.filter(retailer=retailer)
        inventory_items = inventory.count()
        low_stock_items = inventory.filter(
            current_stock_liters__lte=F('reorder_point')
        ).count()
        
        # Recent orders
        recent_orders = orders.order_by('-order_date')[:5]
        recent_orders_serializer = RetailerOrderSerializer(recent_orders, many=True)
        
        # Low stock alerts
        low_stock_alerts = inventory.filter(
            current_stock_liters__lte=F('reorder_point')
        ).order_by('current_stock_liters')[:5]
        low_stock_serializer = RetailerInventorySerializer(low_stock_alerts, many=True)
        
        # Compile dashboard data
        dashboard_data = {
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'completed_orders': completed_orders,
            'cancelled_orders': cancelled_orders,
            'total_revenue': total_revenue,
            'avg_order_value': avg_order_value,
            'active_suppliers': active_suppliers,
            'inventory_items': inventory_items,
            'low_stock_items': low_stock_items,
            'recent_orders': recent_orders_serializer.data,
            'low_stock_alerts': low_stock_serializer.data,
        }
        
        return Response(
            response_success(
                message="Dashboard data fetched successfully",
                data=dashboard_data
            )
        )


class RetailerOrderListCreateAPIView(APIView):
    """
    List and create retailer orders
    GET /api/retailers/orders/
    POST /api/retailers/orders/
    """
    permission_classes = [IsAuthenticated, IsRetailer]
    
    def get(self, request):
        """List retailer orders"""
        try:
            retailer = RetailerProfile.objects.get(user=request.user)
        except RetailerProfile.DoesNotExist:
            return Response(
                response_error(message="Retailer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        orders = RetailerOrder.objects.filter(
            retailer=retailer
        ).select_related('processor').prefetch_related('items').order_by('-order_date')
        
        # Filters
        status_filter = request.query_params.get('status')
        if status_filter:
            orders = orders.filter(status=status_filter)
        
        serializer = RetailerOrderSerializer(orders, many=True)
        
        return Response(
            response_success(
                message="Orders fetched successfully",
                data=serializer.data
            )
        )
    
    def post(self, request):
        """Create new order"""
        try:
            retailer = RetailerProfile.objects.get(user=request.user)
        except RetailerProfile.DoesNotExist:
            return Response(
                response_error(message="Retailer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = RetailerOrderCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            order = serializer.save()
            response_serializer = RetailerOrderSerializer(order)
            return Response(
                response_success(
                    message="Order created successfully",
                    data=response_serializer.data
                ),
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            response_error(
                message="Failed to create order",
                errors=serializer.errors
            ),
            status=status.HTTP_400_BAD_REQUEST
        )


class RetailerOrderDetailAPIView(APIView):
    """
    Get specific order details
    GET /api/retailers/orders/<id>/
    """
    permission_classes = [IsAuthenticated, IsRetailer]
    
    def get(self, request, pk):
        """Get order details"""
        try:
            retailer = RetailerProfile.objects.get(user=request.user)
        except RetailerProfile.DoesNotExist:
            return Response(
                response_error(message="Retailer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            order = RetailerOrder.objects.get(pk=pk, retailer=retailer)
        except RetailerOrder.DoesNotExist:
            return Response(
                response_error(message="Order not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = RetailerOrderSerializer(order)
        return Response(
            response_success(
                message="Order fetched successfully",
                data=serializer.data
            )
        )


class RetailerInventoryAPIView(APIView):
    """
    Get retailer inventory
    GET /api/retailers/inventory/
    """
    permission_classes = [IsAuthenticated, IsRetailer]
    
    def get(self, request):
        """Get retailer inventory"""
        try:
            retailer = RetailerProfile.objects.get(user=request.user)
        except RetailerProfile.DoesNotExist:
            return Response(
                response_error(message="Retailer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        inventory = RetailerInventory.objects.filter(
            retailer=retailer
        ).select_related('product').order_by('-last_restocked')
        
        # Filters
        stock_status = request.query_params.get('stock_status')
        if stock_status:
            if stock_status == 'low_stock':
                inventory = inventory.filter(
                    current_stock_liters__lte=F('min_stock_level')
                )
            elif stock_status == 'out_of_stock':
                inventory = inventory.filter(current_stock_liters=0)
        
        serializer = RetailerInventorySerializer(inventory, many=True)
        
        return Response(
            response_success(
                message="Inventory fetched successfully",
                data=serializer.data
            )
        )


class RetailerSuppliersAPIView(APIView):
    """
    Get retailer suppliers (processors they've ordered from)
    GET /api/retailers/suppliers/
    """
    permission_classes = [IsAuthenticated, IsRetailer]
    
    def get(self, request):
        """Get list of suppliers"""
        try:
            retailer = RetailerProfile.objects.get(user=request.user)
        except RetailerProfile.DoesNotExist:
            return Response(
                response_error(message="Retailer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get processors this retailer has ordered from
        orders = RetailerOrder.objects.filter(retailer=retailer)
        
        # Get unique processors with order statistics
        from apps.processors.models import ProcessorProfile
        from apps.processors.serializers import ProcessorProfileSerializer
        
        processor_ids = orders.values_list('processor_id', flat=True).distinct()
        processors = ProcessorProfile.objects.filter(id__in=processor_ids)
        
        # Add order statistics for each processor
        suppliers_data = []
        for processor in processors:
            processor_orders = orders.filter(processor=processor)
            
            suppliers_data.append({
                'id': str(processor.id),
                'company_name': processor.company_name,
                'contact_person': processor.contact_person,
                'phone': processor.phone,
                'email': processor.email,
                'city': processor.city,
                'state': processor.state,
                'is_verified': processor.is_verified,
                'total_orders': processor_orders.count(),
                'completed_orders': processor_orders.filter(status='delivered').count(),
                'total_spent': processor_orders.filter(
                    status='delivered'
                ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0'),
                'last_order_date': processor_orders.order_by('-order_date').first().order_date if processor_orders.exists() else None,
            })
        
        return Response(
            response_success(
                message="Suppliers fetched successfully",
                data=suppliers_data
            )
        )

