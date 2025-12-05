"""
Crops API Views - Prices, MSP, Market Data
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Avg, Max, Min
from django.utils import timezone
from datetime import timedelta
from apps.core.utils import response_success, response_error
from .models import CropMaster, CropVariety, MandiPrice, MSPRecord
import requests


class CropMasterListAPIView(APIView):
    """
    Get list of all oilseed crops with details
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
                'hindi_name': crop.hindi_name,
                'scientific_name': crop.scientific_name,
                'oil_content_percentage': float(crop.oil_content_percentage),
                'growing_season': crop.growing_season,
                'maturity_days': crop.maturity_days,
                'water_requirement': crop.water_requirement,
                'suitable_soil_types': crop.suitable_soil_types,
                'suitable_states': crop.suitable_states,
                'description': crop.description,
                'image_url': crop.image.url if crop.image else None
            })
        
        return Response(
            response_success(
                message="Crop master data fetched successfully",
                data={'crops': crop_data, 'total': len(crop_data)}
            )
        )


class CropVarietiesAPIView(APIView):
    """
    Get varieties for a specific crop
    """
    permission_classes = [AllowAny]
    
    def get(self, request, crop_code):
        try:
            crop = CropMaster.objects.get(crop_code=crop_code)
        except CropMaster.DoesNotExist:
            return Response(
                response_error(message="Crop not found"),
                status=404
            )
        
        varieties = CropVariety.objects.filter(crop=crop, is_active=True)
        
        variety_data = []
        for variety in varieties:
            variety_data.append({
                'id': str(variety.id),
                'variety_name': variety.variety_name,
                'variety_code': variety.variety_code,
                'maturity_days': variety.maturity_days,
                'yield_potential_quintals_per_acre': float(variety.yield_potential_quintals_per_acre),
                'oil_content_percentage': float(variety.oil_content_percentage),
                'season': variety.season,
                'suitable_regions': variety.suitable_regions,
                'disease_resistance': variety.disease_resistance,
                'seed_rate_kg_per_acre': float(variety.seed_rate_kg_per_acre) if variety.seed_rate_kg_per_acre else None,
                'description': variety.description
            })
        
        return Response(
            response_success(
                message="Crop varieties fetched successfully",
                data={
                    'crop': crop.get_crop_name_display(),
                    'varieties': variety_data,
                    'total': len(variety_data)
                }
            )
        )


class MandiPricesAPIView(APIView):
    """
    Get latest mandi prices with filtering
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
                'market_name': price.market_name,
                'district': price.district,
                'state': price.state,
                'date': price.date.isoformat(),
                'min_price': float(price.min_price),
                'max_price': float(price.max_price),
                'modal_price': float(price.modal_price),
                'arrival_quintals': float(price.arrival_quantity_quintals) if price.arrival_quantity_quintals else 0,
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
                    }
                }
            )
        )


class MSPRecordsAPIView(APIView):
    """
    Get Minimum Support Price (MSP) records
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
            filters['year'] = year
        if season:
            filters['season'] = season
        
        msp_records = MSPRecord.objects.filter(**filters).order_by('-year', 'crop_type')
        
        msp_data = []
        for msp in msp_records:
            msp_data.append({
                'id': str(msp.id),
                'crop_type': msp.crop_type,
                'year': msp.year,
                'season': msp.season,
                'msp_per_quintal': float(msp.msp_per_quintal),
                'increase_from_previous_year': float(msp.increase_from_previous_year) if msp.increase_from_previous_year else 0,
                'increase_percentage': float(msp.increase_percentage) if msp.increase_percentage else 0,
                'notification_date': msp.notification_date.isoformat() if msp.notification_date else None,
                'applicable_from': msp.applicable_from.isoformat() if msp.applicable_from else None
            })
        
        return Response(
            response_success(
                message="MSP records fetched successfully",
                data={'msp_records': msp_data, 'total': len(msp_data)}
            )
        )


class PriceTrendAPIView(APIView):
    """
    Get price trends for a crop over time
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        crop_type = request.query_params.get('crop_type')
        state = request.query_params.get('state')
        months = int(request.query_params.get('months', 6))
        
        if not crop_type:
            return Response(
                response_error(message="Crop type is required"),
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
        
        # Group by month and calculate average
        from django.db.models.functions import TruncMonth
        
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
        
        msp_value = float(msp.msp_per_quintal) if msp else None
        
        return Response(
            response_success(
                message="Price trend fetched successfully",
                data={
                    'crop_type': crop_type,
                    'trend': trend_data,
                    'msp': msp_value,
                    'period_months': months
                }
            )
        )


class FetcheNAMPricesAPIView(APIView):
    """
    Fetch latest prices from eNAM API and update database
    Mock implementation for hackathon (would integrate real eNAM API)
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Mock eNAM API integration
        # In production: requests.get('https://enam.gov.in/api/prices')
        
        # For now, create sample data
        mock_prices = [
            {
                'crop_type': 'soybean',
                'state': 'Maharashtra',
                'district': 'Nagpur',
                'market_name': 'Nagpur APMC',
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
            }
        ]
        
        today = timezone.now().date()
        created_count = 0
        
        for price_data in mock_prices:
            _, created = MandiPrice.objects.get_or_create(
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
        
        return Response(
            response_success(
                message=f"Successfully fetched and updated {created_count} price records from eNAM",
                data={'records_created': created_count}
            )
        )
