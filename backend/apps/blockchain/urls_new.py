"""Enhanced Blockchain URLs"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .additional_views import (
    GenerateQRCodeAPIView,
    TraceabilityAPIView,
    AddBlockchainTransactionAPIView,
    VerifyBlockchainAPIView,
    DownloadCertificateAPIView
)

app_name = 'blockchain'

urlpatterns = [
    path('generate-qr/', GenerateQRCodeAPIView.as_view(), name='generate-qr'),
    path('trace/<str:lot_number>/', TraceabilityAPIView.as_view(), name='trace-lot'),
    path('add-transaction/', AddBlockchainTransactionAPIView.as_view(), name='add-transaction'),
    path('verify/<str:lot_number>/', VerifyBlockchainAPIView.as_view(), name='verify-blockchain'),
    path('certificate/<str:lot_number>/', DownloadCertificateAPIView.as_view(), name='download-certificate'),
]
