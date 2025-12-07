"""
Crops Views for SeedSync Platform
Unified views combining ViewSets and APIViews
"""
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Max, Min
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from apps.core.utils import response_success, response_error
from .models import CropMaster, CropVariety, MandiPrice, MSPRecord, CropVarietyRequest
from .serializers import (
    CropMasterSerializer, 
    CropVarietySerializer, 
    MandiPriceSerializer, 
    MSPRecordSerializer,
    CropVarietyRequestSerializer
)


# ==================== ViewSets (DRF Router-based) ====================

class CropMasterViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for crop master data
    Provides list, retrieve, and filtering
    """
    queryset = CropMaster.objects.filter(is_active=True)
    serializer_class = CropMasterSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['crop_name']
    search_fields = ['crop_name', 'hindi_name', 'scientific_name']


class CropVarietyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for crop varieties
    Provides list, retrieve, and filtering by crop
    """
    queryset = CropVariety.objects.filter(is_active=True).select_related('crop')
    serializer_class = CropVarietySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['crop', 'season']
    search_fields = ['variety_name', 'variety_code']


class MandiPriceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for mandi prices
    Provides list, retrieve, filtering, and latest prices action
    """
    queryset = MandiPrice.objects.filter(is_active=True).order_by('-date')
    serializer_class = MandiPriceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['crop_type', 'state', 'district', 'date']
    search_fields = ['market_name']
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get latest prices for all crops or filtered by crop/state"""
        crop_type = request.query_params.get('crop_type')
        state = request.query_params.get('state')
        
        queryset = self.get_queryset()
        if crop_type:
            queryset = queryset.filter(crop_type=crop_type)
        if state:
            queryset = queryset.filter(state=state)
        
        latest_prices = queryset[:20]
        serializer = self.get_serializer(latest_prices, many=True)
        return Response(serializer.data)


class MSPRecordViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for MSP records
    Provides list, retrieve, filtering, and current year action
    """
    queryset = MSPRecord.objects.filter(is_active=True).order_by('-year', '-season')
    serializer_class = MSPRecordSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['crop_type', 'year', 'season']
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current year MSP records"""
        current_year = timezone.now().year
        crop_type = request.query_params.get('crop_type')
        
        queryset = self.get_queryset().filter(year=current_year)
        if crop_type:
            queryset = queryset.filter(crop_type=crop_type)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# ==================== APIViews (Custom Endpoints) ====================

