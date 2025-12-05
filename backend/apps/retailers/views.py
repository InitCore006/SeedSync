"""Retailers Views"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import RetailerProfile, Store
from .serializers import RetailerProfileSerializer, StoreSerializer

class RetailerProfileViewSet(viewsets.ModelViewSet):
    queryset = RetailerProfile.objects.filter(is_active=True)
    serializer_class = RetailerProfileSerializer
    permission_classes = [IsAuthenticated]

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.filter(is_active=True)
    serializer_class = StoreSerializer
    permission_classes = [IsAuthenticated]
