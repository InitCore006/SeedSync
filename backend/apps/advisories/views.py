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
#from .utils.market_insights_serializers import MarketInsightsResponseSerializer
from rest_framework import viewsets
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .disease_detector import detector_instance
import logging
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status


logger = logging.getLogger(__name__)




from .disease_detector import detector_instance


logger = logging.getLogger(__name__)


class DiseasePredictionAPIView(APIView):
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


#orders demand supply
class MarketInsightsViewSet(viewsets.ViewSet):
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
    
    def list(self, request):
        """
        Get comprehensive market insights for requested role
        
        Query Parameters:
        - role: 'fpo' | 'retailer' | 'processor' | 'trader' | 'exporter' (optional)
        """
        role = request.query_params.get('role', None)
        
        # Validate role if provided
        valid_roles = ['fpo', 'retailer', 'processor', 'farmer', 'exporter']
        if role and role.lower() not in valid_roles:
            return Response(
                {
                    'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}',
                    'received': role
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Fetch market insights from utility function
            insights = get_all_market_insights(role)
            
            return Response(
                insights,
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                {
                    'error': 'Failed to fetch market insights',
                    'details': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )