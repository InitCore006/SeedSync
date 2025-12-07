"""URL patterns for Farmers App - Consolidated """

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FarmerProfileViewSet, FarmLandViewSet, CropPlanningViewSet,
    NearbyFPOAPIView, MarketPricesAPIView, WeatherAdvisoryAPIView,
    CropDiseaseDetectionAPIView, YieldPredictionAPIView
)

app_name = 'farmers'

router = DefaultRouter()
router.register('profiles', FarmerProfileViewSet, basename='farmer-profile')
router.register('farmlands', FarmLandViewSet, basename='farmland')
router.register('crop-plans', CropPlanningViewSet, basename='crop-plan')

urlpatterns = [
    path('', include(router.urls)),
    
    # Farmer services
    path('nearby-fpos/', NearbyFPOAPIView.as_view(), name='nearby-fpos'),
    path('market-prices/', MarketPricesAPIView.as_view(), name='market-prices'),
    path('weather-advisory/', WeatherAdvisoryAPIView.as_view(), name='weather-advisory'),
    path('disease-detection/', CropDiseaseDetectionAPIView.as_view(), name='disease-detection'),
    path('yield-prediction/', YieldPredictionAPIView.as_view(), name='yield-prediction'),
]
