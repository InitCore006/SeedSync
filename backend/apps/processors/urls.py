"""
Processor URLs
All processor-related endpoints
"""
from django.urls import path
from .views import (
    ProcessorProfileAPIView,
    ProcessorDashboardAPIView,
    ProcessorProcurementAPIView,
    ProcessingBatchesAPIView,
    ProcessorInventoryAPIView
)

app_name = 'processors'

urlpatterns = [
    # Profile
    path('profile/', ProcessorProfileAPIView.as_view(), name='processor-profile'),
    
    # Dashboard
    path('dashboard/', ProcessorDashboardAPIView.as_view(), name='processor-dashboard'),
    
    # Procurement opportunities
    path('procurement/', ProcessorProcurementAPIView.as_view(), name='processor-procurement'),
    
    # Processing batches
    path('batches/', ProcessingBatchesAPIView.as_view(), name='processor-batches'),
    
    # Inventory
    path('inventory/', ProcessorInventoryAPIView.as_view(), name='processor-inventory'),
]
