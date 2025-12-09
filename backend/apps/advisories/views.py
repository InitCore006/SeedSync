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
        
        # Get all crops and their individual forecasts
        available_crops = df['crop_type'].unique().tolist()
        all_crop_forecasts = []
        
        for crop in available_crops:
            crop_price = forecaster.crop_specific_price_forecast(crop, days_ahead=30)
            crop_demand = forecaster.crop_specific_forecast(crop, days_ahead=30)
            
            if 'error' not in crop_price and 'error' not in crop_demand:
                all_crop_forecasts.append({
                    'crop_name': crop.capitalize(),
                    'price_forecast': {
                        'price_today': f"₹{crop_price['current_price']:.2f}/quintal",
                        'price_in_30_days': f"₹{crop_price['forecast_avg_price']:.2f}/quintal",
                        'expected_change': f"{crop_price['price_change_percent']:+.1f}%",
                        'price_trend': crop_price['trend'].upper(),
                        'our_recommendation': crop_price['recommendation']
                    },
                    'demand_forecast': {
                        'demand_today': f"{crop_demand['current_avg_demand']:,.0f} quintals/day",
                        'demand_in_30_days': f"{crop_demand['forecast_avg_demand']:,.0f} quintals/day",
                        'demand_trend': crop_demand['demand_trend'].upper(),
                        'total_expected_demand': f"{crop_demand['total_forecast']:,.0f} quintals"
                    }
                })
        
        # Base insights
        insights = {
            'market_overview': {
                #'total_business_value': f"₹{df['total_value_inr'].sum():,.0f}",
                'average_crop_price': f"₹{df['price_per_quintal_inr'].mean():.2f} per quintal",
                'total_quantity_traded': f"{df['quantity_quintals'].sum():,.0f} quintals",
                #'number_of_transactions': len(df)
            },
            'individual_crop_insights': all_crop_forecasts
        }
        
        # Role-specific insights
        if role == 'farmer':
            insights.update(self._farmer_insights(price_forecast, crop_analysis, seasonal, all_crop_forecasts))
        
        elif role == 'fpo':
            insights.update(self._fpo_insights(quantity_forecast, price_forecast, crop_analysis, all_crop_forecasts))
        
        elif role == 'processor':
            insights.update(self._processor_insights(quantity_forecast, price_forecast, crop_analysis, all_crop_forecasts))
        
        elif role == 'retailer':
            insights.update(self._retailer_insights(quantity_forecast, price_forecast, crop_analysis, all_crop_forecasts))
        
        return insights
    
    def _farmer_insights(self, price_forecast, crop_analysis, seasonal, all_crop_forecasts):
        """Simple insights for farmers - with individual crop recommendations"""
        
        # Generate crop-specific recommendations for farmers
        crop_recommendations = []
        for crop_data in all_crop_forecasts:
            price_trend = crop_data['price_forecast']['price_trend']
            price_change = crop_data['price_forecast']['expected_change']
            
            if price_trend == 'BULLISH':
                action = 'HOLD'
                advice = f"Wait for better prices - expected to rise"
            elif price_trend == 'BEARISH':
                action = 'SELL NOW'
                advice = f"Sell immediately - prices may decline"
            else:
                action = 'FLEXIBLE'
                advice = f"Stable prices - sell anytime convenient"
            
            crop_recommendations.append({
                'crop_name': crop_data['crop_name'],
                'what_to_do': action,
                'price_today': crop_data['price_forecast']['price_today'],
                'price_in_30_days': crop_data['price_forecast']['price_in_30_days'],
                'expected_change': price_change,
                'our_advice': advice
            })
        
        return {
            'recommendations_for_each_crop': crop_recommendations,
            'most_profitable_crops': [
                {
                    'crop_name': crop['crop_type'],
                    'current_price': f"₹{crop['avg_price']:.2f}/quintal",
                    'market_demand_share': f"{crop['market_share_percent']:.1f}% of total market"
                }
                for crop in crop_analysis.get('top_crops', [])[:3]
            ],
            'best_planting_season': seasonal.get('peak_season', 'rabi'),
            'seasonal_advice': seasonal.get('recommendation', 'Plant according to season')
        }
    
    def _fpo_insights(self, quantity_forecast, price_forecast, crop_analysis, all_crop_forecasts):
        """Simple insights for FPOs - with crop-wise procurement planning"""
        # Handle new forecast structure
        if 'overall_forecast' in quantity_forecast:
            qty_forecast = quantity_forecast['overall_forecast']
        else:
            qty_forecast = quantity_forecast
        
        if 'overall_forecast' in price_forecast:
            prc_forecast = price_forecast['overall_forecast']
        else:
            prc_forecast = price_forecast
        
        return {
            'how_much_to_procure': {
                'quantity_needed_60_days': f"{qty_forecast.get('total_forecast_demand', 0):,.0f} quintals",
                'daily_average_needed': f"{qty_forecast.get('avg_daily_demand', 0):.0f} quintals per day",
                'recommended_quantity_with_buffer': f"Plan to procure approximately {qty_forecast.get('total_forecast_demand', 0) * 1.15:,.0f} quintals (with 15% buffer)"
            },
            'price_trends_overview': {
                'average_price_now': f"₹{prc_forecast.get('current_price', 0):.2f}/quintal",
                'expected_price_60_days': f"₹{prc_forecast.get('forecast_avg_price', 0):.2f}/quintal",
                'market_trend': prc_forecast.get('trend', 'stable').upper()
            },
            'which_crops_to_focus': [
                {
                    'crop_name': crop['crop_type'],
                    'total_demand': f"{crop['total_quantity']:,.0f} quintals",
                    'average_price': f"₹{crop['avg_price']:.2f}/quintal",
                    'market_share': f"{crop['market_share_percent']:.1f}%"
                }
                for crop in crop_analysis.get('top_crops', [])[:5]
            ],
            'procurement_strategy': {
                'key_message': 'Focus on crops with high demand and good prices',
                'priority_crops_list': [crop['crop_type'] for crop in crop_analysis.get('top_crops', [])[:3]]
            }
        }
    
    def _processor_insights(self, quantity_forecast, price_forecast, crop_analysis, all_crop_forecasts):
        """Simple insights for processors - with crop-wise supply analysis"""
        # Handle new forecast structure
        if 'overall_forecast' in quantity_forecast:
            qty_forecast = quantity_forecast['overall_forecast']
        else:
            qty_forecast = quantity_forecast
        
        if 'overall_forecast' in price_forecast:
            prc_forecast = price_forecast['overall_forecast']
        else:
            prc_forecast = price_forecast
        
        strategy = 'Buy Now' if prc_forecast.get('trend') == 'bearish' else 'Buy Gradually'
        
        return {
            'expected_supply_availability': {
                'total_supply_90_days': f"{qty_forecast.get('total_forecast_demand', 0):,.0f} quintals available",
                'how_much_to_buy': f"{qty_forecast.get('total_forecast_demand', 0) * 1.2:,.0f} quintals (with 20% buffer)"
            },
            'price_analysis_for_procurement': {
                'price_now': f"₹{prc_forecast.get('current_price', 0):.2f}/quintal",
                'price_direction': prc_forecast.get('trend', 'stable').upper(),
                'expected_price_change': f"{prc_forecast.get('price_change_percent', 0):.1f}%"
            },
            'when_to_buy': {
                'our_recommendation': strategy,
                'why': f"Prices are {prc_forecast.get('trend', 'stable')}",
                'best_buying_time': 'Next 2 weeks' if strategy == 'Buy Now' else 'Spread over 4-6 weeks'
            },
            'available_crops_list': [
                {
                    'crop_name': crop['crop_type'],
                    'quantity_available': f"{crop['total_quantity']:,.0f} quintals",
                    'current_price': f"₹{crop['avg_price']:.2f}/quintal"
                }
                for crop in crop_analysis.get('top_crops', [])[:5]
            ]
        }
    
    def _retailer_insights(self, quantity_forecast, price_forecast, crop_analysis, all_crop_forecasts):
        """Simple insights for retailers - with crop-wise product availability"""
        # Handle new forecast structure
        if 'overall_forecast' in quantity_forecast:
            qty_forecast = quantity_forecast['overall_forecast']
        else:
            qty_forecast = quantity_forecast
        
        if 'overall_forecast' in price_forecast:
            prc_forecast = price_forecast['overall_forecast']
        else:
            prc_forecast = price_forecast
        
        return {
            'stock_availability_forecast': {
                'expected_supply_30_days': f"{qty_forecast.get('total_forecast_demand', 0):,.0f} quintals expected",
                'availability_status': 'Sufficient' if qty_forecast.get('current_trend') != 'decreasing' else 'Limited'
            },
            'pricing_information': {
                'market_price_today': f"₹{prc_forecast.get('current_price', 0):.2f}/quintal",
                'expected_price_in_30_days': f"₹{prc_forecast.get('forecast_avg_price', 0):.2f}/quintal",
                'price_stability_status': 'Stable' if abs(prc_forecast.get('price_change_percent', 0)) < 5 else 'Volatile'
            },
            'customer_favorite_products': [
                {
                    'product_name': crop['crop_type'],
                    'popularity': f"{crop['market_share_percent']:.1f}% market share",
                    'selling_price': f"₹{crop['avg_price']:.2f}/quintal"
                }
                for crop in crop_analysis.get('top_crops', [])[:5]
            ],
            'stocking_advice': {
                'suggestion': 'Stock up on high-demand crops',
                'recommended_products': [crop['crop_type'] for crop in crop_analysis.get('top_crops', [])[:3]]
            }
        }


