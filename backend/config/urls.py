"""
SeedSync Backend API - Main URL Configuration

Indian Oilseed Value Chain Platform
Smart India Hackathon 2025
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Endpoints
    path('api/users/', include('apps.users.urls')),
    path('api/farmers/', include('apps.farmers.urls')),
    path('api/fpos/', include('apps.fpos.urls')),
    path('api/lots/', include('apps.lots.urls')),
    path('api/bids/', include('apps.bids.urls')),
    path('api/blockchain/', include('apps.blockchain.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/processors/', include('apps.processors.urls')),
    path('api/retailers/', include('apps.retailers.urls')),
    path('api/logistics/', include('apps.logistics.urls')),
    path('api/warehouses/', include('apps.warehouses.urls')),
    path('api/marketplace/', include('apps.marketplace.urls')),
    path('api/crops/', include('apps.crops.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/government/', include('apps.government.urls')),
    path('api/advisories/', include('apps.advisories.urls')),  # New endpoints
    
    # JWT Token Refresh
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Admin site customization
admin.site.site_header = "SeedSync Administration"
admin.site.site_title = "SeedSync Admin"
admin.site.index_title = "Welcome to SeedSync Admin Portal"

