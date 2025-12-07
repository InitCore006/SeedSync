"""Advisories URL Configuration"""
from django.urls import path
from .views import (
    WeatherForecastAPIView,
    CropAdvisoryAPIView,
    PestDiseaseAlertAPIView,
    MarketInsightsAPIView,
    MarketInsightsViewSet,
)

app_name = 'advisories'

urlpatterns = [
    path('weather/', WeatherForecastAPIView.as_view(), name='weather-forecast'),
    path('crop-advisory/', CropAdvisoryAPIView.as_view(), name='crop-advisory'),
    path('pest-alerts/', PestDiseaseAlertAPIView.as_view(), name='pest-alerts'),
    # path('market-insights/', MarketInsightsAPIView.as_view(), name='market-insights'),
    path('market-insights/', MarketInsightsViewSet.as_view(), name='market-insights'),
]
