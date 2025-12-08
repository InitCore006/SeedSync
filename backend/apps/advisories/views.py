"""
Advisories Views - Disease Prediction & Market Forecasting
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from apps.core.utils import response_success
import logging

from .utils.market_data_extractor import MarketDataExtractor
from .utils.market_forecaster import MarketForecaster
from .disease_detector import detector_instance

logger = logging.getLogger(__name__)


class DiseasePredictionAPIView(APIView):
    """Disease prediction using AI model"""
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        try:
            crop_type = request.data.get("crop_type", "").lower().strip()
            image_file = request.FILES.get("image")

            # Validate
            if not crop_type:
                return Response({"success": False, "message": "crop_type is required"}, 400)

            if crop_type not in ['groundnut', 'soybean', 'sunflower']:
                return Response({"success": False, "message": "Invalid crop_type"}, 400)

            if not image_file:
                return Response({"success": False, "message": "image file is required"}, 400)

            # Predict
            prediction = detector_instance.predict(image_file, crop_type)

            if "error" in prediction:
                return Response(
                    {"success": False, "message": prediction["error"]},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Build final response
            response_data = {
                "disease": prediction["disease"],
                "confidence_percentage": prediction["confidence_percentage"],
                "crop_type": prediction["crop_type"],
                "solution": prediction.get("solution")
            }

            return Response(response_success(
                message="Disease prediction completed",
                data=response_data
            ), 200)

        except Exception as e:
            logger.error(str(e))
            return Response({"success": False, "message": str(e)}, 500)


# ==================== MARKET FORECASTING API ====================

class MarketForecastAPIView(APIView):
    """
    Complete Market Forecast for All Roles
    
    GET /api/advisories/market-forecast/?role=farmer
    
    Simple Input - Just role type:
    - role: farmer | fpo | processor | retailer (required)
    
    Shows insights for ALL crops in easy-to-understand format
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Get role parameter
        role = request.query_params.get('role')
        
        # Validate role
        valid_roles = ['farmer', 'fpo', 'processor', 'retailer']
        if not role or role not in valid_roles:
            return Response({
                'success': False,
                'message': f'Please provide role. Choose from: {", ".join(valid_roles)}',
                'example': '/api/advisories/market-forecast/?role=farmer'
            }, status=400)
        
        try:
            # Extract ALL market data (no crop filter - show everything)
            extractor = MarketDataExtractor()
            data = extractor.get_combined_data(days_back=365, filters={})
            
            if not data:
                return Response({
                    'success': False,
                    'message': 'No market data available yet. Please check back later.'
                }, status=404)
            
            # Convert to DataFrame
            df = extractor.to_dataframe(data)
            
            # Create forecaster
            forecaster = MarketForecaster(df)
            
            # Generate role-specific insights
            insights = self._format_insights_for_role(role, forecaster, df)
            
            return Response({
                'success': True,
                'role': role,
                'insights': insights
            }, status=200)
            
        except Exception as e:
            logger.error(f"Forecasting error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Unable to generate forecast. Please try again later.',
                'error': str(e)
            }, status=500)
    
    def _format_insights_for_role(self, role, forecaster, df):
        """Format insights in simple, easy-to-understand language"""
        
        # Common insights for all roles
        price_forecast = forecaster.forecast_price_trend(days_ahead=30)
        quantity_forecast = forecaster.forecast_demand_quantity(days_ahead=30)
        crop_analysis = forecaster.crop_wise_analysis(top_n=5)
        seasonal = forecaster.seasonal_analysis()
        
        # Base insights
        insights = {
            'summary': {
                'total_market_value': f"₹{df['total_value_inr'].sum():,.0f}",
                'average_price': f"₹{df['price_per_quintal_inr'].mean():.2f} per quintal",
                'total_quantity': f"{df['quantity_quintals'].sum():,.0f} quintals",
                'total_transactions': len(df)
            }
        }
        
        # Role-specific insights
        if role == 'farmer':
            insights.update(self._farmer_insights(price_forecast, crop_analysis, seasonal))
        
        elif role == 'fpo':
            insights.update(self._fpo_insights(quantity_forecast, price_forecast, crop_analysis))
        
        elif role == 'processor':
            insights.update(self._processor_insights(quantity_forecast, price_forecast, crop_analysis))
        
        elif role == 'retailer':
            insights.update(self._retailer_insights(quantity_forecast, price_forecast, crop_analysis))
        
        return insights
    
    def _farmer_insights(self, price_forecast, crop_analysis, seasonal):
        """Simple insights for farmers"""
        if 'error' in price_forecast:
            recommendation = {
                'action': 'Monitor Market',
                'message': 'Keep checking prices regularly'
            }
        else:
            if price_forecast['trend'] == 'bullish':
                recommendation = {
                    'action': 'Wait & Watch',
                    'message': f"Prices may go UP by {abs(price_forecast['price_change_percent']):.1f}% in next 30 days",
                    'suggestion': 'Consider holding your crop for better prices',
                    'best_time_to_sell': '20-30 days from now'
                }
            elif price_forecast['trend'] == 'bearish':
                recommendation = {
                    'action': 'Sell Soon',
                    'message': f"Prices may go DOWN by {abs(price_forecast['price_change_percent']):.1f}% in next 30 days",
                    'suggestion': 'Selling now may be better',
                    'best_time_to_sell': 'Within next 7-10 days'
                }
            else:
                recommendation = {
                    'action': 'Flexible',
                    'message': 'Prices are stable',
                    'suggestion': 'You can sell anytime in next 30 days',
                    'best_time_to_sell': 'Anytime convenient'
                }
        
        return {
            'price_today': f"₹{price_forecast.get('current_price', 0):.2f} per quintal" if 'current_price' in price_forecast else 'Not available',
            'price_expected_30_days': f"₹{price_forecast.get('forecast_avg_price', 0):.2f} per quintal" if 'forecast_avg_price' in price_forecast else 'Not available',
            'recommendation': recommendation,
            'top_crops_by_price': [
                {
                    'crop': crop['crop_type'],
                    'average_price': f"₹{crop['avg_price']:.2f}/quintal",
                    'market_demand': f"{crop['market_share_percent']:.1f}% of total market"
                }
                for crop in crop_analysis.get('top_crops', [])[:3]
            ],
            'seasonal_tip': seasonal.get('recommendation', 'Plant according to season'),
            'best_season': seasonal.get('peak_season', 'rabi')
        }
    
    def _fpo_insights(self, quantity_forecast, price_forecast, crop_analysis):
        """Simple insights for FPOs"""
        return {
            'procurement_forecast': {
                'next_60_days_demand': f"{quantity_forecast.get('total_forecast_demand', 0):,.0f} quintals" if 'total_forecast_demand' in quantity_forecast else 'Not available',
                'daily_average_demand': f"{quantity_forecast.get('avg_daily_demand', 0):.0f} quintals per day" if 'avg_daily_demand' in quantity_forecast else 'Not available',
                'recommendation': f"Plan to procure approximately {quantity_forecast.get('total_forecast_demand', 0) * 1.15:,.0f} quintals (with 15% buffer)" if 'total_forecast_demand' in quantity_forecast else 'Monitor daily'
            },
            'price_trends': {
                'current_average': f"₹{price_forecast.get('current_price', 0):.2f}/quintal" if 'current_price' in price_forecast else 'Not available',
                'expected_in_60_days': f"₹{price_forecast.get('forecast_avg_price', 0):.2f}/quintal" if 'forecast_avg_price' in price_forecast else 'Not available',
                'trend': price_forecast.get('trend', 'stable').upper()
            },
            'top_crops_to_focus': [
                {
                    'crop': crop['crop_type'],
                    'demand': f"{crop['total_quantity']:,.0f} quintals",
                    'price': f"₹{crop['avg_price']:.2f}/quintal",
                    'market_share': f"{crop['market_share_percent']:.1f}%"
                }
                for crop in crop_analysis.get('top_crops', [])[:5]
            ],
            'action_plan': {
                'message': 'Focus on crops with high demand and good prices',
                'priority_crops': [crop['crop_type'] for crop in crop_analysis.get('top_crops', [])[:3]]
            }
        }
    
    def _processor_insights(self, quantity_forecast, price_forecast, crop_analysis):
        """Simple insights for processors"""
        strategy = 'Buy Now' if price_forecast.get('trend') == 'bearish' else 'Buy Gradually'
        
        return {
            'supply_forecast': {
                'next_90_days_supply': f"{quantity_forecast.get('total_forecast_demand', 0):,.0f} quintals available" if 'total_forecast_demand' in quantity_forecast else 'Not available',
                'recommended_procurement': f"{quantity_forecast.get('total_forecast_demand', 0) * 1.2:,.0f} quintals (with 20% buffer)" if 'total_forecast_demand' in quantity_forecast else 'Monitor weekly'
            },
            'price_analysis': {
                'current_price': f"₹{price_forecast.get('current_price', 0):.2f}/quintal" if 'current_price' in price_forecast else 'Not available',
                'price_trend': price_forecast.get('trend', 'stable').upper(),
                'price_change_expected': f"{price_forecast.get('price_change_percent', 0):.1f}%" if 'price_change_percent' in price_forecast else '0%'
            },
            'procurement_strategy': {
                'recommendation': strategy,
                'reason': f"Prices are {price_forecast.get('trend', 'stable')}",
                'best_timing': 'Next 2 weeks' if strategy == 'Buy Now' else 'Spread over 4-6 weeks'
            },
            'crop_availability': [
                {
                    'crop': crop['crop_type'],
                    'available_quantity': f"{crop['total_quantity']:,.0f} quintals",
                    'average_price': f"₹{crop['avg_price']:.2f}/quintal"
                }
                for crop in crop_analysis.get('top_crops', [])[:5]
            ]
        }
    
    def _retailer_insights(self, quantity_forecast, price_forecast, crop_analysis):
        """Simple insights for retailers"""
        return {
            'product_availability': {
                'next_30_days': f"{quantity_forecast.get('total_forecast_demand', 0):,.0f} quintals expected" if 'total_forecast_demand' in quantity_forecast else 'Good availability',
                'supply_status': 'Sufficient' if quantity_forecast.get('current_trend') != 'decreasing' else 'Limited'
            },
            'pricing': {
                'current_market_price': f"₹{price_forecast.get('current_price', 0):.2f}/quintal" if 'current_price' in price_forecast else 'Not available',
                'expected_price_30_days': f"₹{price_forecast.get('forecast_avg_price', 0):.2f}/quintal" if 'forecast_avg_price' in price_forecast else 'Not available',
                'price_stability': 'Stable' if abs(price_forecast.get('price_change_percent', 0)) < 5 else 'Volatile'
            },
            'popular_products': [
                {
                    'product': crop['crop_type'],
                    'demand': f"{crop['market_share_percent']:.1f}% market share",
                    'price': f"₹{crop['avg_price']:.2f}/quintal"
                }
                for crop in crop_analysis.get('top_crops', [])[:5]
            ],
            'business_tip': {
                'message': 'Stock up on high-demand crops',
                'focus_products': [crop['crop_type'] for crop in crop_analysis.get('top_crops', [])[:3]]
            }
        }


