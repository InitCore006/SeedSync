from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WarehouseViewSet, WarehouseSensorDataViewSet,
    ShipmentViewSet, RouteOptimizationViewSet, GPSTrackingLogViewSet
)

router = DefaultRouter()
router.register(r'warehouses', WarehouseViewSet, basename='warehouse')
router.register(r'sensors', WarehouseSensorDataViewSet, basename='sensor')
router.register(r'shipments', ShipmentViewSet, basename='shipment')
router.register(r'routes', RouteOptimizationViewSet, basename='route')
router.register(r'gps-logs', GPSTrackingLogViewSet, basename='gpslog')

urlpatterns = [
    path('', include(router.urls)),
]