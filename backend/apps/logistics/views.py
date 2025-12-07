"""Logistics Views"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import LogisticsPartner, Vehicle, Shipment
from .serializers import (
    LogisticsPartnerSerializer, LogisticsPartnerCreateSerializer,
    LogisticsPartnerUpdateSerializer, VehicleSerializer,
    VehicleCreateSerializer, ShipmentSerializer, ShipmentCreateSerializer
)
from apps.core.utils import response_success, response_error
from apps.core.permissions import IsOwner


class LogisticsPartnerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for logistics partner profiles
    """
    queryset = LogisticsPartner.objects.select_related('user').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return LogisticsPartnerCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return LogisticsPartnerUpdateSerializer
        return LogisticsPartnerSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by state
        state = self.request.query_params.get('state')
        if state:
            queryset = queryset.filter(state=state)
        
        # Filter by city
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__iexact=city)
        
        # Filter by verified status
        is_verified = self.request.query_params.get('is_verified')
        if is_verified is not None:
            queryset = queryset.filter(is_verified=is_verified.lower() == 'true')
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(
                response_success(
                    message="Logistics partner profile created successfully",
                    data=LogisticsPartnerSerializer(serializer.instance).data
                ),
                status=status.HTTP_201_CREATED
            )
        return Response(
            response_error(message="Profile creation failed", errors=serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current user's logistics partner profile"""
        try:
            profile = LogisticsPartner.objects.select_related('user').prefetch_related('vehicles').get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(
                response_success(
                    message="Profile retrieved successfully",
                    data=serializer.data
                )
            )
        except LogisticsPartner.DoesNotExist:
            return Response(
                response_error(message="Logistics partner profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get logistics partner statistics"""
        partner = self.get_object()
        
        stats_data = {
            'total_vehicles': partner.vehicles.count(),
            'total_shipments': partner.shipments.count(),
            'active_shipments': partner.shipments.filter(status='in_transit').count(),
            'completed_shipments': partner.shipments.filter(status='delivered').count(),
            'is_verified': partner.is_verified,
        }
        
        return Response(
            response_success(
                message="Statistics retrieved successfully",
                data=stats_data
            )
        )
    
    @action(detail=False, methods=['get'])
    def my_stats(self, request):
        """Get current user's logistics partner statistics"""
        try:
            partner = LogisticsPartner.objects.select_related('user').get(user=request.user)
            
            stats_data = {
                'total_vehicles': partner.vehicles.count(),
                'total_shipments': partner.shipments.count(),
                'active_shipments': partner.shipments.filter(status='in_transit').count(),
                'completed_shipments': partner.shipments.filter(status='delivered').count(),
                'is_verified': partner.is_verified,
            }
            
            return Response(
                response_success(
                    message="Statistics retrieved successfully",
                    data=stats_data
                )
            )
        except LogisticsPartner.DoesNotExist:
            return Response(
                response_error(message="Logistics partner profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )


class VehicleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for vehicles
    """
    queryset = Vehicle.objects.select_related('logistics_partner').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return VehicleCreateSerializer
        return VehicleSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Logistics partners see only their own vehicles
        if hasattr(self.request.user, 'logistics_profile'):
            queryset = queryset.filter(logistics_partner=self.request.user.logistics_profile)
        
        # Filter by vehicle type
        vehicle_type = self.request.query_params.get('vehicle_type')
        if vehicle_type:
            queryset = queryset.filter(vehicle_type=vehicle_type)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        # Check if user has logistics profile
        if not hasattr(request.user, 'logistics_profile'):
            return Response(
                response_error(message="Logistics partner profile required"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(logistics_partner=request.user.logistics_profile)
            return Response(
                response_success(
                    message="Vehicle added successfully",
                    data=VehicleSerializer(serializer.instance).data
                ),
                status=status.HTTP_201_CREATED
            )
        return Response(
            response_error(message="Failed to add vehicle", errors=serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )


class ShipmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for shipments
    """
    queryset = Shipment.objects.select_related(
        'logistics_partner', 'lot', 'vehicle'
    ).all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ShipmentCreateSerializer
        return ShipmentSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Logistics partners see only their own shipments
        if hasattr(self.request.user, 'logistics_profile'):
            queryset = queryset.filter(logistics_partner=self.request.user.logistics_profile)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by lot
        lot_id = self.request.query_params.get('lot_id')
        if lot_id:
            queryset = queryset.filter(lot_id=lot_id)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        # Check if user has logistics profile
        if not hasattr(request.user, 'logistics_profile'):
            return Response(
                response_error(message="Logistics partner profile required"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(logistics_partner=request.user.logistics_profile)
            return Response(
                response_success(
                    message="Shipment created successfully",
                    data=ShipmentSerializer(serializer.instance).data
                ),
                status=status.HTTP_201_CREATED
            )
        return Response(
            response_error(message="Failed to create shipment", errors=serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update shipment status"""
        shipment = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                response_error(message="Status is required"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_statuses = ['pending', 'in_transit', 'delivered', 'cancelled']
        if new_status not in valid_statuses:
            return Response(
                response_error(message=f"Invalid status. Valid options: {', '.join(valid_statuses)}"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        shipment.status = new_status
        shipment.save()
        
        return Response(
            response_success(
                message="Shipment status updated successfully",
                data=ShipmentSerializer(shipment).data
            )
        )
