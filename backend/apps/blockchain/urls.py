"""Blockchain URLs"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlockchainTransactionViewSet, TraceabilityRecordViewSet, QRCodeViewSet

router = DefaultRouter()
router.register(r'transactions', BlockchainTransactionViewSet, basename='blockchain-transaction')
router.register(r'traceability', TraceabilityRecordViewSet, basename='traceability-record')
router.register(r'qr-codes', QRCodeViewSet, basename='qr-code')

app_name = 'blockchain'
urlpatterns = [path('', include(router.urls))]
