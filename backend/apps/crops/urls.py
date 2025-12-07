"""
URL Configuration for Crops App
Unified URLs combining Router-based ViewSets and custom APIViews
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # ViewSets
    CropMasterViewSet,
    CropVarietyViewSet,
    MandiPriceViewSet,
    MSPRecordViewSet,
    CropVarietyRequestViewSet,
    # APIViews
    CropMasterListAPIView,
    CropVarietiesByCodeAPIView,
    MandiPricesWithAggregatesAPIView,
    MSPRecordsDetailAPIView,
    PriceTrendAPIView,
    FetcheNAMPricesAPIView
)

# Router for ViewSets
router = DefaultRouter()
router.register(r'masters', CropMasterViewSet, basename='crop-master')
router.register(r'varieties', CropVarietyViewSet, basename='crop-variety')
router.register(r'mandi-prices', MandiPriceViewSet, basename='mandi-price')
router.register(r'msp', MSPRecordViewSet, basename='msp-record')
router.register(r'variety-requests', CropVarietyRequestViewSet, basename='variety-request')

app_name = 'crops'

urlpatterns = [
    # Router URLs (ViewSets)
    path('', include(router.urls)),
    
    # Custom APIView URLs
    path('master-list/', CropMasterListAPIView.as_view(), name='crop-master-list'),
    path('varieties-by-code/<str:crop_code>/', CropVarietiesByCodeAPIView.as_view(), name='crop-varieties-by-code'),
    path('prices/', MandiPricesWithAggregatesAPIView.as_view(), name='mandi-prices-aggregates'),
    path('msp-records/', MSPRecordsDetailAPIView.as_view(), name='msp-records-detail'),
    path('price-trend/', PriceTrendAPIView.as_view(), name='price-trend'),
    path('fetch-enam/', FetcheNAMPricesAPIView.as_view(), name='fetch-enam'),
]
