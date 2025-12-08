"""Advisories URL Configuration"""
from django.urls import path
from .views import (
    DiseasePredictionAPIView,
    MarketForecastAPIView,
    QuickPriceForecastAPIView,
    QuickDemandForecastAPIView,
    TopCropsAPIView,
)

"""GET /api/advisories/market-forecast/?role=farmer
GET /api/advisories/market-forecast/?role=fpo
GET /api/advisories/market-forecast/?role=processor
GET /api/advisories/market-forecast/?role=retailer
GET /api/advisories/quick/price/
GET /api/advisories/quick/demand/
GET /api/advisories/quick/top-crops/
"""

app_name = 'advisories'

urlpatterns = [
    # Disease Prediction
    path('disease-predict/', DiseasePredictionAPIView.as_view(), name='disease-prediction'),
    
    # Main Market Forecast (Simple - Just Role Required)
    path('market-forecast/', MarketForecastAPIView.as_view(), name='market-forecast'),
    
    # Quick Insights (Optional)
    path('quick/price/', QuickPriceForecastAPIView.as_view(), name='quick-price'),
    path('quick/demand/', QuickDemandForecastAPIView.as_view(), name='quick-demand'),
    path('quick/top-crops/', TopCropsAPIView.as_view(), name='top-crops'),
]