# Individual analysis endpoints (optional - for advanced users)

class QuickPriceForecastAPIView(APIView):
    """Quick price forecast for all crops - shows individual crop forecasts"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            extractor = MarketDataExtractor()
            data = extractor.get_combined_data(days_back=365, filters={})
            
            if not data:
                return Response({'success': False, 'message': 'No data available'}, status=404)
            
            df = extractor.to_dataframe(data)
            forecaster = MarketForecaster(df)
            
            # Get all unique crops in the data
            available_crops = df['crop_type'].unique().tolist()
            
            # Get price forecast for each crop
            crop_forecasts = []
            for crop in available_crops:
                crop_forecast = forecaster.crop_specific_price_forecast(crop, days_ahead=30)
                
                if 'error' not in crop_forecast:
                    crop_forecasts.append({
                        'crop': crop.capitalize(),
                        'current_price': f"₹{crop_forecast['current_price']:.2f}/quintal",
                        'expected_price_30_days': f"₹{crop_forecast['forecast_avg_price']:.2f}/quintal",
                        'price_change': f"{crop_forecast['price_change_percent']:+.1f}%",
                        'trend': crop_forecast['trend'].upper(),
                        'recommendation': crop_forecast['recommendation'],
                        'price_range': {
                            'min': f"₹{crop_forecast['min_price_last_30_days']:.2f}",
                            'max': f"₹{crop_forecast['max_price_last_30_days']:.2f}"
                        }
                    })
            
            # Sort by crop name
            crop_forecasts.sort(key=lambda x: x['crop'])
            
            # Categorize by trend
            bullish = [c['crop'] for c in crop_forecasts if c['trend'] == 'BULLISH']
            bearish = [c['crop'] for c in crop_forecasts if c['trend'] == 'BEARISH']
            stable = [c['crop'] for c in crop_forecasts if c['trend'] == 'STABLE']
            
            return Response({
                'success': True,
                'total_crops': len(crop_forecasts),
                'forecasts': crop_forecasts,
                'market_summary': {
                    'bullish_crops': bullish,
                    'bearish_crops': bearish,
                    'stable_crops': stable
                },
                'quick_insights': {
                    'buy_now': bearish,  # Prices declining
                    'wait_for_better_prices': bullish,  # Prices rising
                    'neutral': stable  # Prices stable
                }
            }, status=200)
            
        except Exception as e:
            logger.error(f"Price forecast error: {str(e)}")
            return Response({'success': False, 'message': str(e)}, status=500)


class QuickDemandForecastAPIView(APIView):
    """Quick demand forecast for all crops - shows individual crop forecasts"""
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
            
            # Get all unique crops in the data
            available_crops = df['crop_type'].unique().tolist()
            
            # Get demand forecast for each crop
            crop_forecasts = []
            for crop in available_crops:
                crop_forecast = forecaster.crop_specific_forecast(crop, days_ahead=30)
                if 'error' not in crop_forecast:
                    crop_forecasts.append({
                        'crop': crop.capitalize(),
                        'current_demand': f"{crop_forecast['current_avg_demand']:,.0f} quintals/day",
                        'expected_demand': f"{crop_forecast['forecast_avg_demand']:,.0f} quintals/day",
                        'trend': crop_forecast['demand_trend'].upper(),
                        'total_30_days': f"{crop_forecast['total_forecast']:,.0f} quintals",
                        'demand_change': f"{((crop_forecast['forecast_avg_demand'] - crop_forecast['current_avg_demand']) / max(crop_forecast['current_avg_demand'], 1)) * 100:+.1f}%"
                    })
            
            # Categorize crops by trend
            increasing_crops = [c['crop'] for c in crop_forecasts if c['trend'] == 'INCREASING']
            decreasing_crops = [c['crop'] for c in crop_forecasts if c['trend'] == 'DECREASING']
            
            # Overall market summary
            overall_forecast = forecast.get('overall_forecast', forecast)
            market_summary = {
                'overall_current_demand': f"{overall_forecast.get('current_avg_demand', 0):,.0f} quintals/day",
                'overall_expected_demand': f"{overall_forecast.get('avg_daily_demand', 0):,.0f} quintals/day",
                'overall_trend': overall_forecast.get('current_trend', 'stable').upper(),
                'overall_total_30_days': f"{overall_forecast.get('total_forecast_demand', 0):,.0f} quintals"
            }
            
            return Response({
                'success': True,
                'crop_forecasts': crop_forecasts,
                'market_summary': market_summary,
                'insights': {
                    'increasing_demand': increasing_crops,
                    'decreasing_demand': decreasing_crops,
                    'total_crops': len(crop_forecasts)
                }
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


class CropSpecificPriceForecastAPIView(APIView):
    """Get price forecast for a specific crop"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        crop_type = request.query_params.get('crop_type', '').lower().strip()
        days_ahead = int(request.query_params.get('days', 30))
        
        if not crop_type:
            return Response({
                'success': False,
                'message': 'Please provide crop_type parameter',
                'example': '/api/advisories/crop-price-forecast/?crop_type=soybean&days=30'
            }, status=400)
        
        try:
            extractor = MarketDataExtractor()
            data = extractor.get_combined_data(days_back=365, filters={})
            
            if not data:
                return Response({'success': False, 'message': 'No data available'}, status=404)
            
            df = extractor.to_dataframe(data)
            forecaster = MarketForecaster(df)
            
            # Get crop-specific forecast
            forecast = forecaster.crop_specific_price_forecast(crop_type, days_ahead)
            
            if 'error' in forecast:
                return Response({
                    'success': False,
                    'message': forecast['error']
                }, status=404)
            
            # Format for easy understanding
            simple_forecast = {
                'crop': crop_type.capitalize(),
                'current_price': f"₹{forecast['current_price']:.2f}/quintal",
                'expected_price_in_{}_days'.format(days_ahead): f"₹{forecast['forecast_avg_price']:.2f}/quintal",
                'price_change': f"{forecast['price_change_percent']:+.1f}%",
                'trend': forecast['trend'].upper(),
                'recommendation': forecast['recommendation'],
                'price_range_last_30_days': {
                    'minimum': f"₹{forecast['min_price_last_30_days']:.2f}",
                    'maximum': f"₹{forecast['max_price_last_30_days']:.2f}"
                },
                'volatility': f"₹{forecast['volatility']:.2f}",
                'forecast_details': {
                    'values': forecast['forecast_values'][:7],  # Show first 7 days
                    'dates': forecast['forecast_dates'][:7]
                }
            }
            
            return Response({
                'success': True,
                'forecast': simple_forecast
            }, status=200)
            
        except Exception as e:
            logger.error(f"Crop price forecast error: {str(e)}")
            return Response({'success': False, 'message': str(e)}, status=500)


