"""Enhanced Farmers URLs"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FarmerProfileViewSet,
    FarmLandViewSet,
    CropPlanningViewSet
)
from .additional_views import (
    MarketPricesAPIView,
    WeatherAdvisoryAPIView,
    CropDiseaseDetectionAPIView,
    YieldPredictionAPIView
)

app_name = 'farmers'

router = DefaultRouter()
router.register(r'profiles', FarmerProfileViewSet, basename='farmer-profile')
router.register(r'farmlands', FarmLandViewSet, basename='farmland')
router.register(r'crop-planning', CropPlanningViewSet, basename='crop-planning')

urlpatterns = [
    path('', include(router.urls)),
    path('market-prices/', MarketPricesAPIView.as_view(), name='market-prices'),
    path('weather-advisory/', WeatherAdvisoryAPIView.as_view(), name='weather-advisory'),
    path('disease-detection/', CropDiseaseDetectionAPIView.as_view(), name='disease-detection'),
    path('yield-prediction/', YieldPredictionAPIView.as_view(), name='yield-prediction'),
]
