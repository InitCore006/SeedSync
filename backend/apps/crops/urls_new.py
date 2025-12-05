"""Enhanced Crops URLs"""
from django.urls import path
from .additional_views import (
    CropMasterListAPIView,
    CropVarietiesAPIView,
    MandiPricesAPIView,
    MSPRecordsAPIView,
    PriceTrendAPIView,
    FetcheNAMPricesAPIView
)

app_name = 'crops'

urlpatterns = [
    path('master/', CropMasterListAPIView.as_view(), name='crop-master-list'),
    path('varieties/<str:crop_code>/', CropVarietiesAPIView.as_view(), name='crop-varieties'),
    path('mandi-prices/', MandiPricesAPIView.as_view(), name='mandi-prices'),
    path('msp-records/', MSPRecordsAPIView.as_view(), name='msp-records'),
    path('price-trend/', PriceTrendAPIView.as_view(), name='price-trend'),
    path('fetch-enam/', FetcheNAMPricesAPIView.as_view(), name='fetch-enam'),
]
