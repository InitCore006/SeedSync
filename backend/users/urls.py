from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView,
    UserProfileView,
    FarmerRegistrationViewSet,
    FarmerProfileViewSet,
    FPORegistrationViewSet,
    FPOProfileViewSet,
    ProcessorRegistrationViewSet,
    ProcessorProfileViewSet,
    RetailerRegistrationViewSet,
    RetailerProfileViewSet,
    LogisticsRegistrationViewSet,
    LogisticsProfileViewSet,
    GovernmentApprovalViewSet,
    GovernmentProfileViewSet,
    change_password,
    request_password_reset,
    reset_password_confirm,
    send_otp,
    verify_otp,
    get_dashboard_stats,
)

router = DefaultRouter()

# Farmer (Mobile App)
router.register(r'farmer-registration', FarmerRegistrationViewSet, basename='farmer-registration')
router.register(r'farmer-profiles', FarmerProfileViewSet, basename='farmer-profile')

# FPO (Web)
router.register(r'fpo-registration', FPORegistrationViewSet, basename='fpo-registration')
router.register(r'fpo-profiles', FPOProfileViewSet, basename='fpo-profile')

# Processor (Web)
router.register(r'processor-registration', ProcessorRegistrationViewSet, basename='processor-registration')
router.register(r'processor-profiles', ProcessorProfileViewSet, basename='processor-profile')

# Retailer (Web)
router.register(r'retailer-registration', RetailerRegistrationViewSet, basename='retailer-registration')
router.register(r'retailer-profiles', RetailerProfileViewSet, basename='retailer-profile')

# Logistics (Web)
router.register(r'logistics-registration', LogisticsRegistrationViewSet, basename='logistics-registration')
router.register(r'logistics-profiles', LogisticsProfileViewSet, basename='logistics-profile')

# Government
router.register(r'government-approvals', GovernmentApprovalViewSet, basename='government-approval')
router.register(r'government-profiles', GovernmentProfileViewSet, basename='government-profile')

urlpatterns = [
    # Authentication
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Password Management
    path('change-password/', change_password, name='change-password'),
    path('password-reset/request/', request_password_reset, name='password-reset-request'),
    path('password-reset/confirm/', reset_password_confirm, name='password-reset-confirm'),
    
    # OTP
    path('send-otp/', send_otp, name='send-otp'),
    path('verify-otp/', verify_otp, name='verify-otp'),
    
    # User Profile
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('dashboard-stats/', get_dashboard_stats, name='dashboard-stats'),
    
    # Router URLs
    path('', include(router.urls)),
]