class CropMasterListAPIView(APIView):
    """
    Get detailed list of all crops with complete information
    More detailed than the ViewSet list
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        crops = CropMaster.objects.filter(is_active=True)
        
        crop_data = []
        for crop in crops:
            crop_data.append({
                'id': str(crop.id),
                'crop_code': crop.crop_code,
                'crop_name': crop.crop_name,
                'crop_name_display': crop.get_crop_name_display(),
                'hindi_name': crop.hindi_name,
                'scientific_name': crop.scientific_name,
                'oil_content_percentage': float(crop.oil_content_percentage),
                'growing_season': crop.growing_season,
                'maturity_days': crop.maturity_days,
                'water_requirement': crop.water_requirement,
                'suitable_soil_types': crop.suitable_soil_types,
                'suitable_states': crop.suitable_states,
                'description': crop.description,
                'cultivation_tips': crop.cultivation_tips,
                'image_url': crop.image.url if crop.image else None
            })
        
        return Response(
            response_success(
                message="Crop master data fetched successfully",
                data={'crops': crop_data, 'total': len(crop_data)}
            )
        )


class CropVarietiesByCodeAPIView(APIView):
    """
    Get all varieties for a specific crop by crop code
    """
    permission_classes = [AllowAny]
    
    def get(self, request, crop_code):
        print(f"🔍 Looking for crop with code: {crop_code}")
        try:
            crop = CropMaster.objects.get(crop_code=crop_code, is_active=True)
            print(f"✅ Found crop: {crop.crop_name} ({crop.crop_code})")
        except CropMaster.DoesNotExist:
            print(f"❌ Crop not found with code: {crop_code}")
            print(f"📋 Available codes: {list(CropMaster.objects.filter(is_active=True).values_list('crop_code', flat=True))}")
            return Response(
                response_error(message="Crop not found"),
                status=404
            )
        
        varieties = CropVariety.objects.filter(crop=crop, is_active=True)
        print(f"📦 Found {varieties.count()} varieties for {crop.crop_name}")
        
        variety_data = []
        for variety in varieties:
            variety_data.append({
                'id': str(variety.id),
                'crop_name': crop.get_crop_name_display(),
                'variety_name': variety.variety_name,
                'variety_code': variety.variety_code,
                'maturity_days': variety.maturity_days,
                'yield_potential_quintals_per_acre': float(variety.yield_potential_quintals_per_acre),
                'oil_content_percentage': float(variety.oil_content_percentage),
                'season': variety.season,
                'season_display': variety.get_season_display(),
                'suitable_regions': variety.suitable_regions,
                'disease_resistance': variety.disease_resistance,
                'seed_rate_kg_per_acre': float(variety.seed_rate_kg_per_acre) if variety.seed_rate_kg_per_acre else None,
                'description': variety.description
            })
        
        return Response(
            response_success(
                message="Crop varieties fetched successfully",
                data={
                    'crop_code': crop.crop_code,
                    'crop_name': crop.get_crop_name_display(),
                    'varieties': variety_data,
                    'total': len(variety_data)
                }
            )
        )


class MandiPricesWithAggregatesAPIView(APIView):
    """
    Get mandi prices with filtering and aggregates
    Includes average, min, max calculations
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        crop_type = request.query_params.get('crop_type')
        state = request.query_params.get('state')
        district = request.query_params.get('district')
        days = int(request.query_params.get('days', 7))
        
        filters = {
            'date__gte': timezone.now().date() - timedelta(days=days),
            'is_active': True
        }
        
        if crop_type:
            filters['crop_type'] = crop_type
        if state:
            filters['state'] = state
        if district:
            filters['district__icontains'] = district
        
        prices = MandiPrice.objects.filter(**filters).order_by('-date', 'market_name')
        
        price_data = []
        for price in prices:
            price_data.append({
                'id': str(price.id),
                'crop_type': price.crop_type,
                'crop_type_display': price.get_crop_type_display(),
                'market_name': price.market_name,
                'district': price.district,
                'state': price.state,
                'state_display': price.get_state_display(),
                'date': price.date.isoformat(),
                'min_price': float(price.min_price),
                'max_price': float(price.max_price),
                'modal_price': float(price.modal_price),
                'arrival_quantity_quintals': float(price.arrival_quantity_quintals) if price.arrival_quantity_quintals else 0,
                'source': price.source
            })
        
        # Calculate aggregates
        aggregates = MandiPrice.objects.filter(**filters).aggregate(
            avg_price=Avg('modal_price'),
            min_price=Min('min_price'),
            max_price=Max('max_price')
        )
        
        return Response(
            response_success(
                message="Mandi prices fetched successfully",
                data={
                    'prices': price_data,
                    'total': len(price_data),
                    'aggregates': {
                        'average_price': float(aggregates['avg_price']) if aggregates['avg_price'] else 0,
                        'lowest_price': float(aggregates['min_price']) if aggregates['min_price'] else 0,
                        'highest_price': float(aggregates['max_price']) if aggregates['max_price'] else 0
                    },
                    'filters': {
                        'crop_type': crop_type,
                        'state': state,
                        'district': district,
                        'days': days
                    }
                }
            )
        )