# Individual analysis endpoints (optional - for advanced users)

class QuickPriceForecastAPIView(APIView):
    """Quick price forecast for all crops"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            extractor = MarketDataExtractor()
            data = extractor.get_combined_data(days_back=365, filters={})
            
            if not data:
                return Response({'success': False, 'message': 'No data available'}, status=404)
            
            df = extractor.to_dataframe(data)
            forecaster = MarketForecaster(df)
            forecast = forecaster.forecast_price_trend(days_ahead=30)
            
            # Simple format
            simple_forecast = {
                'current_price': f"₹{forecast.get('current_price', 0):.2f}",
                'expected_price_30_days': f"₹{forecast.get('forecast_avg_price', 0):.2f}",
                'trend': forecast.get('trend', 'stable').upper(),
                'change_percentage': f"{forecast.get('price_change_percent', 0):.1f}%",
                'recommendation': forecast.get('recommendation', 'Monitor market')
            }
            
            return Response({
                'success': True,
                'forecast': simple_forecast
            }, status=200)
            
        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=500)


class QuickDemandForecastAPIView(APIView):
    """Quick demand forecast for all crops"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            extractor = MarketDataExtractor()
            data = extractor.get_combined_data(days_back=365, filters={})
            
            if not data:
                return Response({'success': False, 'message': 'No data available'}, status=404)
            
            df = extractor.to_dataframe(data)
            forecaster = MarketForecaster(df)
            forecast = forecaster.forecast_demand_quantity(days_ahead=30)
            
            # Simple format
            simple_forecast = {
                'current_demand': f"{forecast.get('current_avg_demand', 0):,.0f} quintals/day",
                'expected_demand': f"{forecast.get('avg_daily_demand', 0):,.0f} quintals/day",
                'trend': forecast.get('current_trend', 'stable').upper(),
                'total_30_days': f"{forecast.get('total_forecast_demand', 0):,.0f} quintals"
            }
            
            return Response({
                'success': True,
                'forecast': simple_forecast
            }, status=200)
            
        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=500)


class TopCropsAPIView(APIView):
    """Show top crops by demand and price"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            extractor = MarketDataExtractor()
            data = extractor.get_combined_data(days_back=365, filters={})
            
            if not data:
                return Response({'success': False, 'message': 'No data available'}, status=404)
            
            df = extractor.to_dataframe(data)
            forecaster = MarketForecaster(df)
            analysis = forecaster.crop_wise_analysis(top_n=5)
            
            # Simple format
            top_crops = [
                {
                    'crop_name': crop['crop_type'],
                    'demand': f"{crop['total_quantity']:,.0f} quintals",
                    'price': f"₹{crop['avg_price']:.2f}/quintal",
                    'market_share': f"{crop['market_share_percent']:.1f}%"
                }
                for crop in analysis.get('top_crops', [])
            ]
            
            return Response({
                'success': True,
                'top_crops': top_crops,
                'highest_demand': analysis.get('highest_demand_crop'),
                'best_price': analysis.get('highest_price_crop')
            }, status=200)
            
        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=500)
