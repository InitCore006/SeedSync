"""
URL Configuration for Crops App
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CropMasterViewSet, CropVarietyViewSet, MandiPriceViewSet, MSPRecordViewSet

router = DefaultRouter()
router.register(r'masters', CropMasterViewSet, basename='crop-master')
router.register(r'varieties', CropVarietyViewSet, basename='crop-variety')
router.register(r'mandi-prices', MandiPriceViewSet, basename='mandi-price')
router.register(r'msp', MSPRecordViewSet, basename='msp-record')

app_name = 'crops'
urlpatterns = [
    path('', include(router.urls)),
]
