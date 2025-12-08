"""Retailers URLs"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RetailerProfileViewSet, 
    StoreViewSet,
    RetailerDashboardAPIView,
    RetailerOrderListCreateAPIView,
    RetailerOrderDetailAPIView,
    RetailerInventoryAPIView,
    RetailerSuppliersAPIView,
    RetailerQuickOrderAPIView,
    RetailerInvoiceDownloadAPIView
)

router = DefaultRouter()
router.register(r'profiles', RetailerProfileViewSet, basename='retailer-profile')
router.register(r'stores', StoreViewSet, basename='store')

app_name = 'retailers'
urlpatterns = [
    # Dashboard
    path('dashboard/', RetailerDashboardAPIView.as_view(), name='retailer-dashboard'),
    
    # Orders
    path('orders/', RetailerOrderListCreateAPIView.as_view(), name='retailer-orders'),
    path('orders/quick/', RetailerQuickOrderAPIView.as_view(), name='retailer-quick-order'),
    path('orders/<uuid:pk>/', RetailerOrderDetailAPIView.as_view(), name='retailer-order-detail'),
    path('orders/<uuid:pk>/invoice/', RetailerInvoiceDownloadAPIView.as_view(), name='retailer-invoice'),
    
    # Inventory
    path('inventory/', RetailerInventoryAPIView.as_view(), name='retailer-inventory'),
    
    # Suppliers
    path('suppliers/', RetailerSuppliersAPIView.as_view(), name='retailer-suppliers'),
    
    path('', include(router.urls))
]
