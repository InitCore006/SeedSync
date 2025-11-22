from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MarketPriceViewSet, PriceForecastViewSet,
    MarketListingViewSet, OrderViewSet
)

router = DefaultRouter()
router.register(r'prices', MarketPriceViewSet, basename='marketprice')
router.register(r'forecasts', PriceForecastViewSet, basename='priceforecast')
router.register(r'listings', MarketListingViewSet, basename='listing')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]