"""Enhanced Government URLs"""
from django.urls import path
from .views import (
    NationalDashboardAPIView,
    StateHeatmapAPIView,
    FPOMonitoringAPIView,
    ApprovalQueueAPIView,
    ApproveRegistrationAPIView,
    RejectRegistrationAPIView,
    FarmerRegistryAPIView,
    ProcessorMonitoringAPIView,
    RetailerAnalyticsAPIView,
    SupplyChainTrackingAPIView,
    ProcurementAnalyticsAPIView,
    MarketPricesAnalyticsAPIView,
    EntityLocationsAPIView,
)

app_name = 'government'

urlpatterns = [
    # Core Dashboard
    path('dashboard/', NationalDashboardAPIView.as_view(), name='national-dashboard'),
    path('heatmap/', StateHeatmapAPIView.as_view(), name='state-heatmap'),
    path('entity-locations/', EntityLocationsAPIView.as_view(), name='entity-locations'),
    
    # Monitoring & Analytics
    path('fpo-monitoring/', FPOMonitoringAPIView.as_view(), name='fpo-monitoring'),
    path('farmer-registry/', FarmerRegistryAPIView.as_view(), name='farmer-registry'),
    path('processor-monitoring/', ProcessorMonitoringAPIView.as_view(), name='processor-monitoring'),
    path('retailer-analytics/', RetailerAnalyticsAPIView.as_view(), name='retailer-analytics'),
    
    # Supply Chain & Procurement
    path('supply-chain-tracking/', SupplyChainTrackingAPIView.as_view(), name='supply-chain-tracking'),
    path('procurement-analytics/', ProcurementAnalyticsAPIView.as_view(), name='procurement-analytics'),
    path('market-prices/', MarketPricesAnalyticsAPIView.as_view(), name='market-prices'),
    
    # Approvals
    path('approval-queue/', ApprovalQueueAPIView.as_view(), name='approval-queue'),
    path('approve/<uuid:user_id>/', ApproveRegistrationAPIView.as_view(), name='approve-registration'),
    path('reject/<uuid:user_id>/', RejectRegistrationAPIView.as_view(), name='reject-registration'),
]
