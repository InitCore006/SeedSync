from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, LoginView, LogoutView, ChangePasswordView,
    UserViewSet, ProfileView, UploadProfileImageView,
    PhoneVerificationView, VerifyRegistrationOTPView,
    ForgotPasswordView, ResetPasswordView
)

# Router for ViewSets
router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Profile Management
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/upload-image/', UploadProfileImageView.as_view(), name='upload_profile_image'),
    
    # Phone Verification
    path('send-otp/', PhoneVerificationView.as_view(), name='send_otp'),
    path('verify-registration-otp/', VerifyRegistrationOTPView.as_view(), name='verify_registration_otp'),
    
    # Password Reset
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    
    # ViewSet routes
    path('', include(router.urls)),
]