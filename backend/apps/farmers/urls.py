"""URL patterns for Farmers App - Consolidated """

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FarmerProfileViewSet, FarmLandViewSet, CropPlanningViewSet, CropPlanViewSet,
    NearbyFPOAPIView, MarketPricesAPIView, WeatherAdvisoryAPIView,
    CropDiseaseDetectionAPIView, YieldPredictionAPIView, FarmerJoinRequestsAPIView
)

app_name = 'farmers'

router = DefaultRouter()
router.register('profiles', FarmerProfileViewSet, basename='farmer-profile')
router.register('farmlands', FarmLandViewSet, basename='farmland')
router.register('crop-plans', CropPlanningViewSet, basename='crop-plan')
router.register('crop-plan', CropPlanViewSet, basename='cropplan')

urlpatterns = [
    path('', include(router.urls)),
    
    # Farmer services
    path('nearby-fpos/', NearbyFPOAPIView.as_view(), name='nearby-fpos'),
    path('join-requests/', FarmerJoinRequestsAPIView.as_view(), name='join-requests'),
    path('market-prices/', MarketPricesAPIView.as_view(), name='market-prices'),
    path('weather-advisory/', WeatherAdvisoryAPIView.as_view(), name='weather-advisory'),
    path('disease-detection/', CropDiseaseDetectionAPIView.as_view(), name='disease-detection'),
    path('yield-prediction/', YieldPredictionAPIView.as_view(), name='yield-prediction'),
]
