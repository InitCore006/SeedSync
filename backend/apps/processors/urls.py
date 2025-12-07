"""
Processor URLs
All processor-related endpoints
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProcessorProfileAPIView,
    ProcessorDashboardAPIView,
    ProcessorBidsAPIView,
    ProcessorProcurementAPIView,
    ProcessingBatchesAPIView,
    ProcessorInventoryAPIView,
    ProcessingBatchViewSet,
    ProcessingPlantViewSet,
    ProcessingStageLogAPIView,
    FinishedProductAPIView,
    LotAvailabilityAPIView
)

app_name = 'processors'

# Router for ViewSets
router = DefaultRouter()
router.register(r'batches-management', ProcessingBatchViewSet, basename='batch-management')
router.register(r'plants', ProcessingPlantViewSet, basename='plant')

urlpatterns = [
    # Profile
    path('profile/', ProcessorProfileAPIView.as_view(), name='processor-profile'),
    
    # Dashboard
    path('dashboard/', ProcessorDashboardAPIView.as_view(), name='processor-dashboard'),
    
    # Bids management
    path('bids/', ProcessorBidsAPIView.as_view(), name='processor-bids'),
    
    # Procurement opportunities
    path('procurement/', ProcessorProcurementAPIView.as_view(), name='processor-procurement'),
    
    # Processing batches (legacy endpoint)
    path('batches/', ProcessingBatchesAPIView.as_view(), name='processor-batches'),
    
    # Inventory
    path('inventory/', ProcessorInventoryAPIView.as_view(), name='processor-inventory'),
    
    # Lot availability check
    path('lots/<uuid:lot_id>/availability/', LotAvailabilityAPIView.as_view(), name='lot-availability'),
    
    # Multi-stage processing endpoints
    path('batches/<uuid:batch_id>/stage-logs/', ProcessingStageLogAPIView.as_view(), name='batch-stage-logs'),
    path('finished-products/', FinishedProductAPIView.as_view(), name='finished-products'),
    
    # Include router URLs for batch management (CRUD + custom actions)
    path('', include(router.urls)),
]
