"""
URL patterns for Farmers App
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FarmerProfileViewSet, FarmLandViewSet,
    CropPlanningViewSet, NearbyFPOAPIView
)

app_name = 'farmers'

router = DefaultRouter()
router.register('profiles', FarmerProfileViewSet, basename='farmer-profile')
router.register('farmlands', FarmLandViewSet, basename='farmland')
router.register('crop-plans', CropPlanningViewSet, basename='crop-plan')

urlpatterns = [
    path('', include(router.urls)),
    path('nearby-fpos/', NearbyFPOAPIView.as_view(), name='nearby-fpos'),
]
