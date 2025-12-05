"""Marketplace Views"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Listing, Order, Review
from .serializers import ListingSerializer, OrderSerializer, ReviewSerializer

class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.filter(is_active=True)
    serializer_class = ListingSerializer
    permission_classes = [IsAuthenticated]

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.filter(is_active=True)
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.filter(is_active=True)
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
