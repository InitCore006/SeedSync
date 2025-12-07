"""
Advisories Views - Weather, Crop Advisories, Market Insights
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from datetime import timedelta
from apps.core.utils import response_success
import random
from .utils.demand_forecast import get_all_market_insights
# from .utils.market_insights_serializers import MarketInsightsResponseSerializer
from rest_framework.permissions import AllowAny


class WeatherForecastAPIView(APIView):
    """
    5-day weather forecast
    Mock IMD API integration
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        latitude = request.query_params.get('latitude')
        longitude = request.query_params.get('longitude')
        district = request.query_params.get('district', 'Unknown')
        
        # Mock weather data
        forecast = []
        for i in range(5):
            date = timezone.now().date() + timedelta(days=i)
            forecast.append({
                'date': date.isoformat(),
                'day': date.strftime('%A'),
                'max_temp_c': 28 + random.randint(-3, 5),
                'min_temp_c': 18 + random.randint(-2, 4),
                'humidity_percent': 60 + random.randint(-10, 20),
                'rainfall_mm': random.randint(0, 50),
                'rainfall_probability': random.randint(10, 90),
                'wind_speed_kmph': random.randint(8, 25),
                'condition': random.choice(['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Thunderstorm']),
                'uv_index': random.randint(3, 10)
            })
        
        return Response(
            response_success(
                message="Weather forecast fetched",
                data={
                    'location': district,
                    'forecast': forecast,
                    'alerts': [
                        {
                            'type': 'rainfall',
                            'severity': 'moderate',
                            'message': 'Moderate rainfall expected in next 48 hours',
                            'valid_until': (timezone.now() + timedelta(days=2)).isoformat()
                        }
                    ]
                }
            )
        )


class CropAdvisoryAPIView(APIView):
    """
    Crop-specific advisories based on season and conditions
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        crop_type = request.query_params.get('crop_type', 'soybean')
        growth_stage = request.query_params.get('stage', 'vegetative')
        
        advisories = {
            'soybean': {
                'sowing': [
                    'Use certified seeds of recommended varieties',
                    'Treat seeds with Thiram @ 3g/kg',
                    'Sow at 45cm row spacing, 5cm depth',
                    'Apply basal fertilizer: 20:60:40 NPK kg/ha'
                ],
                'vegetative': [
                    'First irrigation at 20-25 days after sowing',
                    'Weed control: 2-3 manual weeding or herbicide',
                    'Watch for yellow mosaic virus symptoms',
                    'Apply first top dressing of nitrogen'
                ],
                'flowering': [
                    'Critical water requirement period',
                    'Monitor for pod borer and defoliators',
                    'Spray recommended insecticide if needed',
                    'Foliar spray of DAP 2% for pod filling'
                ],
                'maturity': [
                    'Withhold irrigation 10-15 days before harvest',
                    'Harvest when 95% pods turn brown',
                    'Dry to 10-12% moisture content',
                    'Store in cool, dry place'
                ]
            }
        }
        
        crop_advisories = advisories.get(crop_type, {}).get(growth_stage, [])
        
        return Response(
            response_success(
                message="Crop advisory fetched",
                data={
                    'crop_type': crop_type,
                    'growth_stage': growth_stage,
                    'advisories': crop_advisories,
                    'issued_date': timezone.now().isoformat(),
                    'valid_for_days': 7
                }
            )
        )


class PestDiseaseAlertAPIView(APIView):
    """
    Pest and disease alerts for region
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        district = request.query_params.get('district', 'Unknown')
        crop_type = request.query_params.get('crop_type')
        
        alerts = [
            {
                'pest_disease': 'Soybean Rust',
                'severity': 'high',
                'affected_crops': ['soybean'],
                'symptoms': 'Yellow-brown pustules on leaves, premature defoliation',
                'control_measures': [
                    'Apply fungicide (Hexaconazole or Tebuconazole)',
                    'Remove infected leaves',
                    'Ensure proper plant spacing'
                ],
                'issued_date': timezone.now().isoformat()
            },
            {
                'pest_disease': 'Aphids',
                'severity': 'moderate',
                'affected_crops': ['mustard', 'soybean'],
                'symptoms': 'Curled leaves, honeydew secretion, sooty mold',
                'control_measures': [
                    'Spray Imidacloprid 17.8 SL @ 0.3 ml/liter',
                    'Use yellow sticky traps',
                    'Release natural predators (ladybird beetles)'
                ],
                'issued_date': timezone.now().isoformat()
            }
        ]
        
        if crop_type:
            alerts = [a for a in alerts if crop_type in a['affected_crops']]
        
        return Response(
            response_success(
                message="Pest and disease alerts fetched",
                data={
                    'district': district,
                    'alerts': alerts,
                    'total_alerts': len(alerts)
                }
            )
        )


class MarketInsightsAPIView(APIView):
    """
    Market insights and price predictions
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        insights = {
            'market_sentiment': 'bullish',
            'demand_supply_status': 'balanced',
            'price_trend': 'stable_to_increasing',
            'insights': [
                {
                    'title': 'Soybean Prices Expected to Rise',
                    'summary': 'Due to reduced rainfall in major producing states, soybean prices are expected to increase by 8-10% in next quarter',
                    'category': 'price_forecast',
                    'published_date': timezone.now().isoformat()
                },
                {
                    'title': 'Government Increases MSP',
                    'summary': 'MSP for mustard increased by 12% for upcoming rabi season, ensuring better returns for farmers',
                    'category': 'policy_update',
                    'published_date': (timezone.now() - timedelta(days=5)).isoformat()
                },
                {
                    'title': 'Export Demand Rising',
                    'summary': 'International demand for Indian oilseeds increasing, particularly groundnut and sesame',
                    'category': 'market_trend',
                    'published_date': (timezone.now() - timedelta(days=10)).isoformat()
                }
            ],
            'recommendations': [
                'Hold stock for 2-3 weeks for better prices',
                'Focus on quality improvement for export market',
                'Consider value addition (oil extraction) for higher margins'
            ]
        }
        
        return Response(
            response_success(
                message="Market insights fetched",
                data=insights
            )
        )

class MarketInsightsViewSet(APIView):
    """
    Market Insights and Demand Forecasting API
    
    Provides role-based market analysis:
    - FPO: Buyer demand, state-wise crop demand
    - RETAILER: Price trends, monthly demand seasonality
    - PROCESSOR: Procurement volume by state, completion rates
    
    Query Parameters:
    - role: 'fpo', 'retailer', 'processor' (optional)
    - If role not specified, returns all market data
    
    Endpoint:
    GET /api/market-insights/?role=fpo
    
    Response includes:
    - data_available: Boolean indicating if data exists
    - total_orders: Total orders count for the filter
    - date_range: Start and end dates of orders
    - market_summary: Complete demand/supply/price trends
    - farmer_insights: Market shortages and best price crops
    - role_insights: Role-specific insights (if role provided)
    """
    
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        Get comprehensive market insights for requested role
        
        Query Parameters:
        - role: 'fpo' | 'retailer' | 'processor' | 'trader' | 'exporter' (optional)
        """
        role = request.query_params.get('role', None)
        
        # Validate role if provided
        valid_roles = ['fpo', 'retailer', 'processor', 'trader', 'exporter']
        if role and role.lower() not in valid_roles:
            return Response(
                {
                    'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}',
                    'received': role
                }
                
            )
        
        try:
            # Fetch market insights from utility function
            insights = get_all_market_insights(role)
            
            return Response(
                insights
            )
        
        except Exception as e:
            return Response(
                {
                    'error': 'Failed to fetch market insights',
                    'details': str(e)
                }
            )