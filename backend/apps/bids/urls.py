"""Bids URLs"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BidViewSet, BidAcceptanceViewSet

router = DefaultRouter()
router.register(r'bids', BidViewSet, basename='bid')
router.register(r'acceptances', BidAcceptanceViewSet, basename='bid-acceptance')

app_name = 'bids'
urlpatterns = [path('', include(router.urls))]