class MSPRecordsDetailAPIView(APIView):
    """
    Get MSP records with detailed filtering
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        crop_type = request.query_params.get('crop_type')
        year = request.query_params.get('year')
        season = request.query_params.get('season')
        
        filters = {'is_active': True}
        
        if crop_type:
            filters['crop_type'] = crop_type
        if year:
            filters['year'] = int(year)
        if season:
            filters['season'] = season
        
        msp_records = MSPRecord.objects.filter(**filters).order_by('-year', 'crop_type')
        
        msp_data = []
        for msp in msp_records:
            msp_data.append({
                'id': str(msp.id),
                'crop_type': msp.crop_type,
                'crop_type_display': msp.get_crop_type_display(),
                'year': msp.year,
                'season': msp.season,
                'season_display': msp.get_season_display(),
                'msp_per_quintal': float(msp.msp_per_quintal),
                'bonus_per_quintal': float(msp.bonus_per_quintal),
                'total_msp': float(msp.get_total_msp()),
                'notification_number': msp.notification_number,
                'notification_date': msp.notification_date.isoformat() if msp.notification_date else None,
                'effective_from': msp.effective_from.isoformat(),
                'effective_to': msp.effective_to.isoformat() if msp.effective_to else None,
                'notes': msp.notes
            })
        
        return Response(
            response_success(
                message="MSP records fetched successfully",
                data={'msp_records': msp_data, 'total': len(msp_data)}
            )
        )


class PriceTrendAPIView(APIView):
    """
    Get price trends for a crop over time with monthly aggregates
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        crop_type = request.query_params.get('crop_type')
        state = request.query_params.get('state')
        months = int(request.query_params.get('months', 6))
        
        if not crop_type:
            return Response(
                response_error(message="crop_type parameter is required"),
                status=400
            )
        
        start_date = timezone.now().date() - timedelta(days=30*months)
        
        filters = {
            'crop_type': crop_type,
            'date__gte': start_date,
            'is_active': True
        }
        
        if state:
            filters['state'] = state
        
        # Group by month and calculate averages
        monthly_prices = MandiPrice.objects.filter(**filters).annotate(
            month=TruncMonth('date')
        ).values('month').annotate(
            avg_price=Avg('modal_price'),
            min_price=Min('min_price'),
            max_price=Max('max_price'),
            total_arrival=Avg('arrival_quantity_quintals')
        ).order_by('month')
        
        trend_data = []
        for item in monthly_prices:
            trend_data.append({
                'month': item['month'].strftime('%B %Y'),
                'date': item['month'].isoformat(),
                'average_price': float(item['avg_price']) if item['avg_price'] else 0,
                'min_price': float(item['min_price']) if item['min_price'] else 0,
                'max_price': float(item['max_price']) if item['max_price'] else 0,
                'avg_arrival_quintals': float(item['total_arrival']) if item['total_arrival'] else 0
            })
        
        # Get MSP for comparison
        current_year = timezone.now().year
        msp = MSPRecord.objects.filter(
            crop_type=crop_type,
            year=current_year,
            is_active=True
        ).first()
        
        return Response(
            response_success(
                message="Price trend fetched successfully",
                data={
                    'crop_type': crop_type,
                    'trend': trend_data,
                    'msp': float(msp.msp_per_quintal) if msp else None,
                    'period_months': months,
                    'start_date': start_date.isoformat(),
                    'end_date': timezone.now().date().isoformat()
                }
            )
        )


