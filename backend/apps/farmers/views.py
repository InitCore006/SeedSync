"""
Views for Farmers App
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import FarmerProfile, FarmLand, CropPlanning, CropPlan
from .serializers import (
    FarmerProfileSerializer, FarmerProfileCreateSerializer,
    FarmerProfileUpdateSerializer, FarmLandSerializer,
    FarmLandCreateSerializer, CropPlanningSerializer,
    CropPlanningCreateSerializer, CropPlanSerializer,
    CropPlanCreateSerializer, CropPlanUpdateSerializer
)
from apps.core.permissions import IsFarmer, IsOwner
from apps.core.utils import response_success, response_error, calculate_distance
from apps.fpos.models import FPOProfile
from apps.crops.models import MandiPrice, MSPRecord
from apps.core.constants import OILSEED_CHOICES
from django.utils import timezone
from datetime import timedelta
from math import radians, sin, cos, sqrt, atan2
import requests


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
        
        # Calculate additional stats
        from apps.lots.models import ProcurementLot
        from apps.bids.models import Bid
        
        active_lots = ProcurementLot.objects.filter(
            farmer=profile,
            status__in=['open', 'bidding_closed']
        ).count()
        
        pending_bids = Bid.objects.filter(
            lot__farmer=profile,
            status='pending'
        ).count()
        
        stats_data = {
            'total_lots_created': profile.total_lots_created,
            'total_quantity_sold_quintals': float(profile.total_quantity_sold_quintals),
            'total_earnings': float(profile.total_earnings),
            'total_farmland_acres': float(profile.total_land_acres),
            'farmland_count': profile.farm_lands.count(),
            'active_crops': profile.crop_plans.filter(status__in=['sowed', 'growing']).count(),
            'active_lots': active_lots,
            'pending_bids': pending_bids,
        }
        
        return Response(
            response_success(
                message="Statistics retrieved successfully",
                data=stats_data
            )
        )
    
    @action(detail=False, methods=['get'])
    def my_stats(self, request):
        """Get current user's farmer statistics"""
        try:
            profile = FarmerProfile.objects.select_related('user', 'fpo').get(user=request.user)
            
            # Calculate additional stats
            from apps.lots.models import ProcurementLot
            from apps.bids.models import Bid
            
            active_lots = ProcurementLot.objects.filter(
                farmer=profile,
                status__in=['open', 'bidding_closed']
            ).count()
            
            pending_bids = Bid.objects.filter(
                lot__farmer=profile,
                status='pending'
            ).count()
            
            stats_data = {
                'total_lots_created': profile.total_lots_created,
                'total_quantity_sold_quintals': float(profile.total_quantity_sold_quintals),
                'total_earnings': float(profile.total_earnings),
                'total_farmland_acres': float(profile.total_land_acres),
                'farmland_count': profile.farm_lands.count(),
                'active_crops': profile.crop_plans.filter(status__in=['sowed', 'growing']).count(),
                'active_lots': active_lots,
                'pending_bids': pending_bids,
            }
            
            return Response(
                response_success(
                    message="Statistics retrieved successfully",
                    data=stats_data
                )
            )
        except FarmerProfile.DoesNotExist:
            return Response(
                response_error(message="Farmer profile not found"),
                status=status.HTTP_404_NOT_FOUND
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


class NearbyFPOAPIView(generics.GenericAPIView):
    """
    Get nearby FPOs based on farmer's location
    Also handles sending join requests to FPOs
    """
    permission_classes = [IsAuthenticated, IsFarmer]
    
    def get(self, request):
        """Get list of nearby FPOs"""
        from apps.fpos.models import FPOProfile, FPOJoinRequest
        from apps.fpos.serializers import FPOProfileSerializer
        
        try:
            farmer = request.user.farmer_profile
        except Exception:
            return Response(
                response_error(message="Farmer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not farmer.latitude or not farmer.longitude:
            return Response(
                response_error(message="Location not set. Please update your profile with location."),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all verified FPOs with location
        fpos = FPOProfile.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False,
            is_verified=True,
            is_active=True
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
                
                # Check if farmer already has a join request or membership
                has_membership = farmer.fpo == fpo
                pending_request = FPOJoinRequest.objects.filter(
                    farmer=farmer,
                    fpo=fpo,
                    status='pending'
                ).exists()
                
                fpo.has_membership = has_membership
                fpo.has_pending_request = pending_request
                fpo_list.append(fpo)
        
        # Sort by distance
        fpo_list.sort(key=lambda x: x.distance)
        
        # Serialize and return
        serializer = FPOProfileSerializer(fpo_list[:20], many=True)
        data = serializer.data
        
        # Add extra fields to response
        for i, fpo in enumerate(fpo_list[:20]):
            data[i]['distance'] = round(fpo.distance, 2)
            data[i]['has_membership'] = fpo.has_membership
            data[i]['has_pending_request'] = fpo.has_pending_request
        
        return Response(response_success(
            data=data,
            message=f"Found {len(data)} FPOs within 100 km"
        ))
    
    def post(self, request):
        """Send join request to FPO"""
        from apps.fpos.models import FPOProfile, FPOJoinRequest
        from apps.fpos.serializers import FPOJoinRequestSerializer
        
        try:
            farmer = request.user.farmer_profile
        except Exception:
            return Response(
                response_error(message="Farmer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if farmer already has FPO membership
        if farmer.fpo:
            return Response(
                response_error(message="You are already a member of an FPO"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        fpo_id = request.data.get('fpo_id')
        message = request.data.get('message', '')
        
        if not fpo_id:
            return Response(
                response_error(message="FPO ID is required"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            fpo = FPOProfile.objects.get(id=fpo_id, is_active=True)
        except FPOProfile.DoesNotExist:
            return Response(
                response_error(message="FPO not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if request already exists
        existing_request = FPOJoinRequest.objects.filter(
            farmer=farmer,
            fpo=fpo,
            status='pending'
        ).first()
        
        if existing_request:
            return Response(
                response_error(message="You already have a pending request to this FPO"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create join request
        join_request = FPOJoinRequest.objects.create(
            farmer=farmer,
            fpo=fpo,
            message=message
        )
        
        serializer = FPOJoinRequestSerializer(join_request)
        return Response(
            response_success(
                data=serializer.data,
                message=f"Join request sent to {fpo.organization_name}"
            ),
            status=status.HTTP_201_CREATED
        )


class MarketPricesAPIView(generics.GenericAPIView):
    """
    Get current market prices for oilseeds
    Fetches from MandiPrice database and eNAM API
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        crop_type = request.query_params.get('crop_type')
        state = request.query_params.get('state')
        district = request.query_params.get('district')
        days = int(request.query_params.get('days', 7))  # Last 7 days by default
        
        filters = {
            'date__gte': timezone.now().date() - timedelta(days=days)
        }
        
        if crop_type:
            filters['crop_type'] = crop_type
        if state:
            filters['state'] = state
        if district:
            filters['district'] = district
        
        # Get mandi prices
        prices = MandiPrice.objects.filter(**filters).order_by('-date', 'market_name')
        
        price_data = []
        for price in prices:
            price_data.append({
                'crop_type': price.crop_type,
                'market_name': price.market_name,
                'district': price.district,
                'state': price.state,
                'date': price.date.isoformat(),
                'min_price': float(price.min_price),
                'max_price': float(price.max_price),
                'modal_price': float(price.modal_price),
                'arrival_quintals': float(price.arrival_quantity_quintals) if price.arrival_quantity_quintals else 0
            })
        
        # Get MSP for reference
        msp_records = MSPRecord.objects.filter(is_active=True)
        msp_data = {}
        for msp in msp_records:
            msp_data[msp.crop_type] = {
                'msp': float(msp.msp_per_quintal),
                'year': msp.year,
                'season': msp.season
            }
        
        return Response(
            response_success(
                message="Market prices fetched successfully",
                data={
                    'prices': price_data,
                    'msp': msp_data,
                    'total_records': len(price_data)
                }
            )
        )


class WeatherAdvisoryAPIView(generics.GenericAPIView):
    """
    Get weather forecast and crop advisory
    Integration with IMD API (mocked for hackathon)
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        latitude = request.query_params.get('latitude')
        longitude = request.query_params.get('longitude')
        district = request.query_params.get('district', 'Unknown')
        
        # Mock weather data (in production, call IMD API)
        weather_data = {
            'location': district,
            'current': {
                'temperature': 28,
                'humidity': 65,
                'rainfall': 0,
                'wind_speed': 12,
                'condition': 'Partly Cloudy'
            },
            'forecast': [
                {'date': (timezone.now() + timedelta(days=i)).date().isoformat(),
                 'max_temp': 30 + i,
                 'min_temp': 20 + i,
                 'rainfall_prob': 20 + (i * 10),
                 'condition': 'Sunny' if i < 3 else 'Rainy'}
                for i in range(5)
            ],
            'alerts': [
                {
                    'type': 'rainfall',
                    'severity': 'moderate',
                    'message': 'Moderate rainfall expected in next 48 hours',
                    'issued_at': timezone.now().isoformat()
                }
            ],
            'advisories': [
                {
                    'crop': 'soybean',
                    'stage': 'flowering',
                    'advisory': 'Apply recommended dose of fertilizer. Monitor for pests.',
                    'priority': 'high'
                },
                {
                    'crop': 'all',
                    'stage': 'general',
                    'advisory': 'Ensure proper drainage due to expected rainfall',
                    'priority': 'medium'
                }
            ]
        }
        
        return Response(
            response_success(
                message="Weather advisory fetched successfully",
                data=weather_data
            )
        )


class CropDiseaseDetectionAPIView(generics.GenericAPIView):
    """
    AI-based crop disease detection
    Upload image and get disease diagnosis
    Note: Actual ML model would be deployed separately
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        image = request.FILES.get('image')
        crop_type = request.data.get('crop_type')
        
        if not image:
            return Response(
                response_error(message="Image is required"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mock disease detection (in production, call ML service)
        mock_result = {
            'disease_detected': 'Soybean Rust',
            'confidence': 0.87,
            'severity': 'moderate',
            'symptoms': [
                'Yellow-brown pustules on leaves',
                'Premature leaf drop',
                'Reduced pod formation'
            ],
            'treatment': {
                'immediate_action': 'Remove and destroy infected leaves',
                'chemical_control': 'Apply fungicide containing triazole or strobilurin',
                'organic_option': 'Neem oil spray at 5ml/liter',
                'preventive_measures': [
                    'Maintain proper plant spacing',
                    'Ensure good air circulation',
                    'Avoid overhead irrigation'
                ]
            },
            'estimated_yield_loss': '15-30%',
            'disease_spread_risk': 'high',
            'image_url': '/media/disease_detections/temp_image.jpg'
        }
        
        return Response(
            response_success(
                message="Disease detected successfully",
                data=mock_result
            )
        )


class YieldPredictionAPIView(generics.GenericAPIView):
    """
    Predict crop yield based on farm data
    Uses ML model trained on historical data
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        crop_type = request.data.get('crop_type')
        land_area_acres = float(request.data.get('land_area_acres', 0))
        soil_type = request.data.get('soil_type')
        irrigation = request.data.get('irrigation_available', False)
        
        if not crop_type or not land_area_acres:
            return Response(
                response_error(message="Crop type and land area required"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mock yield prediction (in production, call ML service)
        base_yield_per_acre = {
            'soybean': 8.5,
            'mustard': 6.0,
            'groundnut': 12.0,
            'sunflower': 9.0,
            'safflower': 5.5,
            'sesame': 3.5,
            'linseed': 4.0,
            'niger': 3.0
        }.get(crop_type, 7.0)
        
        # Adjust based on factors
        if irrigation:
            base_yield_per_acre *= 1.2
        if soil_type == 'black':
            base_yield_per_acre *= 1.1
        
        predicted_yield = base_yield_per_acre * land_area_acres
        
        result = {
            'crop_type': crop_type,
            'land_area_acres': land_area_acres,
            'predicted_yield_quintals': round(predicted_yield, 2),
            'yield_per_acre': round(base_yield_per_acre, 2),
            'confidence': 0.82,
            'factors_considered': {
                'soil_type': soil_type,
                'irrigation': irrigation,
                'historical_average': base_yield_per_acre
            },
            'recommendations': [
                'Apply balanced fertilizer (NPK)',
                'Maintain optimal soil moisture',
                'Monitor for pests regularly'
            ]
        }
        
        return Response(
            response_success(
                message="Yield prediction completed",
                data=result
            )
        )


class FarmerJoinRequestsAPIView(APIView):
    """
    Get farmer's FPO join requests
    """
    permission_classes = [IsAuthenticated, IsFarmer]
    
    def get(self, request):
        """Get all join requests for the farmer"""
        from apps.fpos.models import FPOJoinRequest
        from apps.fpos.serializers import FPOJoinRequestSerializer
        
        try:
            farmer = request.user.farmer_profile
        except Exception:
            return Response(
                response_error(message="Farmer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get all join requests
        join_requests = FPOJoinRequest.objects.filter(
            farmer=farmer,
            is_active=True
        ).select_related('fpo', 'reviewed_by').order_by('-requested_at')
        
        serializer = FPOJoinRequestSerializer(join_requests, many=True)
        
        return Response(response_success(
            data=serializer.data,
            message=f"Found {len(serializer.data)} join requests"
        ))


class CropPlanViewSet(viewsets.ModelViewSet):
    """
    ViewSet for simplified Crop Plans with financial data
    """
    permission_classes = [IsAuthenticated, IsFarmer]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CropPlanCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return CropPlanUpdateSerializer
        return CropPlanSerializer
    
    def get_queryset(self):
        """Filter to only show current farmer's plans"""
        user = self.request.user
        try:
            farmer_profile = FarmerProfile.objects.get(user=user)
            queryset = CropPlan.objects.filter(farmer=farmer_profile).select_related(
                'farmer', 'farm_land', 'converted_lot'
            )
            
            # Filter by status
            status_filter = self.request.query_params.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            # Filter by season
            season = self.request.query_params.get('season')
            if season:
                queryset = queryset.filter(season=season)
            
            # Filter by crop type
            crop_type = self.request.query_params.get('crop_type')
            if crop_type:
                queryset = queryset.filter(crop_type=crop_type)
            
            return queryset
        except FarmerProfile.DoesNotExist:
            return CropPlan.objects.none()
    
    def create(self, request, *args, **kwargs):
        """Create a new crop plan"""
        try:
            farmer_profile = FarmerProfile.objects.get(user=request.user)
        except FarmerProfile.DoesNotExist:
            return Response(
                response_error(message="Farmer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(farmer=farmer_profile)
            return Response(
                response_success(
                    message="Crop plan created successfully",
                    data=CropPlanSerializer(serializer.instance).data
                ),
                status=status.HTTP_201_CREATED
            )
        return Response(
            response_error(message="Failed to create crop plan", errors=serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def update(self, request, *args, **kwargs):
        """Update crop plan"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Check if already converted
        if instance.status == 'converted_to_lot':
            return Response(
                response_error(message="Cannot modify a plan that has been converted to a lot"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(
                response_success(
                    message="Crop plan updated successfully",
                    data=CropPlanSerializer(serializer.instance).data
                )
            )
        return Response(
            response_error(message="Failed to update crop plan", errors=serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'])
    def convert_to_lot(self, request, pk=None):
        """
        Convert a harvested crop plan to a procurement lot
        POST /api/farmers/crop-plans/{id}/convert-to-lot/
        """
        plan = self.get_object()
        
        try:
            lot = plan.create_lot_from_plan()
            
            return Response(
                response_success(
                    message="Crop plan successfully converted to procurement lot",
                    data={
                        'plan_id': plan.id,
                        'lot_id': lot.id,
                        'lot_number': lot.lot_number,
                        'conversion_date': plan.conversion_date.isoformat()
                    }
                ),
                status=status.HTTP_201_CREATED
            )
        except ValueError as e:
            return Response(
                response_error(message=str(e)),
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                response_error(message=f"Failed to convert plan to lot: {str(e)}"),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Update the status of a crop plan
        POST /api/farmers/crop-plans/{id}/update-status/
        Body: { "status": "growing", "actual_yield_quintals": 25.5 (optional) }
        """
        plan = self.get_object()
        new_status = request.data.get('status')
        actual_yield = request.data.get('actual_yield_quintals')
        
        if not new_status:
            return Response(
                response_error(message="Status is required"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate status
        valid_statuses = ['planned', 'sowing', 'growing', 'ready_to_harvest', 'harvested']
        if new_status not in valid_statuses:
            return Response(
                response_error(message=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update actual yield if provided and status is harvested
        if actual_yield and new_status == 'harvested':
            try:
                plan.actual_yield_quintals = float(actual_yield)
            except ValueError:
                return Response(
                    response_error(message="Invalid actual_yield_quintals value"),
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        plan.status = new_status
        plan.save()
        
        return Response(
            response_success(
                message=f"Status updated to {new_status}",
                data=CropPlanSerializer(plan).data
            )
        )
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get crop plan statistics for the farmer
        GET /api/farmers/crop-plans/statistics/
        """
        try:
            farmer_profile = FarmerProfile.objects.get(user=request.user)
            from django.db import models as django_models
            plans = CropPlan.objects.filter(farmer=farmer_profile)
            
            stats = {
                'total_plans': plans.count(),
                'active_plans': plans.filter(status__in=['sowing', 'growing', 'ready_to_harvest']).count(),
                'harvested_plans': plans.filter(status='harvested').count(),
                'converted_to_lots': plans.filter(status='converted_to_lot').count(),
                'total_land_planned': float(plans.aggregate(
                    total=django_models.Sum('land_acres')
                )['total'] or 0),
                'total_estimated_revenue': float(plans.aggregate(
                    total=django_models.Sum('gross_revenue')
                )['total'] or 0),
                'total_estimated_profit': float(plans.aggregate(
                    total=django_models.Sum('net_profit')
                )['total'] or 0),
                'crops_by_status': {},
            }
            
            # Group by status
            from django.db.models import Count
            status_counts = plans.values('status').annotate(count=Count('id'))
            for item in status_counts:
                stats['crops_by_status'][item['status']] = item['count']
            
            return Response(
                response_success(
                    message="Statistics retrieved successfully",
                    data=stats
                )
            )
        except FarmerProfile.DoesNotExist:
            return Response(
                response_error(message="Farmer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
