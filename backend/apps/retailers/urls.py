"""Retailers URLs"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RetailerProfileViewSet, StoreViewSet

router = DefaultRouter()
router.register(r'profiles', RetailerProfileViewSet, basename='retailer-profile')
router.register(r'stores', StoreViewSet, basename='store')

app_name = 'retailers'
urlpatterns = [path('', include(router.urls))]
