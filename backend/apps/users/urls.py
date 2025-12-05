"""
URL patterns for Users & Authentication
"""
from django.urls import path
from .views import (
    RegisterAPIView, SendOTPAPIView, VerifyOTPAPIView, 
    LoginAPIView, ProfileAPIView, ChangePasswordAPIView, LogoutAPIView
)

app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('send-otp/', SendOTPAPIView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPAPIView.as_view(), name='verify-otp'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    
    # Profile endpoints
    path('profile/', ProfileAPIView.as_view(), name='profile'),
    path('change-password/', ChangePasswordAPIView.as_view(), name='change-password'),
]
