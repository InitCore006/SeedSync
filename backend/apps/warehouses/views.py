"""Warehouses Views"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Warehouse, Inventory, StockMovement, QualityCheck
from .serializers import WarehouseSerializer, InventorySerializer, StockMovementSerializer, QualityCheckSerializer

class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.filter(is_active=True)
    serializer_class = WarehouseSerializer
    permission_classes = [IsAuthenticated]

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.filter(is_active=True)
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated]

class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.filter(is_active=True)
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]

class QualityCheckViewSet(viewsets.ModelViewSet):
    queryset = QualityCheck.objects.filter(is_active=True)
    serializer_class = QualityCheckSerializer
    permission_classes = [IsAuthenticated]