class FetcheNAMPricesAPIView(APIView):
    """
    Fetch latest prices from eNAM API and update database
    Admin/authenticated endpoint for data refresh
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Mock eNAM API integration for demonstration
        # In production: integrate with actual eNAM/AgMarkNet API
        
        mock_prices = [
            {
                'crop_type': 'soybean',
                'state': 'Madhya Pradesh',
                'district': 'Indore',
                'market_name': 'Indore APMC',
                'min_price': 4200,
                'max_price': 4600,
                'modal_price': 4400,
                'arrival_quintals': 15000
            },
            {
                'crop_type': 'mustard',
                'state': 'Rajasthan',
                'district': 'Jaipur',
                'market_name': 'Jaipur Mandi',
                'min_price': 5100,
                'max_price': 5500,
                'modal_price': 5300,
                'arrival_quintals': 8000
            },
            {
                'crop_type': 'groundnut',
                'state': 'Gujarat',
                'district': 'Rajkot',
                'market_name': 'Rajkot APMC',
                'min_price': 5500,
                'max_price': 6000,
                'modal_price': 5750,
                'arrival_quintals': 12000
            }
        ]
        
        today = timezone.now().date()
        created_count = 0
        updated_count = 0
        
        for price_data in mock_prices:
            obj, created = MandiPrice.objects.update_or_create(
                crop_type=price_data['crop_type'],
                state=price_data['state'],
                district=price_data['district'],
                market_name=price_data['market_name'],
                date=today,
                defaults={
                    'min_price': price_data['min_price'],
                    'max_price': price_data['max_price'],
                    'modal_price': price_data['modal_price'],
                    'arrival_quantity_quintals': price_data['arrival_quintals'],
                    'source': 'enam'
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1
        
        return Response(
            response_success(
                message=f"Successfully synced price data from eNAM",
                data={
                    'records_created': created_count,
                    'records_updated': updated_count,
                    'total_processed': created_count + updated_count,
                    'date': today.isoformat()
                }
            )
        )


class CropVarietyRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for farmers/FPOs to request new crop varieties
    """
    queryset = CropVarietyRequest.objects.all().order_by('-created_at')
    serializer_class = CropVarietyRequestSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'crop_type']
    search_fields = ['variety_name', 'variety_code']

    def get_queryset(self):
        """Filter based on user role"""
        user = self.request.user
        
        if user.role == 'farmer':
            # Farmers see only their requests
            return self.queryset.filter(farmer__user=user)
        elif user.role == 'fpo':
            # FPOs see only their requests
            return self.queryset.filter(fpo__user=user)
        elif user.role in ['government', 'admin']:
            # Government/Admin see all requests
            return self.queryset
        else:
            # Others see none
            return self.queryset.none()

    def perform_create(self, serializer):
        """Auto-assign farmer or FPO based on logged-in user"""
        user = self.request.user
        
        if user.role == 'farmer':
            from apps.farmers.models import FarmerProfile
            farmer_profile = FarmerProfile.objects.filter(user=user).first()
            serializer.save(farmer=farmer_profile)
        elif user.role == 'fpo':
            from apps.fpos.models import FPOProfile
            fpo_profile = FPOProfile.objects.filter(user=user).first()
            serializer.save(fpo=fpo_profile)
        else:
            serializer.save()

    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """Get current user's variety requests"""
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def approve(self, request, pk=None):
        """Government admin approves variety request"""
        if request.user.role not in ['government', 'admin']:
            return Response(
                response_error(message="Only government officials can approve requests"),
                status=403
            )
        
        variety_request = self.get_object()
        
        if variety_request.status != 'pending':
            return Response(
                response_error(message="Only pending requests can be approved"),
                status=400
            )
        
        variety_request.status = 'approved'
        variety_request.reviewed_by = request.user
        variety_request.reviewed_at = timezone.now()
        variety_request.admin_notes = request.data.get('notes', '')
        variety_request.save()
        
        serializer = self.get_serializer(variety_request)
        return Response(
            response_success(
                message="Variety request approved successfully",
                data=serializer.data
            )
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reject(self, request, pk=None):
        """Government admin rejects variety request"""
        if request.user.role not in ['government', 'admin']:
            return Response(
                response_error(message="Only government officials can reject requests"),
                status=403
            )
        
        variety_request = self.get_object()
        
        if variety_request.status != 'pending':
            return Response(
                response_error(message="Only pending requests can be rejected"),
                status=400
            )
        
        variety_request.status = 'rejected'
        variety_request.reviewed_by = request.user
        variety_request.reviewed_at = timezone.now()
        variety_request.admin_notes = request.data.get('notes', 'Request rejected')
        variety_request.save()
        
        serializer = self.get_serializer(variety_request)
        return Response(
            response_success(
                message="Variety request rejected",
                data=serializer.data
            )
        )
