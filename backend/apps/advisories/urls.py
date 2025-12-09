"""Advisories URL Configuration"""
from django.urls import path
from .views import (
    DiseasePredictionAPIView,
    MarketForecastAPIView,
    QuickPriceForecastAPIView,
    QuickDemandForecastAPIView,
    TopCropsAPIView,
    CropSpecificPriceForecastAPIView,
    AllCropsPriceForecastAPIView,
)

"""GET /api/advisories/market-forecast/?role=farmer
GET /api/advisories/market-forecast/?role=fpo
GET /api/advisories/market-forecast/?role=processor
GET /api/advisories/market-forecast/?role=retailer
GET /api/advisories/quick/price/
GET /api/advisories/quick/demand/
GET /api/advisories/quick/top-crops/
GET /api/advisories/all-crops-forecast/?days=30&top_crops=5
GET /api/advisories/crop-forecast/?crop_type=sesame&days=30
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
    
    # Crop-Specific Forecasts
    path('all-crops-forecast/', AllCropsPriceForecastAPIView.as_view(), name='all-crops-forecast'),
    path('crop-forecast/', CropSpecificPriceForecastAPIView.as_view(), name='crop-forecast'),
]

