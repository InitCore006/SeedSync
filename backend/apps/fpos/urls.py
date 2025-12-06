"""
FPO URLs
All FPO-related endpoints
"""
from django.urls import path
from .views import (
    FPOProfileAPIView,
    FPODashboardAPIView,
    FPOMembersAPIView,
    FPOProcurementAPIView,
    FPOWarehousesAPIView,
    FPOBidsAPIView,
    FPOCreateFarmerAPIView,
    FPORemoveMemberAPIView,
    FPOCreateAggregatedLotAPIView
)

app_name = 'fpos'

urlpatterns = [
    # Profile
    path('profile/', FPOProfileAPIView.as_view(), name='fpo-profile'),
    
    # Dashboard
    path('dashboard/', FPODashboardAPIView.as_view(), name='fpo-dashboard'),
    
    # Members management
    path('members/', FPOMembersAPIView.as_view(), name='fpo-members'),
    
    # Procurement opportunities
    path('procurement/', FPOProcurementAPIView.as_view(), name='fpo-procurement'),
    
    # Warehouses
    path('warehouses/', FPOWarehousesAPIView.as_view(), name='fpo-warehouses'),
    
    # Bids management
    path('bids/', FPOBidsAPIView.as_view(), name='fpo-bids'),
    
    # Create farmer account
    path('create-farmer/', FPOCreateFarmerAPIView.as_view(), name='fpo-create-farmer'),
    
    # Remove member
    path('members/<uuid:membership_id>/remove/', FPORemoveMemberAPIView.as_view(), name='fpo-remove-member'),
    
    # Create aggregated lot
    path('create-aggregated-lot/', FPOCreateAggregatedLotAPIView.as_view(), name='fpo-create-aggregated-lot'),
]
