"""
Additional Farmers Views - Market Prices, Weather, Disease Detection
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.core.utils import response_success, response_error
from apps.crops.models import MandiPrice, MSPRecord
from apps.core.constants import OILSEED_CHOICES
from django.utils import timezone
from datetime import timedelta
import requests


class MarketPricesAPIView(APIView):
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


class WeatherAdvisoryAPIView(APIView):
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


class CropDiseaseDetectionAPIView(APIView):
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
                status=400
            )
        
        # Mock disease detection (in production, call ML service)
        # Example: POST to ML API endpoint
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


class YieldPredictionAPIView(APIView):
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
                status=400
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
