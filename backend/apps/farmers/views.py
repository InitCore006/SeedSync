"""
Views for Farmers App
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import FarmerProfile, FarmLand, CropPlanning
from .serializers import (
    FarmerProfileSerializer, FarmerProfileCreateSerializer,
    FarmerProfileUpdateSerializer, FarmLandSerializer,
    FarmLandCreateSerializer, CropPlanningSerializer,
    CropPlanningCreateSerializer
)
from apps.core.permissions import IsFarmer, IsOwner
from apps.core.utils import response_success, response_error, calculate_distance
from apps.fpos.models import FPOProfile
from math import radians, sin, cos, sqrt, atan2


class FarmerProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for farmer profiles
    """
    queryset = FarmerProfile.objects.select_related('user', 'fpo').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return FarmerProfileCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return FarmerProfileUpdateSerializer
        return FarmerProfileSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by district
        district = self.request.query_params.get('district')
        if district:
            queryset = queryset.filter(district__iexact=district)
        
        # Filter by state
        state = self.request.query_params.get('state')
        if state:
            queryset = queryset.filter(state=state)
        
        # Filter by FPO
        fpo_id = self.request.query_params.get('fpo_id')
        if fpo_id:
            queryset = queryset.filter(fpo_id=fpo_id)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(
                response_success(
                    message="Farmer profile created successfully",
                    data=FarmerProfileSerializer(serializer.instance).data
                ),
                status=status.HTTP_201_CREATED
            )
        return Response(
            response_error(message="Profile creation failed", errors=serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current user's farmer profile"""
        try:
            profile = FarmerProfile.objects.select_related('user', 'fpo').get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(
                response_success(
                    message="Profile retrieved successfully",
                    data=serializer.data
                )
            )
        except FarmerProfile.DoesNotExist:
            return Response(
                response_error(message="Farmer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get farmer statistics"""
        profile = self.get_object()
        
        stats_data = {
            'total_lots': profile.total_lots_created,
            'total_sold_quintals': float(profile.total_quantity_sold_quintals),
            'total_earnings': float(profile.total_earnings),
            'total_farmland_acres': float(profile.total_land_acres),
            'farmland_count': profile.farm_lands.count(),
            'active_crops': profile.crop_plans.filter(status__in=['sowed', 'growing']).count()
        }
        
        return Response(
            response_success(
                message="Statistics retrieved successfully",
                data=stats_data
            )
        )


class FarmLandViewSet(viewsets.ModelViewSet):
    """
    ViewSet for farm lands
    """
    queryset = FarmLand.objects.select_related('farmer').all()
    permission_classes = [IsAuthenticated, IsFarmer]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return FarmLandCreateSerializer
        return FarmLandSerializer
    
    def get_queryset(self):
        # Farmers see only their own farm lands
        if hasattr(self.request.user, 'farmer_profile'):
            return self.queryset.filter(farmer=self.request.user.farmer_profile)
        return self.queryset.none()
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(farmer=request.user.farmer_profile)
            return Response(
                response_success(
                    message="Farm land added successfully",
                    data=FarmLandSerializer(serializer.instance).data
                ),
                status=status.HTTP_201_CREATED
            )
        return Response(
            response_error(message="Failed to add farm land", errors=serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )


class CropPlanningViewSet(viewsets.ModelViewSet):
    """
    ViewSet for crop planning
    """
    queryset = CropPlanning.objects.select_related('farmer', 'farm_land').all()
    permission_classes = [IsAuthenticated, IsFarmer]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CropPlanningCreateSerializer
        return CropPlanningSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Farmers see only their own crop plans
        if hasattr(self.request.user, 'farmer_profile'):
            queryset = queryset.filter(farmer=self.request.user.farmer_profile)
        
        # Filter by season
        season = self.request.query_params.get('season')
        if season:
            queryset = queryset.filter(season=season)
        
        # Filter by crop type
        crop_type = self.request.query_params.get('crop_type')
        if crop_type:
            queryset = queryset.filter(crop_type=crop_type)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(farmer=request.user.farmer_profile)
            return Response(
                response_success(
                    message="Crop plan created successfully",
                    data=CropPlanningSerializer(serializer.instance).data
                ),
                status=status.HTTP_201_CREATED
            )
        return Response(
            response_error(message="Failed to create crop plan", errors=serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )


class NearbyFPOAPIView(generics.ListAPIView):
    """
    Get nearby FPOs based on farmer's location
    """
    serializer_class = 'apps.fpos.serializers.FPOProfileSerializer'  # Will be imported later
    permission_classes = [IsAuthenticated, IsFarmer]
    
    def get_queryset(self):
        from apps.fpos.models import FPOProfile
        
        farmer = self.request.user.farmer_profile
        if not farmer.latitude or not farmer.longitude:
            return FPOProfile.objects.none()
        
        # Get all FPOs with location
        fpos = FPOProfile.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False,
            is_verified=True
        )
        
        # Calculate distance for each FPO
        fpo_list = []
        for fpo in fpos:
            distance = calculate_distance(
                farmer.latitude, farmer.longitude,
                fpo.latitude, fpo.longitude
            )
            if distance <= 100:  # Within 100 km
                fpo.distance = distance
                fpo_list.append(fpo)
        
        # Sort by distance
        fpo_list.sort(key=lambda x: x.distance)
        
        return fpo_list[:10]  # Return top 10 nearest
