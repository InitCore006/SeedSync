"""Logistics URLs - Consolidated"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LogisticsPartnerViewSet, VehicleViewSet, ShipmentViewSet

app_name = 'logistics'

router = DefaultRouter()
router.register('partners', LogisticsPartnerViewSet, basename='logistics-partner')
router.register('vehicles', VehicleViewSet, basename='vehicle')
router.register('shipments', ShipmentViewSet, basename='shipment')

urlpatterns = [
    path('', include(router.urls)),
]
