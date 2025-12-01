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
    # AUTHENTICATION & USER MANAGEMENT 
    # ==============================================================================
    path('api/users/', include('apps.users.urls')),  # JWT auth, register, login, logout
    
    # ==============================================================================
    # CORE FOUNDATION APPS 
    # ==============================================================================
    path('api/farmers/', include('apps.farmers.urls')),  # Farmer profiles, farms
    path('api/fpos/', include('apps.fpos.urls')),
    path('api/processors/', include('apps.processors.urls')),
    path('api/retailers/', include('apps.retailers.urls')),
]

# ==============================================================================
# MEDIA & STATIC FILES (Development Only)
# ==============================================================================

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    