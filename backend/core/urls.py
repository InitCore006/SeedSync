"""
URL Configuration for SeedSync - AI-Enabled Oilseed Value Chain Platform
Smart India Hackathon 2024
Ministry of Agriculture & Farmers Welfare

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from rest_framework import permissions
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

# ==============================================================================
# ADMIN CUSTOMIZATION
# ==============================================================================

admin.site.site_header = "SeedSync Platform Administration"
admin.site.site_title = "SeedSync Admin Portal"
admin.site.index_title = "AI-Enabled Oilseed Value Chain Management"

# ==============================================================================
# API URL PATTERNS
# ==============================================================================

urlpatterns = [
    # ==============================================================================
    # ADMIN INTERFACE
    # ==============================================================================
    path('admin/', admin.site.urls),
    
    # ==============================================================================
    # API DOCUMENTATION (Swagger & ReDoc)
    # ==============================================================================
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/docs/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui-alt'),
    path('api/docs/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # ==============================================================================
    # AUTHENTICATION & USER MANAGEMENT (Phase 1 - Week 1)
    # ==============================================================================
    path('api/users/', include('apps.users.urls')),  # JWT auth, register, login, logout
    
    # ==============================================================================
    # CORE FOUNDATION APPS (Phase 1 - Week 1)
    # ==============================================================================
    path('api/farmers/', include('apps.farmers.urls')),  # Farmer profiles, farms
    # path('api/fpos/', include('apps.fpos.urls')),  # FPO management, membership
    # path('api/crops/', include('apps.crops.urls')),  # Crop master, prices, MSP
    # path('api/advisories/', include('apps.advisories.urls')),  # AI advisories, weather, pest detection
    
    # ==============================================================================
    # AI & ANALYTICS APPS (Phase 1 - Week 1)
    # ==============================================================================
    # path('api/demand-supply/', include('apps.demand_supply.urls')),  # Forecasting, market trends
    # path('api/analytics/', include('apps.analytics.urls')),  # Dashboards, KPIs, reports
    
    # ==============================================================================
    # OPERATIONS & SUPPLY CHAIN APPS (Phase 2 - Week 2)
    # ==============================================================================
    # path('api/procurement/', include('apps.procurement.urls')),  # Purchase orders, bidding
    # path('api/logistics/', include('apps.logistics.urls')),  # Shipments, vehicles, routes
    # path('api/warehouses/', include('apps.warehouses.urls')),  # Storage, inventory
    # path('api/processing/', include('apps.processing.urls')),  # Processing units, production
    
    # ==============================================================================
    # INNOVATION & DIFFERENTIATION APPS (Phase 3 - Week 3)
    # ==============================================================================
    # path('api/blockchain/', include('apps.blockchain.urls')),  # Traceability, QR codes
    # path('api/marketplace/', include('apps.marketplace.urls')),  # Listings, orders
    # path('api/finance/', include('apps.finance.urls')),  # Credit, loans, insurance
    # path('api/policy/', include('apps.policy_dashboard.urls')),  # Government dashboards
    
    # ==============================================================================
    # SUPPORT & INTEGRATION APPS (Phase 4 - Week 4)
    # ==============================================================================
    # path('api/notifications/', include('apps.notifications.urls')),  # Alerts, messages
    # path('api/integrations/', include('apps.integrations.urls')),  # External APIs
    # path('api/compliance/', include('apps.compliance.urls')),  # Certificates, audits
]

# ==============================================================================
# MEDIA & STATIC FILES (Development Only)
# ==============================================================================

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    