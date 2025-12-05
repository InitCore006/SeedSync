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
    FPOWarehousesAPIView
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
]
