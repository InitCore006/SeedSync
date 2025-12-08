#app/advisories/urls.py

"""Advisories URL Configuration"""
from django.urls import path
from .views import (
    DiseasePredictionAPIView,
    MarketInsightsViewSet,
)

app_name = 'advisories'

urlpatterns = [
    path('disease-predict/', DiseasePredictionAPIView.as_view(), name='disease-prediction'),
    # path('market-insights/', MarketInsightsAPIView.as_view(), name='market-insights'),
    path('market-insights/', MarketInsightsViewSet.as_view({'get': 'list'}), name='market-insights'),
]