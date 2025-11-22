from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BatchViewSet, SupplyChainEventViewSet,
    QualityTestViewSet, ProductTraceViewSet
)

router = DefaultRouter()
router.register(r'batches', BatchViewSet, basename='batch')
router.register(r'events', SupplyChainEventViewSet, basename='event')
router.register(r'quality-tests', QualityTestViewSet, basename='qualitytest')
router.register(r'products', ProductTraceViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]