"""Warehouses URLs"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WarehouseViewSet, InventoryViewSet, StockMovementViewSet, QualityCheckViewSet

router = DefaultRouter()
router.register(r'warehouses', WarehouseViewSet, basename='warehouse')
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'stock-movements', StockMovementViewSet, basename='stock-movement')
router.register(r'quality-checks', QualityCheckViewSet, basename='quality-check')

app_name = 'warehouses'
urlpatterns = [path('', include(router.urls))]
