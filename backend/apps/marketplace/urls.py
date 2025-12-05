"""Marketplace URLs"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ListingViewSet, OrderViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r'listings', ListingViewSet, basename='listing')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'reviews', ReviewViewSet, basename='review')

app_name = 'marketplace'
urlpatterns = [path('', include(router.urls))]
