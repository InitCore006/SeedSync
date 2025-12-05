"""Logistics URLs"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LogisticsPartnerViewSet, VehicleViewSet, ShipmentViewSet

router = DefaultRouter()
router.register(r'partners', LogisticsPartnerViewSet, basename='logistics-partner')
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'shipments', ShipmentViewSet, basename='shipment')

app_name = 'logistics'
urlpatterns = [path('', include(router.urls))]