class AllCropsPriceForecastAPIView(APIView):
    """Get price forecasts for all major crops"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        days_ahead = int(request.query_params.get('days', 30))
        top_n = int(request.query_params.get('top_crops', 5))
        
        try:
            extractor = MarketDataExtractor()
            data = extractor.get_combined_data(days_back=365, filters={})
            
            if not data:
                return Response({'success': False, 'message': 'No data available'}, status=404)
            
            df = extractor.to_dataframe(data)
            forecaster = MarketForecaster(df)
            
            # Get all crops forecast
            all_forecasts = forecaster.all_crops_price_forecast(days_ahead, top_n)
            
            if 'error' in all_forecasts:
                return Response({
                    'success': False,
                    'message': all_forecasts['error']
                }, status=404)
            
            return Response({
                'success': True,
                'forecast_period': all_forecasts['forecast_period'],
                'crops_analyzed': all_forecasts['total_crops_analyzed'],
                'forecasts': all_forecasts['forecasts'],
                'market_summary': {
                    'bullish_crops': all_forecasts['summary']['bullish_crops'],
                    'bearish_crops': all_forecasts['summary']['bearish_crops'],
                    'stable_crops': all_forecasts['summary']['stable_crops']
                },
                'interpretation': {
                    'buy_now': all_forecasts['summary']['bearish_crops'],
                    'wait_for_better_prices': all_forecasts['summary']['bullish_crops'],
                    'neutral': all_forecasts['summary']['stable_crops']
                }
            }, status=200)
            
        except Exception as e:
            logger.error(f"All crops forecast error: {str(e)}")
            return Response({'success': False, 'message': str(e)}, status=500)