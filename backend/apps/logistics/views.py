"""Logistics Views"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import LogisticsPartner, Vehicle, Shipment
from .serializers import LogisticsPartnerSerializer, VehicleSerializer, ShipmentSerializer

class LogisticsPartnerViewSet(viewsets.ModelViewSet):
    queryset = LogisticsPartner.objects.filter(is_active=True)
    serializer_class = LogisticsPartnerSerializer
    permission_classes = [IsAuthenticated]

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.filter(is_active=True)
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]

class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.filter(is_active=True)
    serializer_class = ShipmentSerializer
    permission_classes = [IsAuthenticated]
