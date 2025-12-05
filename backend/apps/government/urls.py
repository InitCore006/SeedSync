"""Enhanced Government URLs"""
from django.urls import path
from .views import (
    NationalDashboardAPIView,
    StateHeatmapAPIView,
    FPOMonitoringAPIView,
    ApprovalQueueAPIView,
    ApproveRegistrationAPIView,
    RejectRegistrationAPIView
)

app_name = 'government'

urlpatterns = [
    path('dashboard/', NationalDashboardAPIView.as_view(), name='national-dashboard'),
    path('heatmap/', StateHeatmapAPIView.as_view(), name='state-heatmap'),
    path('fpo-monitoring/', FPOMonitoringAPIView.as_view(), name='fpo-monitoring'),
    path('approval-queue/', ApprovalQueueAPIView.as_view(), name='approval-queue'),
    path('approve/<uuid:user_id>/', ApproveRegistrationAPIView.as_view(), name='approve-registration'),
    path('reject/<uuid:user_id>/', RejectRegistrationAPIView.as_view(), name='reject-registration'),
]
