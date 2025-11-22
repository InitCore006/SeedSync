from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    # Authentication
    CustomTokenObtainPairView,
    change_password,
    request_password_reset,
    reset_password_confirm,
    
    # OTP
    send_otp,
    verify_otp,
    
    # User Profile
    UserProfileView,
    get_dashboard_stats,
    
    # FPO
    FPORegistrationViewSet,
    FPOProfileViewSet,
    
    # Processor
    ProcessorRegistrationViewSet,
    ProcessorProfileViewSet,
    
    # Retailer
    RetailerRegistrationViewSet,
    RetailerProfileViewSet,
    
    # Logistics
    LogisticsRegistrationViewSet,
    LogisticsProfileViewSet,
    
    # Government
    GovernmentApprovalViewSet,
    GovernmentProfileViewSet,
    
    # Farmer
    FarmerProfileViewSet,
)

app_name = 'users'

# Router for ViewSets
router = DefaultRouter()

# FPO Registration (Multi-step)
router.register(
    r'fpo-registration',
    FPORegistrationViewSet,
    basename='fpo-registration'
)

# FPO Profile Management
router.register(
    r'fpo-profiles',
    FPOProfileViewSet,
    basename='fpo-profiles'
)

# Processor Registration (Multi-step)
router.register(
    r'processor-registration',
    ProcessorRegistrationViewSet,
    basename='processor-registration'
)

# Processor Profile Management
router.register(
    r'processor-profiles',
    ProcessorProfileViewSet,
    basename='processor-profiles'
)

# Retailer Registration (Multi-step)
router.register(
    r'retailer-registration',
    RetailerRegistrationViewSet,
    basename='retailer-registration'
)

# Retailer Profile Management
router.register(
    r'retailer-profiles',
    RetailerProfileViewSet,
    basename='retailer-profiles'
)

# Logistics Registration (Multi-step)
router.register(
    r'logistics-registration',
    LogisticsRegistrationViewSet,
    basename='logistics-registration'
)

# Logistics Profile Management
router.register(
    r'logistics-profiles',
    LogisticsProfileViewSet,
    basename='logistics-profiles'
)

# Government Approval Management
router.register(
    r'government/approvals',
    GovernmentApprovalViewSet,
    basename='government-approvals'
)

# Government Profile
router.register(
    r'government-profiles',
    GovernmentProfileViewSet,
    basename='government-profiles'
)

# Farmer Profile (Mobile App)
router.register(
    r'farmer-profiles',
    FarmerProfileViewSet,
    basename='farmer-profiles'
)

urlpatterns = [
    # ========================================================================
    # AUTHENTICATION & TOKEN MANAGEMENT
    # ========================================================================
    
    # JWT Token Endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Password Management
    path('auth/password/change/', change_password, name='password-change'),
    path('auth/password/reset/', request_password_reset, name='password-reset-request'),
    path('auth/password/reset/confirm/', reset_password_confirm, name='password-reset-confirm'),
    
    # ========================================================================
    # OTP VERIFICATION
    # ========================================================================
    
    path('otp/send/', send_otp, name='send-otp'),
    path('otp/verify/', verify_otp, name='verify-otp'),
    
    # ========================================================================
    # USER PROFILE & DASHBOARD
    # ========================================================================
    
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('dashboard/stats/', get_dashboard_stats, name='dashboard-stats'),
    
    # ========================================================================
    # ROUTER-BASED URLS (ViewSets)
    # ========================================================================
    
    path('', include(router.urls)),
]




